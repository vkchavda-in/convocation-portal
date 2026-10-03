import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function downloadImage(url: string, outputPath: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  return buffer;
}

async function optimizeImageVariants(buffer: Buffer, basePath: string) {
  await sharp(buffer).resize(640).avif({ quality: 75 }).toFile(`${basePath}-mobile.avif`);
  await sharp(buffer).resize(1024).avif({ quality: 80 }).toFile(`${basePath}-tablet.avif`);
  await sharp(buffer).resize(1920, null, { withoutEnlargement: true }).avif({ quality: 85 }).toFile(`${basePath}-desktop.avif`);
  await sharp(buffer).resize(1920, null, { withoutEnlargement: true }).webp({ quality: 85 }).toFile(`${basePath}.webp`);
}

async function main() {
  console.log('Downloading Dr. V. Narayanan portrait...');
  try {
    const rawUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/DrVNarayanan_ISROHQ_15012025.png';
    const narayananPng = path.join(UPLOADS_DIR, 'v-narayanan.png');
    const narayananBase = path.join(UPLOADS_DIR, 'v-narayanan');
    const buf = await downloadImage(rawUrl, narayananPng);
    await optimizeImageVariants(buf, narayananBase);
    console.log('Successfully saved and optimized v-narayanan.png!');
  } catch (e) {
    console.error('Download error:', e);
  }
}

main().catch(console.error);
