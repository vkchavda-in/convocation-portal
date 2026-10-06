import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { user, errorResponse } = await requirePermission(request, 'delete_media');
  if (errorResponse) {
    const fallback = await requirePermission(request, 'upload_media');
    if (fallback.errorResponse) return errorResponse;
  }

  try {
    const trashedMedia = await (prisma as any).media.findMany({
      where: { isTrash: true },
      select: { id: true, url: true, filename: true },
    });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    for (const m of trashedMedia) {
      try {
        const fn = path.basename(m.url);
        const p = path.join(uploadsDir, fn);
        if (existsSync(p)) await unlink(p).catch(() => {});
        const ext = path.extname(fn);
        const base = path.basename(fn, ext);
        await Promise.all([
          unlink(path.join(uploadsDir, `${base}.webp`)).catch(() => {}),
          unlink(path.join(uploadsDir, `${base}.avif`)).catch(() => {}),
        ]);
      } catch {}
    }

    const deletedFiles = await (prisma as any).media.deleteMany({
      where: { isTrash: true },
    });

    const deletedFolders = await (prisma as any).mediaFolder.deleteMany({
      where: { isTrash: true },
    });

    await logAction(request, {
      action: 'DELETE',
      entity: 'Media',
      entityId: 'empty_trash',
      details: {
        message: 'Emptied media trash bin',
        deletedFilesCount: deletedFiles.count,
        deletedFoldersCount: deletedFolders.count,
      },
      user,
    });

    return NextResponse.json({
      success: true,
      deletedFiles: deletedFiles.count,
      deletedFolders: deletedFolders.count,
    });
  } catch (error) {
    console.error('POST /api/media/empty-trash error:', error);
    return NextResponse.json({ error: 'Failed to empty trash' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  return POST(request);
}
