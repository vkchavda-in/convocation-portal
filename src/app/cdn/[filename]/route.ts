import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { isSafePath, sanitizeFilename } from '@/lib/security';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { filename } = await params;

    // Security: Prevent directory traversal by strictly sanitizing the filename
    const safeFilename = sanitizeFilename(filename);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, safeFilename);

    if (!isSafePath(uploadsDir, filePath) || !existsSync(filePath)) {
      return new NextResponse('Resource Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Determine correct content type
    const ext = path.extname(safeFilename).toLowerCase();
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
    console.error('Error serving CDN asset:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
