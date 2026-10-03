import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink, writeFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { requireRole } from '@/lib/auth';
import {
  validateFileSignature,
  sanitizeSvg,
  sanitizeFilename,
  isSafePath,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB maximum
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.gif', '.pdf'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function deleteImageVariants(uploadsDir: string, baseName: string) {
  const variants = [
    `${baseName}.avif`,
    `${baseName}.webp`,
    `${baseName}-mobile.avif`,
    `${baseName}-tablet.avif`,
    `${baseName}-desktop.avif`,
  ];
  await Promise.all(
    variants.map(async (v) => {
      const p = path.join(uploadsDir, v);
      if (isSafePath(uploadsDir, p) && existsSync(p)) {
        try { await unlink(p); } catch {}
      }
    })
  );
}

async function processAndSaveImage(filePath: string, buffer: Buffer) {
  const ext = path.extname(filePath).toLowerCase();
  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);

  const isSupportedImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

  if (ext === '.svg') {
    const svgText = buffer.toString('utf-8');
    const cleanSvg = sanitizeSvg(svgText);
    await writeFile(filePath, Buffer.from(cleanSvg, 'utf-8'));
    return;
  }

  if (!isSupportedImage) {
    await writeFile(filePath, buffer);
    return;
  }

  try {
    const pipeline = sharp(buffer);
    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, quality: 75, force: true }).toFile(filePath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 75, progressive: true, force: true }).toFile(filePath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: 80, force: true }).toFile(filePath);
    }

    await Promise.all([
      sharp(buffer).webp({ quality: 80 }).toFile(path.join(outputDir, `${baseName}.webp`)),
      sharp(buffer).avif({ quality: 75 }).toFile(path.join(outputDir, `${baseName}.avif`)),
      sharp(buffer).resize({ width: 480 }).avif({ quality: 60 }).toFile(path.join(outputDir, `${baseName}-mobile.avif`)),
      sharp(buffer).resize({ width: 800 }).avif({ quality: 70 }).toFile(path.join(outputDir, `${baseName}-tablet.avif`)),
      sharp(buffer).resize({ width: 1200 }).avif({ quality: 75 }).toFile(path.join(outputDir, `${baseName}-desktop.avif`)),
    ]);
  } catch (error) {
    console.error(`Failed to process image ${filePath}:`, error);
    await writeFile(filePath, buffer);
    throw error;
  }
}

// DELETE /api/media/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const media = await (prisma as any).media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const safeFilename = sanitizeFilename(media.filename);
    const ext = path.extname(safeFilename);
    const baseName = path.basename(safeFilename, ext);

    const filePath = path.join(uploadsDir, safeFilename);
    if (isSafePath(uploadsDir, filePath) && existsSync(filePath)) {
      await unlink(filePath);
    }

    await deleteImageVariants(uploadsDir, baseName);
    await (prisma as any).media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

// PATCH /api/media/[id] - Update alt text or folder
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (typeof body.alt === 'string') {
      updateData.alt = body.alt.replace(/[<>"'/]/g, '').slice(0, 200);
    }
    if (typeof body.folder === 'string') {
      updateData.folder = body.folder.replace(/[<>"'/]/g, '').slice(0, 100) || 'General';
    }

    const media = await (prisma as any).media.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('PATCH /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// PUT /api/media/[id] - Replace file contents
export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const media = await (prisma as any).media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit (15MB)' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate signature
    const sigCheck = validateFileSignature(buffer, ext);
    if (!sigCheck.valid) {
      return NextResponse.json(
        { error: 'File header does not match extension.' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const oldSafeFilename = sanitizeFilename(media.filename);
    const oldExt = path.extname(oldSafeFilename);
    const oldBaseName = path.basename(oldSafeFilename, oldExt);

    let filename = oldSafeFilename;
    let url = media.url;

    if (ext.toLowerCase() === oldExt.toLowerCase()) {
      const filePath = path.join(uploadsDir, filename);
      if (!isSafePath(uploadsDir, filePath)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      await deleteImageVariants(uploadsDir, oldBaseName);
      await processAndSaveImage(filePath, buffer);
    } else {
      const oldFilePath = path.join(uploadsDir, oldSafeFilename);
      if (isSafePath(uploadsDir, oldFilePath) && existsSync(oldFilePath)) {
        await unlink(oldFilePath);
      }
      await deleteImageVariants(uploadsDir, oldBaseName);

      const newBaseName = sanitizeFilename(file.name).replace(ext, '').slice(0, 45);
      filename = `${newBaseName}-${Date.now()}${ext}`;
      url = `/uploads/${filename}`;
      const filePath = path.join(uploadsDir, filename);
      if (!isSafePath(uploadsDir, filePath)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      await processAndSaveImage(filePath, buffer);
    }

    let finalSize = file.size;
    try {
      const filePath = path.join(uploadsDir, filename);
      if (existsSync(filePath)) {
        finalSize = (await stat(filePath)).size;
      }
    } catch {}

    const updatedMedia = await (prisma as any).media.update({
      where: { id },
      data: {
        filename,
        originalName: sanitizeFilename(file.name),
        mimeType: file.type,
        size: finalSize,
        url,
      },
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('PUT /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to replace media' }, { status: 500 });
  }
}
