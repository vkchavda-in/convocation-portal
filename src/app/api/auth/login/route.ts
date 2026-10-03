import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { JWT_SECRET } from '@/lib/config';
import {
  getClientIp,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {
    // 1. Check Rate Limit (Anti-Brute Force Protection)
    const rateCheck = checkLoginRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${rateCheck.resetSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    // 2. Validate Request Body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const { username, password } = validation.data;

    // 3. Authenticate User
    const userCount = await prisma.user.count();
    let user;

    if (userCount === 0) {
      // Seed mode: check against environment variable
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        return NextResponse.json(
          { error: 'Admin credentials not configured in environment' },
          { status: 500 }
        );
      }

      if (username !== adminUsername) {
        recordFailedLogin(clientIp);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const passwordMatch = adminPassword.startsWith('$2')
        ? await bcrypt.compare(password, adminPassword)
        : password === adminPassword;

      if (!passwordMatch) {
        recordFailedLogin(clientIp);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Automatically seed the first SUPER_ADMIN user
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
    } else {
      // Standard database authentication
      user = await prisma.user.findUnique({
        where: { username },
      });

      // To prevent user enumeration timing attacks, run bcrypt compare even if user not found
      const dummyHash = '$2a$12$e8Y4J/1k8e0b6gN9wV2wYe7pUuN5qN8mK6fW0vQ2yX5bC1rS3tZ2a';
      const hashToCompare = user?.passwordHash || dummyHash;
      const passwordMatch = await bcrypt.compare(password, hashToCompare);

      if (!user || !user.isActive || !passwordMatch) {
        recordFailedLogin(clientIp);
        return NextResponse.json(
          { error: 'Invalid credentials or inactive account' },
          { status: 401 }
        );
      }
    }

    // Login successful — clear failed attempt count
    clearLoginRateLimit(clientIp);

    // 4. Issue Cryptographically Secure JWT
    const jti = crypto.randomUUID();
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // 5. Secure httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = request.url.startsWith('https://') || isProduction;

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login security error:', error);
    return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
  }
}
