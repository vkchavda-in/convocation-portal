import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifySession(request);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    role: auth.user.role,
    userId: auth.user.userId,
    username: auth.user.username,
  });
}
