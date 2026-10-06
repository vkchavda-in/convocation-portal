import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink, writeFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logAction } from '@/lib/audit';
import { requirePermission } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

function urlToFilePath(url: string): string {
  const filename = path.basename(url);
  return path.join(process.cwd(), 'public', 'uploads', filename);
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
      if (existsSync(p)) {
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

  if (!isSupportedImage) {
    await writeFile(filePath, buffer);
    return;
  }

  try {
    const pipeline = sharp(buffer);
    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 6, quality: 90, force: true }).toFile(filePath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 90, progressive: true, force: true }).toFile(filePath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: 90, force: true }).toFile(filePath);
    }

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
    console.error(`Failed to process image ${filePath}:`, error);
    await writeFile(filePath, buffer);
    throw error;
  }
}

// DELETE /api/media/[id]
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

    const media = await (prisma as any).media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    if (permanent) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const ext = path.extname(media.filename);
      const baseName = path.basename(media.filename, ext);

      const filePath = urlToFilePath(media.url);
      if (existsSync(filePath)) {
        await unlink(filePath).catch(() => {});
      }

      await deleteImageVariants(uploadsDir, baseName);
      await (prisma as any).media.delete({ where: { id } });

      await logAction(request, {
        action: 'DELETE',
        entity: 'Media',
        entityId: id,
        details: { filename: media.filename, originalName: media.originalName, mimeType: media.mimeType, permanent: true },
        user,
      });
    } else {
      // Move to Trash (Soft Delete)
      await (prisma as any).media.update({
        where: { id },
        data: { isTrash: true, trashedAt: new Date() },
      });

      await logAction(request, {
        action: 'STATUS_CHANGE',
        entity: 'Media',
        entityId: id,
        details: { status: 'TRASHED', filename: media.filename, originalName: media.originalName },
        user,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

// PATCH /api/media/[id] - Update alt text, move to folder, or restore from trash
export async function PATCH(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requirePermission(request, 'upload_media');
  if (errorResponse) {
    const fallback = await requirePermission(request, 'delete_media');
    if (fallback.errorResponse) return errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};
    if (body.alt !== undefined) updateData.alt = body.alt;
    if ('folderId' in body) updateData.folderId = body.folderId; // null = move to root
    if (body.restore === true) {
      updateData.isTrash = false;
      updateData.trashedAt = null;
    }

    const media = await (prisma as any).media.update({
      where: { id },
      data: updateData,
    });

    await logAction(request, {
      action: body.restore ? 'STATUS_CHANGE' : 'UPDATE',
      entity: 'Media',
      entityId: id,
      details: {
        restored: body.restore === true,
        folderMoved: 'folderId' in body,
        altUpdated: body.alt !== undefined,
        originalName: media.originalName,
      },
      user,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('PATCH /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// PUT /api/media/[id] - Replace physical file contents
export async function PUT(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requirePermission(request, 'upload_media');
  if (errorResponse) return errorResponse;

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    const oldExt = path.extname(media.filename);
    const baseName = path.basename(media.filename, oldExt);
    const newExt = path.extname(file.name).toLowerCase() || oldExt.toLowerCase();
    const targetFilename = `${baseName}${newExt}`;

    const possibleOldExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.pdf', '.mp4', ''];
    for (const pExt of possibleOldExtensions) {
      const p = path.join(uploadsDir, `${baseName}${pExt}`);
      if (existsSync(p)) {
        try { await unlink(p); } catch {}
      }
    }
    await deleteImageVariants(uploadsDir, baseName);

    const targetFilePath = path.join(uploadsDir, targetFilename);
    await processAndSaveImage(targetFilePath, buffer);

    let finalSize = file.size;
    try {
      if (existsSync(targetFilePath)) {
        finalSize = (await stat(targetFilePath)).size;
      }
    } catch {}

    const updatedMedia = await (prisma as any).media.update({
      where: { id },
      data: {
        filename: targetFilename,
        originalName: media.originalName,
        mimeType: file.type || media.mimeType,
        size: finalSize,
        url: media.url,
        updatedAt: new Date(),
      },
    });

    await logAction(request, {
      action: 'UPDATE',
      entity: 'Media',
      entityId: id,
      details: {
        replaced: true,
        originalName: media.originalName,
        url: media.url,
        newSize: finalSize,
      },
      user,
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('PUT /api/media/[id] error:', error);
    return NextResponse.json({ error: 'Failed to replace media', details: String(error) }, { status: 500 });
  }
}
