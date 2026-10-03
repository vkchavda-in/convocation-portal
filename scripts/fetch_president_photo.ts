import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function downloadImage(url: string, outputPath: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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
  console.log('Downloading Padma Shri Ganpatbhai Patel photo...');
  try {
    const url = 'https://d2z4x7fn3a0wyp.cloudfront.net/profile/padmashri-ganpatbhai-patel/imageBcLQMP.jpg';
    const target = path.join(UPLOADS_DIR, 'president-ganpatbhai-patel.png');
    const base = path.join(UPLOADS_DIR, 'president-ganpatbhai-patel');
    const buf = await downloadImage(url, target);
    await optimizeImageVariants(buf, base);
    console.log('Successfully saved and optimized president-ganpatbhai-patel.png!');
  } catch (e) {
    console.error('Download failed, using local fallback:', e);
    const fallbackPath = path.join(UPLOADS_DIR, 'leaders-1781068505737.png');
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath);
      fs.writeFileSync(path.join(UPLOADS_DIR, 'president-ganpatbhai-patel.png'), buf);
      await optimizeImageVariants(buf, path.join(UPLOADS_DIR, 'president-ganpatbhai-patel'));
      console.log('Created president-ganpatbhai-patel.png from local fallback');
    }
  }
}

main().catch(console.error);
