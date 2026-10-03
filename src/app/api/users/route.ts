import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CreateUserSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  name: z.string().trim().min(1).max(60),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
  if (!auth.authorized) return auth.response!;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
  if (!auth.authorized || !auth.user) return auth.response!;

  try {
    const rawData = await request.json();
    const validation = CreateUserSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid user data' },
        { status: 400 }
      );
    }

    const { username, password, name, role, isActive } = validation.data;

    // Privilege check: Only SUPER_ADMIN can create another SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admins can assign the SUPER_ADMIN role' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        name,
        role,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
