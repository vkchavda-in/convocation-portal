import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, stat, readdir } from 'fs/promises';
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

// Helper function to optimize and save images in multiple responsive formats and sizes
async function processAndSaveImage(filePath: string, buffer: Buffer) {
  const ext = path.extname(filePath).toLowerCase();
  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);

  const isSupportedImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

  if (ext === '.svg') {
    // Sanitize SVG text to strip malicious scripts and handlers
    const svgText = buffer.toString('utf-8');
    const cleanSvg = sanitizeSvg(svgText);
    await writeFile(filePath, Buffer.from(cleanSvg, 'utf-8'));
    return;
  }

  if (!isSupportedImage) {
    // Save as-is for PDF or GIF
    await writeFile(filePath, buffer);
    return;
  }

  try {
    // 1. Compress the original in-place
    const pipeline = sharp(buffer);
    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, quality: 75, force: true }).toFile(filePath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 75, progressive: true, force: true }).toFile(filePath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: 80, force: true }).toFile(filePath);
    }

    // 2–6. Generate all responsive variants in parallel
    await Promise.all([
      sharp(buffer).webp({ quality: 80 }).toFile(path.join(outputDir, `${baseName}.webp`)),
      sharp(buffer).avif({ quality: 75 }).toFile(path.join(outputDir, `${baseName}.avif`)),
      sharp(buffer).resize({ width: 480 }).avif({ quality: 60 }).toFile(path.join(outputDir, `${baseName}-mobile.avif`)),
      sharp(buffer).resize({ width: 800 }).avif({ quality: 70 }).toFile(path.join(outputDir, `${baseName}-tablet.avif`)),
      sharp(buffer).resize({ width: 1200 }).avif({ quality: 75 }).toFile(path.join(outputDir, `${baseName}-desktop.avif`)),
    ]);
  } catch (error) {
    console.error(`Failed to process and optimize image ${filePath}:`, error);
    await writeFile(filePath, buffer);
    throw error;
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.avif': return 'image/avif';
    case '.svg': return 'image/svg+xml';
    case '.gif': return 'image/gif';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

// GET /api/media - List all media
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderFilter = searchParams.get('folder');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (existsSync(uploadsDir)) {
      try {
        const diskFiles = await readdir(uploadsDir);
        const diskFileSet = new Set(diskFiles);
        const existingMedia = await (prisma as any).media.findMany({
          select: { filename: true },
        });
        const existingFilenames = new Set(existingMedia.map((m: any) => m.filename));

        const untracked = diskFiles.filter((f) => {
          const ext = path.extname(f).toLowerCase();
          const isSupported = ALLOWED_EXTENSIONS.includes(ext);
          const isThumbnail = /-(mobile|tablet|desktop)\.(avif|webp)$/i.test(f);
          if (!isSupported || isThumbnail || existingFilenames.has(f)) return false;

          if (ext === '.avif' || ext === '.webp') {
            const baseName = f.slice(0, -ext.length);
            if (diskFileSet.has(`${baseName}.png`) || diskFileSet.has(`${baseName}.jpg`) || diskFileSet.has(`${baseName}.jpeg`)) {
              return false;
            }
          }
          return true;
        });

        if (untracked.length > 0) {
          for (const filename of untracked) {
            try {
              const safeFilename = sanitizeFilename(filename);
              const filePath = path.join(uploadsDir, safeFilename);
              if (!isSafePath(uploadsDir, filePath)) continue;

              const fileStat = await stat(filePath);
              const humanName = safeFilename
                .replace(/-[0-9]{10,}\.[a-z0-9]+$/i, '')
                .replace(/\.[a-z0-9]+$/i, '')
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              // Smart default folder detection based on filename
              let defaultFolder = 'General';
              if (/202[0-9]/i.test(safeFilename)) {
                const yearMatch = safeFilename.match(/202[0-9]/);
                if (yearMatch) defaultFolder = yearMatch[0];
              } else if (/guest|dignitary|president|dg|sharma|patel|narayanan|chaudhary|vaja/i.test(safeFilename)) {
                defaultFolder = 'Dignitaries';
              } else if (/convocation|ceremony/i.test(safeFilename)) {
                defaultFolder = '2026';
              }

              await (prisma as any).media.create({
                data: {
                  filename: safeFilename,
                  originalName: safeFilename,
                  mimeType: getMimeType(safeFilename),
                  size: fileStat.size,
                  url: `/uploads/${safeFilename}`,
                  alt: humanName,
                  folder: defaultFolder,
                  createdAt: fileStat.birthtime || new Date(),
                  updatedAt: fileStat.mtime || new Date(),
                },
              });
            } catch (err) {
              console.warn(`Failed to auto-sync file ${filename}:`, err);
            }
          }
        }
      } catch (syncErr) {
        console.warn('Auto-sync check skipped:', syncErr);
      }
    }

    const whereClause: Record<string, any> = {};
    if (folderFilter && folderFilter !== 'all' && folderFilter !== 'All') {
      whereClause.folder = folderFilter;
    }

    const media = await (prisma as any).media.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(media, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST /api/media - Upload a file (Strictly Protected)
export async function POST(request: Request) {
  // 1. Authenticate and authorize role
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return auth.response!;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rawAlt = (formData.get('alt') as string) || '';
    const alt = rawAlt.replace(/[<>"'/]/g, '').slice(0, 200);
    const rawFolder = (formData.get('folder') as string) || 'General';
    const folder = rawFolder.replace(/[<>"'/]/g, '').slice(0, 100) || 'General';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit (15MB)' },
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

    // 3. Binary Magic Number Signature Verification
    const signatureCheck = validateFileSignature(buffer, ext);
    if (!signatureCheck.valid) {
      return NextResponse.json(
        { error: 'File header does not match file extension. Potential security risk.' },
        { status: 400 }
      );
    }

    // 4. Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // 5. Generate safe unique filename
    const safeBaseName = sanitizeFilename(file.name)
      .replace(ext, '')
      .slice(0, 45);
    const filename = `${safeBaseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // 6. Check path traversal safety
    if (!isSafePath(uploadsDir, filePath)) {
      return NextResponse.json({ error: 'Invalid destination path' }, { status: 400 });
    }

    // 7. Save and process
    try {
      await processAndSaveImage(filePath, buffer);
    } catch (sharpError) {
      console.error('Image processing failed:', sharpError);
      return NextResponse.json(
        { error: 'Image processing failed on server.' },
        { status: 500 }
      );
    }

    let finalSize = file.size;
    try {
      if (existsSync(filePath)) {
        finalSize = (await stat(filePath)).size;
      }
    } catch {}

    const media = await (prisma as any).media.create({
      data: {
        filename,
        originalName: sanitizeFilename(file.name),
        mimeType: file.type || getMimeType(filename),
        size: finalSize,
        url: `/uploads/${filename}`,
        alt,
        folder,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('POST /api/media error:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
