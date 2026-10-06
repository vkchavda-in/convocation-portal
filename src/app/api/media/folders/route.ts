import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/media/folders — list all folders with file count & total size
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isTrash = searchParams.get('trash') === 'true';

    const folders = await (prisma as any).mediaFolder.findMany({
      where: { isTrash },
      orderBy: isTrash ? { trashedAt: 'desc' } : { createdAt: 'asc' },
      include: {
        _count: { select: { media: { where: { isTrash: false } } } },
        media: { where: { isTrash: false }, select: { size: true } },
      },
    });
    const result = folders.map((f: any) => ({
      id: f.id, name: f.name, slug: f.slug, icon: f.icon, color: f.color,
      description: f.description, parentId: f.parentId,
      fileCount: f._count.media,
      totalSize: f.media.reduce((s: number, m: any) => s + (m.size || 0), 0),
      isTrash: f.isTrash,
      trashedAt: f.trashedAt,
      createdAt: f.createdAt, updatedAt: f.updatedAt,
    }));
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('GET /api/media/folders error:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

// POST /api/media/folders — create a new folder (strict DAL auth)
export async function POST(request: Request) {
  const { user, errorResponse } = await requirePermission(request, 'upload_media');
  if (errorResponse) {
    const fallback = await requirePermission(request, 'view_media');
    if (fallback.errorResponse) return errorResponse;
  }

  try {
    const body = await request.json();
    const { name, icon = 'folder', color = '#2563EB', description, parentId } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = base; let attempt = 0;
    while (true) {
      const existing = await (prisma as any).mediaFolder.findUnique({ where: { slug } });
      if (!existing) break;
      attempt++; slug = `${base}-${attempt}`;
    }
    const folder = await (prisma as any).mediaFolder.create({
      data: { name: name.trim(), slug, icon, color, description: description || null, parentId: parentId || null },
    });
    await logAction(request, {
      action: 'CREATE',
      entity: 'MediaFolder',
      entityId: folder.id,
      details: { name: folder.name, slug: folder.slug },
      user,
    });
    return NextResponse.json({ ...folder, fileCount: 0, totalSize: 0 }, { status: 201 });
  } catch (error) {
    console.error('POST /api/media/folders error:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
