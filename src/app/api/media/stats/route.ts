import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allMedia = await (prisma as any).media.findMany({
      where: { isTrash: false },
      select: { size: true, mimeType: true, folderId: true },
    });

    const totalSize = allMedia.reduce((s: number, m: any) => s + (m.size || 0), 0);
    const totalFiles = allMedia.length;

    const byType = {
      images: allMedia.filter((m: any) => m.mimeType.startsWith('image/')).reduce((s: number, m: any) => s + m.size, 0),
      videos: allMedia.filter((m: any) => m.mimeType.startsWith('video/')).reduce((s: number, m: any) => s + m.size, 0),
      documents: allMedia.filter((m: any) => !m.mimeType.startsWith('image/') && !m.mimeType.startsWith('video/')).reduce((s: number, m: any) => s + m.size, 0),
    };

    const rootFiles = allMedia.filter((m: any) => !m.folderId).length;

    return NextResponse.json({ totalSize, totalFiles, byType, rootFiles }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('GET /api/media/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
