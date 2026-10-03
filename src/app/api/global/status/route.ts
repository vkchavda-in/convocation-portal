import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [headerSetting, footerSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'global_header' }, select: { updatedAt: true } }),
      prisma.setting.findUnique({ where: { key: 'global_footer' }, select: { updatedAt: true } }),
    ]);

    return NextResponse.json({
      lastUpdatedHeader: headerSetting?.updatedAt?.toISOString() || null,
      lastUpdatedFooter: footerSetting?.updatedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('GET /api/global/status error:', error);
    return NextResponse.json({ error: 'Failed to fetch global status' }, { status: 500 });
  }
}
