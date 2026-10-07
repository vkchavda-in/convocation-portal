import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { isSafePath, sanitizeFilename } from '@/lib/security';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const safeToken = sanitizeFilename(token);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!existsSync(uploadsDir)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // 1. Direct file match if token already has extension
    let targetFile = path.join(uploadsDir, safeToken);
    let matchedFilename = safeToken;

    if (!existsSync(targetFile) || !isSafePath(uploadsDir, targetFile)) {
      // 2. Check if there's a file in uploads starting with token (e.g. token.jpg, token.png)
      const allFiles = await readdir(uploadsDir);
      const found = allFiles.find((f) => f === safeToken || f.startsWith(`${safeToken}.`));

      if (found) {
        matchedFilename = found;
        targetFile = path.join(uploadsDir, found);
      } else {
        // 3. Fallback: Lookup in database
        try {
          const media = await (prisma as any).media.findFirst({
            where: {
              OR: [
                { url: `/files/${safeToken}` },
                { filename: { startsWith: safeToken } },
              ],
            },
            select: { filename: true },
          });

          if (media && media.filename) {
            const dbFile = path.join(uploadsDir, media.filename);
            if (existsSync(dbFile) && isSafePath(uploadsDir, dbFile)) {
              matchedFilename = media.filename;
              targetFile = dbFile;
            }
          }
        } catch {}
      }
    }

    if (!existsSync(targetFile) || !isSafePath(uploadsDir, targetFile)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(targetFile);

    // Determine correct content type
    const ext = path.extname(matchedFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.avif') contentType = 'image/avif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.mp4') contentType = 'video/mp4';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };

    if (ext === '.svg') {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'";
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error serving file from /files/[token]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
