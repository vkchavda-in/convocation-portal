import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function getMimeType(filename) {
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

async function syncUploads() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads dir does not exist.');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const existingMedia = await prisma.media.findMany({
    select: { filename: true }
  });
  const existingFilenames = new Set(existingMedia.map(m => m.filename));

  let addedCount = 0;

  for (const filename of files) {
    // Skip sub-variants like -mobile.avif, -tablet.avif, -desktop.avif if the base exists,
    // or include primary images
    const ext = path.extname(filename).toLowerCase();
    const isSupported = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.gif', '.pdf'].includes(ext);
    if (!isSupported) continue;

    // Skip responsive auto-generated thumbnail files to keep the media library clean and organized
    const isResponsiveThumbnail = /-(mobile|tablet|desktop)\.(avif|webp)$/i.test(filename);
    if (isResponsiveThumbnail) continue;

    if (!existingFilenames.has(filename)) {
      const filePath = path.join(uploadsDir, filename);
      const stat = fs.statSync(filePath);
      
      const humanName = filename
        .replace(/-[0-9]{10,}\.[a-z0-9]+$/i, '')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      await prisma.media.create({
        data: {
          filename,
          originalName: filename,
          mimeType: getMimeType(filename),
          size: stat.size,
          url: `/uploads/${filename}`,
          alt: humanName,
          createdAt: stat.birthtime || new Date(),
          updatedAt: stat.mtime || new Date()
        }
      });
      addedCount++;
    }
  }

  const total = await prisma.media.count();
  console.log(`Synced uploads! Added: ${addedCount}, Total in DB: ${total}`);
}

syncUploads().catch(console.error).finally(() => prisma.$disconnect());
