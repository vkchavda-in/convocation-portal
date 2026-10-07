import { writeFile, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';

export async function processMediaInBackground(mediaId: string, filePath: string, buffer: Buffer) {
  // Use setImmediate to ensure the HTTP response has already completed
  setImmediate(async () => {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const outputDir = path.dirname(filePath);
      const baseName = path.basename(filePath, ext);

      const isSupportedImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

      if (isSupportedImage) {
        try {
          const image = sharp(buffer);
          const metadata = await image.metadata();
          const imgWidth = metadata.width || 1920;

          // 1. Generate standard WebP and AVIF fallbacks
          const tasks: Promise<any>[] = [
            sharp(buffer).webp({ quality: 88 }).toFile(path.join(outputDir, `${baseName}.webp`)),
          ];

          if (ext !== '.png') {
            tasks.push(
              sharp(buffer)
                .avif({ quality: 82, chromaSubsampling: '4:4:4' })
                .toFile(path.join(outputDir, `${baseName}.avif`))
            );
          } else {
            // PNG transparency preserved in WebP
            tasks.push(
              sharp(buffer)
                .webp({ quality: 90, alphaQuality: 90 })
                .toFile(path.join(outputDir, `${baseName}.webp`))
            );
          }

          // 2. Generate responsive AVIF sizes for OptimizedImage component
          if (imgWidth >= 640) {
            tasks.push(
              sharp(buffer)
                .resize({ width: 640, withoutEnlargement: true })
                .avif({ quality: 80 })
                .toFile(path.join(outputDir, `${baseName}-mobile.avif`))
                .catch(() => {})
            );
          }
          if (imgWidth >= 1024) {
            tasks.push(
              sharp(buffer)
                .resize({ width: 1024, withoutEnlargement: true })
                .avif({ quality: 82 })
                .toFile(path.join(outputDir, `${baseName}-tablet.avif`))
                .catch(() => {})
            );
          }
          if (imgWidth >= 1600) {
            tasks.push(
              sharp(buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .avif({ quality: 84 })
                .toFile(path.join(outputDir, `${baseName}-desktop.avif`))
                .catch(() => {})
            );
          }

          await Promise.all(tasks);

          // 3. Compress original in-place if appropriate
          if (ext === '.jpg' || ext === '.jpeg') {
            const tempOptPath = path.join(outputDir, `${baseName}-opt.jpg`);
            await sharp(buffer).jpeg({ quality: 88, progressive: true, force: true }).toFile(tempOptPath);
            if (existsSync(tempOptPath)) {
              const optBuffer = await sharp(tempOptPath).toBuffer();
              await writeFile(filePath, optBuffer);
              await unlink(tempOptPath).catch(() => {});
            }
          } else if (ext === '.png') {
            const tempOptPath = path.join(outputDir, `${baseName}-opt.png`);
            await sharp(buffer).png({ compressionLevel: 6, quality: 90, force: true }).toFile(tempOptPath);
            if (existsSync(tempOptPath)) {
              const optBuffer = await sharp(tempOptPath).toBuffer();
              await writeFile(filePath, optBuffer);
              await unlink(tempOptPath).catch(() => {});
            }
          }

          // 4. Update file size in database
          if (existsSync(filePath)) {
            const newSize = (await stat(filePath)).size;
            await (prisma as any).media.update({
              where: { id: mediaId },
              data: { size: newSize },
            });
          }
        } catch (imgErr) {
          console.error(`[MediaProcessor] Background image optimization failed for ${filePath}:`, imgErr);
        }
      }

      // Video Background Compression
      const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
      if (isVideo) {
        try {
          let ffmpegPath: any = null;
          try {
            ffmpegPath = eval('require')('ffmpeg-static');
          } catch {}
          if (ffmpegPath) {
            const { exec } = require('child_process');
            const { unlink: fsUnlink, readFile: fsReadFile } = require('fs/promises');
            const tempOutput = path.join(outputDir, `temp-opt-${Date.now()}${ext}`);

            await new Promise<void>((resolve, reject) => {
              exec(
                `"${ffmpegPath}" -i "${filePath}" -vcodec libx264 -crf 26 -preset faster -acodec aac -b:a 128k -y "${tempOutput}"`,
                (error: any) => {
                  if (error) reject(error);
                  else resolve();
                }
              );
            });

            if (existsSync(tempOutput)) {
              const compressedBuffer = await fsReadFile(tempOutput);
              await writeFile(filePath, compressedBuffer);
              await fsUnlink(tempOutput).catch(() => {});

              const newSize = (await stat(filePath)).size;
              await (prisma as any).media.update({
                where: { id: mediaId },
                data: { size: newSize },
              });
            }
          }
        } catch (vidErr) {
          console.error(`[MediaProcessor] Background video compression failed for ${filePath}:`, vidErr);
        }
      }
    } catch (globalErr) {
      console.error(`[MediaProcessor] Background processing error for media ${mediaId}:`, globalErr);
    }
  });
}
