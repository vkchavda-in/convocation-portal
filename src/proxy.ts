import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';

// Define role-based access rules for admin routes
const rolePermissions = {
  SUPER_ADMIN: ['*'], // Can access everything
  ADMIN: [
    '/admin',
    '/admin/pages',
    '/admin/media',
    '/admin/global',
    '/admin/settings',
    '/admin/theme',
    '/admin/users',
  ],
  EDITOR: ['/admin', '/admin/pages', '/admin/media'],
};

// Paths that are fully public and do not require authentication
const publicPaths = [
  '/admin/login',
  '/api/auth/login',
  '/api/auth/logout',
];

// Public read-only API paths
const publicReadOnlyApiPrefixes = [
  '/api/global',
  '/api/settings',
  '/api/pages',
  '/api/media',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Sanitize incoming request headers:
  // Strictly remove any client-supplied internal security headers to prevent spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-authenticated-user');

  // 2. Only process /admin and /api routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 3. Allow public bypass paths (login, logout)
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 4. For GET requests on public read-only API routes, allow access without token
  if (
    request.method === 'GET' &&
    publicReadOnlyApiPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 5. CSRF Protection for state-modifying requests (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        // Allow exact host or localhost during development
        if (originHost !== host && !originHost.includes('localhost') && !originHost.includes('127.0.0.1')) {
          return NextResponse.json({ error: 'CSRF validation failed: invalid origin.' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'CSRF validation failed: malformed origin.' }, { status: 403 });
      }
    }
  }

  // 6. Extract token from cookie or Authorization header
  const token =
    request.cookies.get('admin-token')?.value ||
    (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization')!.slice(7).trim()
      : undefined);

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  // 7. Verify JWT token signature and expiration
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = (payload.role as string) || 'EDITOR';
    const userId = (payload.userId as string) || '';

    // RBAC Check for Admin Web Routes
    if (pathname.startsWith('/admin')) {
      let hasAccess = false;

      if (userRole === 'SUPER_ADMIN') {
        hasAccess = true;
      } else if (userRole === 'ADMIN') {
        hasAccess = rolePermissions.ADMIN.some(
          (p) => pathname === p || pathname.startsWith(p + '/')
        );
      } else if (userRole === 'EDITOR') {
        hasAccess = rolePermissions.EDITOR.some(
          (p) => pathname === p || pathname.startsWith(p + '/')
        );
      }

      if (!hasAccess) {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = '/admin';
        return NextResponse.redirect(adminUrl);
      }
    }

    // RBAC Check for User Management API
    if (pathname.startsWith('/api/users') && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    // Attach verified user identity to internal request headers
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-id', userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // Token is invalid or expired
    if (pathname.startsWith('/api')) {
      const resp = NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
      resp.cookies.delete('admin-token');
      return resp;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    const resp = NextResponse.redirect(loginUrl);
    resp.cookies.delete('admin-token');
    return resp;
  }
}

// Next.js 16 proxy convention
export default proxy;
export const middleware = proxy;

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
