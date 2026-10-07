import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';
import { processMediaInBackground } from '@/lib/media-processor';

export const dynamic = 'force-dynamic';

// Auto-purge items in trash older than 30 days
async function purgeExpiredTrash() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredMedia = await (prisma as any).media.findMany({
      where: { isTrash: true, trashedAt: { lte: thirtyDaysAgo } },
      select: { id: true, url: true, filename: true },
    });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    for (const m of expiredMedia) {
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

    await (prisma as any).media.deleteMany({
      where: { isTrash: true, trashedAt: { lte: thirtyDaysAgo } },
    });
    await (prisma as any).mediaFolder.deleteMany({
      where: { isTrash: true, trashedAt: { lte: thirtyDaysAgo } },
    });
  } catch (e) {
    // Non-blocking cleanup error
  }
}

// Auto-repair any legacy media records with /files/ URLs
async function healLegacyMediaUrls() {
  try {
    const legacyMedia = await (prisma as any).media.findMany({
      where: { url: { startsWith: '/files/' } },
      select: { id: true, filename: true },
    });

    for (const item of legacyMedia) {
      if (item.filename) {
        await (prisma as any).media.update({
          where: { id: item.id },
          data: { url: `/uploads/${item.filename}` },
        });
      }
    }
  } catch {}
}

// GET /api/media - List all media (optionally filtered by folderId or trash)
export async function GET(request: Request) {
  try {
    // Run background trash expiration and legacy URL healing
    purgeExpiredTrash();
    healLegacyMediaUrls();

    const { searchParams } = new URL(request.url);
    const isTrash = searchParams.get('trash') === 'true';
    const folderId = searchParams.get('folderId'); // 'null' string = root, undefined = all

    const where: any = { isTrash };
    if (!isTrash) {
      if (folderId === 'null') where.folderId = null;
      else if (folderId) where.folderId = folderId;
    }

    const media = await (prisma as any).media.findMany({
      where,
      orderBy: isTrash ? { trashedAt: 'desc' } : { createdAt: 'desc' },
    });
    return NextResponse.json(media, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST /api/media - Upload a file (Instant raw upload + Background processing)
export async function POST(request: Request) {
  const { user, errorResponse } = await requirePermission(request, 'upload_media');
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = (formData.get('alt') as string) || '';
    const folderId = (formData.get('folderId') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate clean opaque token and standard filename
    const ext = path.extname(file.name).toLowerCase();
    const token = randomBytes(16).toString('hex');
    const filename = `${token}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // 1. Instantly write raw original file to disk so it can be served immediately
    await writeFile(filePath, buffer);

    // 2. Instantly register in database with clean secure /media/ URL
    const media = await (prisma as any).media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: `/media/${filename}`,
        alt,
        folderId: folderId || null,
      },
    });

    // 3. Trigger asynchronous background processing (like YouTube)
    // Generates WebP, AVIF, and responsive sizes without holding up client response
    processMediaInBackground(media.id, filePath, buffer);

    await logAction(request, {
      action: 'CREATE',
      entity: 'Media',
      entityId: media.id,
      details: { filename: media.filename, originalName: media.originalName, mimeType: media.mimeType, size: file.size },
      user,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('POST /api/media error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
