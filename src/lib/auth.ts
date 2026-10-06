import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id?: string;
  userId: string;
  username: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | string;
  permissions?: string[];
  clientIp?: string;
  userAgent?: string;
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

    const role = String(payload.role);
    const permissions: string[] =
      role === 'SUPER_ADMIN'
        ? [
            'view_dashboard',
            'view_pages', 'create_pages', 'edit_pages', 'delete_pages',
            'view_media', 'upload_media', 'delete_media',
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'manage_global', 'manage_theme', 'manage_settings'
          ]
        : [
            'view_dashboard',
            'view_pages', 'create_pages', 'edit_pages',
            'view_media', 'upload_media'
          ];

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const user: AuthUser = {
      id: String(payload.userId),
      userId: String(payload.userId),
      username: String(payload.username || ''),
      name: String(payload.name || payload.username || ''),
      role: role as AuthUser['role'],
      permissions,
      clientIp,
      userAgent,
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

/**
 * getAuthUser compatible with Goa_New routes
 */
export async function getAuthUser(request?: Request): Promise<{ user: AuthUser | null; error: string | null; status: number }> {
  if (!request) {
    return { user: null, error: 'No request provided', status: 401 };
  }
  const result = await verifySession(request);
  if (!result.authorized || !result.user) {
    return { user: null, error: result.error || 'Unauthorized', status: result.status };
  }
  return { user: result.user, error: null, status: 200 };
}

/**
 * Strict permission guard for API Route handlers
 */
export async function requirePermission(
  request: Request,
  permissionKey?: string
): Promise<{ user: AuthUser | null; errorResponse: NextResponse | null }> {
  const { user, error, status } = await getAuthUser(request);

  if (!user || error) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 }),
    };
  }

  // Super Admin has unrestricted bypass
  if (user.role === 'SUPER_ADMIN') {
    return { user, errorResponse: null };
  }

  // If a specific permission is requested, check permissions array
  if (permissionKey && user.permissions && !user.permissions.includes(permissionKey)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: `Forbidden: You lack the required permission ('${permissionKey}') for this action.` },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export async function requireAuth(
  request: Request
): Promise<{ user: AuthUser | null; errorResponse: NextResponse | null }> {
  return requirePermission(request);
}
