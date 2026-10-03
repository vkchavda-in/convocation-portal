import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';

export interface AuthUser {
  userId: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
}

export interface VerifyAuthResult {
  authorized: boolean;
  user?: AuthUser;
  error?: string;
  status: number;
}

/**
 * Extracts and cryptographically verifies the JWT session token from request cookies or Authorization header
 */
export async function verifySession(request: Request): Promise<VerifyAuthResult> {
  try {
    let token: string | undefined;

    // 1. Try extracting from cookie header
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const adminCookie = cookies.find((c) => c.startsWith('admin-token='));
    if (adminCookie) {
      token = adminCookie.slice('admin-token='.length);
    }

    // 2. Fallback to Authorization: Bearer <token>
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return {
        authorized: false,
        error: 'Authentication required. Please sign in.',
        status: 401,
      };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload || !payload.userId || !payload.role) {
      return {
        authorized: false,
        error: 'Invalid session payload',
        status: 401,
      };
    }

    const user: AuthUser = {
      userId: String(payload.userId),
      username: String(payload.username || ''),
      role: payload.role as AuthUser['role'],
    };

    return {
      authorized: true,
      user,
      status: 200,
    };
  } catch (err: any) {
    return {
      authorized: false,
      error: 'Session expired or invalid. Please sign in again.',
      status: 401,
    };
  }
}

/**
 * Convenience helper to enforce required roles in API routes
 */
export async function requireRole(
  request: Request,
  allowedRoles: Array<AuthUser['role']>
): Promise<{ authorized: boolean; user?: AuthUser; response?: NextResponse }> {
  const result = await verifySession(request);

  if (!result.authorized || !result.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: result.error || 'Unauthorized' },
        { status: result.status }
      ),
    };
  }

  if (!allowedRoles.includes(result.user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Insufficient privileges for this action.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: result.user,
  };
}
