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
  console.log('Downloading Ashok Chaudhary photo...');
  try {
    const url = 'https://convocation.guni.ac.in/wp-content/uploads/2026/01/Untitled-Medium-400x400.png';
    const target = path.join(UPLOADS_DIR, 'ashok-chaudhary.png');
    const base = path.join(UPLOADS_DIR, 'ashok-chaudhary');
    const buf = await downloadImage(url, target);
    await optimizeImageVariants(buf, base);
    console.log('Successfully saved and optimized ashok-chaudhary.png!');
  } catch (e) {
    console.error('Download failed, using local fallback:', e);
    // fallback from untitled-design--3---1781149833581.png
    const fallbackPath = path.join(UPLOADS_DIR, 'untitled-design--3---1781149833581.png');
    if (fs.existsSync(fallbackPath)) {
      const buf = fs.readFileSync(fallbackPath);
      fs.writeFileSync(path.join(UPLOADS_DIR, 'ashok-chaudhary.png'), buf);
      await optimizeImageVariants(buf, path.join(UPLOADS_DIR, 'ashok-chaudhary'));
      console.log('Created ashok-chaudhary.png from local fallback');
    }
  }
}

main().catch(console.error);
