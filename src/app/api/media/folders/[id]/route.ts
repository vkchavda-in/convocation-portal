import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams { params: Promise<{ id: string }>; }

async function getAllDescendantFolderIds(folderId: string): Promise<string[]> {
  const ids: string[] = [folderId];
  const children = await (prisma as any).mediaFolder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });
  for (const child of children) {
    const subIds = await getAllDescendantFolderIds(child.id);
    ids.push(...subIds);
  }
  return ids;
}

// PATCH /api/media/folders/[id] — rename, update, or restore folder
export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requirePermission(request, 'upload_media');
  if (errorResponse) {
    const fallback = await requirePermission(request, 'delete_media');
    if (fallback.errorResponse) return errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon, color, description, parentId, restore } = body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    
    if (restore === true) {
      const allFolderIds = await getAllDescendantFolderIds(id);
      await (prisma as any).mediaFolder.updateMany({
        where: { id: { in: allFolderIds } },
        data: { isTrash: false, trashedAt: null },
      });
      await (prisma as any).media.updateMany({
        where: { folderId: { in: allFolderIds } },
        data: { isTrash: false, trashedAt: null },
      });
      updateData.isTrash = false;
      updateData.trashedAt = null;
    }

    const folder = await (prisma as any).mediaFolder.update({ where: { id }, data: updateData });

    await logAction(request, {
      action: restore ? 'STATUS_CHANGE' : 'UPDATE',
      entity: 'MediaFolder',
      entityId: id,
      details: {
        restored: restore === true,
        name: folder.name,
      },
      user,
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('PATCH /api/media/folders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

// DELETE /api/media/folders/[id] — move folder to trash or permanently delete
export async function DELETE(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requirePermission(request, 'delete_media');
  if (errorResponse) {
    const fallback = await requirePermission(request, 'upload_media');
    if (fallback.errorResponse) return errorResponse;
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const folder = await (prisma as any).mediaFolder.findUnique({ where: { id } });
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });

    const allFolderIds = await getAllDescendantFolderIds(id);

    if (permanent) {
      const allMedia = await (prisma as any).media.findMany({
        where: { folderId: { in: allFolderIds } },
        select: { id: true, url: true, filename: true },
      });

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      for (const m of allMedia) {
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

      await (prisma as any).media.deleteMany({ where: { folderId: { in: allFolderIds } } });
      await (prisma as any).mediaFolder.deleteMany({ where: { id: { in: allFolderIds } } });
      await logAction(request, {
        action: 'DELETE',
        entity: 'MediaFolder',
        entityId: id,
        details: { name: folder.name, permanent: true },
        user,
      });
    } else {
      await (prisma as any).mediaFolder.updateMany({
        where: { id: { in: allFolderIds } },
        data: { isTrash: true, trashedAt: new Date() },
      });
      await (prisma as any).media.updateMany({
        where: { folderId: { in: allFolderIds } },
        data: { isTrash: true, trashedAt: new Date() },
      });
      await logAction(request, {
        action: 'STATUS_CHANGE',
        entity: 'MediaFolder',
        entityId: id,
        details: { status: 'TRASHED', name: folder.name },
        user,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/media/folders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
