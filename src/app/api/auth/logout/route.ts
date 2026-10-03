import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = request.url.startsWith('https://') || isProduction;

  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
