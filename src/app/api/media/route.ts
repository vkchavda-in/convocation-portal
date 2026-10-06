import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper function to optimize and save images in multiple responsive formats and sizes
async function processAndSaveImage(filePath: string, buffer: Buffer) {
  const ext = path.extname(filePath).toLowerCase();
  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);

  const isSupportedImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

  if (!isSupportedImage) {
    // Save as-is for non-image formats like PDF, SVG, MP4
    await writeFile(filePath, buffer);
    return;
  }

  try {
    // 1. Compress the original in-place
    const pipeline = sharp(buffer);
    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 6, quality: 90, force: true }).toFile(filePath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 90, progressive: true, force: true }).toFile(filePath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: 90, force: true }).toFile(filePath);
    }

    // 2. Generate WebP and AVIF fallback files (skip AVIF for PNGs to prevent black backgrounds)
    if (ext === '.png') {
      await Promise.all([
        sharp(buffer).webp({ quality: 90 }).toFile(path.join(outputDir, `${baseName}.webp`)),
      ]);
    } else {
      await Promise.all([
        sharp(buffer).webp({ quality: 90 }).toFile(path.join(outputDir, `${baseName}.webp`)),
        sharp(buffer).avif({ quality: 88, chromaSubsampling: '4:4:4' }).toFile(path.join(outputDir, `${baseName}.avif`)),
      ]);
    }
  } catch (error) {
    console.error(`Failed to process and optimize image ${filePath}:`, error);
    // Fallback to saving original unmodified buffer if sharp fails
    await writeFile(filePath, buffer);
    throw error;
  }
}

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

// GET /api/media - List all media (optionally filtered by folderId or trash)
export async function GET(request: Request) {
  try {
    // Run background trash expiration check
    purgeExpiredTrash();

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

// POST /api/media - Upload a file (strict DAL auth)
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

    // Generate opaque hex token
    const ext = path.extname(file.name).toLowerCase();
    const token = randomBytes(16).toString('hex');
    const filename = `${token}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // ── VIDEO COMPRESSION ──
    let finalBuffer = buffer;
    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);

    if (isVideo) {
      try {
        let ffmpegPath: any = null;
        try {
          ffmpegPath = eval('require')('ffmpeg-static');
        } catch {}
        if (ffmpegPath) {
          const { exec } = require('child_process');
          const { unlink, writeFile: fsWriteFile, readFile } = require('fs/promises');
          const tempInput = path.join(uploadsDir, `temp-in-${Date.now()}${ext}`);
          const tempOutput = path.join(uploadsDir, `temp-out-${Date.now()}${ext}`);

          await fsWriteFile(tempInput, buffer);

          await new Promise<void>((resolve, reject) => {
            exec(
              `"${ffmpegPath}" -i "${tempInput}" -vcodec libx264 -crf 26 -preset faster -acodec aac -b:a 128k -y "${tempOutput}"`,
              (error: any) => {
                if (error) reject(error);
                else resolve();
              }
            );
          });

          finalBuffer = await readFile(tempOutput);
          await unlink(tempInput).catch(() => {});
          await unlink(tempOutput).catch(() => {});
        }
      } catch (err) {
        console.error('Video compression failed, falling back to original upload:', err);
      }
    }

    // Save and optimize the file
    try {
      await processAndSaveImage(filePath, finalBuffer);
    } catch (sharpError) {
      console.error('File saving failed:', sharpError);
      return NextResponse.json(
        { error: 'File upload failed: could not process or write the file.' },
        { status: 500 }
      );
    }

    // Query file size on disk after compression
    let finalSize = file.size;
    try {
      if (existsSync(filePath)) {
        finalSize = (await stat(filePath)).size;
      }
    } catch {}

    const media = await (prisma as any).media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: finalSize,
        url: `/files/${token}`,
        alt,
        folderId: folderId || null,
      },
    });

    await logAction(request, {
      action: 'CREATE',
      entity: 'Media',
      entityId: media.id,
      details: { filename: media.filename, originalName: media.originalName, mimeType: media.mimeType, size: finalSize },
      user,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('POST /api/media error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
