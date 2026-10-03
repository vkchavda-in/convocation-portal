import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

const IMAGES_TO_DOWNLOAD = [
  {
    key: "hero-bg",
    url: "https://images.unsplash.com/photo-1642969164999-979483e21601?w=1920&h=1080&fit=crop&auto=format",
    filename: "hero-bg.jpg"
  },
  {
    key: "home-intro",
    url: "https://images.unsplash.com/photo-1606206873764-fd15e242df52?w=1200&h=800&fit=crop&auto=format",
    filename: "home-intro.jpg"
  },
  {
    key: "gallery-3",
    url: "https://images.unsplash.com/photo-1532186773960-85649e5cb70b?w=1200&h=800&fit=crop&auto=format",
    filename: "gallery-3.jpg"
  },
  {
    key: "gallery-4",
    url: "https://images.unsplash.com/photo-1611505908502-5b67e53e3a76?w=1200&h=800&fit=crop&auto=format",
    filename: "gallery-4.jpg"
  },
  {
    key: "gallery-5",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=800&fit=crop&auto=format",
    filename: "gallery-5.jpg"
  },
  {
    key: "gallery-6",
    url: "https://images.unsplash.com/photo-1606337321936-02d1b1a4d5ef?w=1200&h=800&fit=crop&auto=format",
    filename: "gallery-6.jpg"
  }
];

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function downloadImage(url: string, outputPath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  return buffer;
}

async function optimizeImage(buffer: Buffer, basePath: string) {
  // 1. Generate mobile avif (max-width: 640px)
  await sharp(buffer)
    .resize(640)
    .avif({ quality: 65 })
    .toFile(`${basePath}-mobile.avif`);

  // 2. Generate tablet avif (max-width: 1024px)
  await sharp(buffer)
    .resize(1024)
    .avif({ quality: 70 })
    .toFile(`${basePath}-tablet.avif`);

  // 3. Generate desktop avif (width: 1920px or original)
  await sharp(buffer)
    .resize(1920, null, { withoutEnlargement: true })
    .avif({ quality: 75 })
    .toFile(`${basePath}-desktop.avif`);

  // 4. Generate fallback webp (width: 1920px or original)
  await sharp(buffer)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${basePath}.webp`);
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  console.log("Starting image download and optimization...");

  for (const img of IMAGES_TO_DOWNLOAD) {
    const targetPath = path.join(UPLOADS_DIR, img.filename);
    const basePath = path.join(UPLOADS_DIR, img.filename.replace('.jpg', ''));
    console.log(`Downloading ${img.key}...`);
    try {
      const buffer = await downloadImage(img.url, targetPath);
      console.log(`Optimizing ${img.key} sizes...`);
      await optimizeImage(buffer, basePath);
      console.log(`Done optimizing ${img.key}.`);
    } catch (error) {
      console.error(`Error processing ${img.key}:`, error);
    }
  }

  console.log("All images downloaded and optimized.");

  // Now update database records
  console.log("Updating database records for homepage sections...");

  const page = await prisma.page.findUnique({ where: { slug: "home" } });
  if (!page) {
    console.error("Home page not found in DB!");
    return;
  }

  const sections = page.sections as any[];
  const updatedSections = sections.map((section: any) => {
    if (section.id === "home-hero") {
      section.data.bgImage = "/uploads/hero-bg.jpg";
    } else if (section.id === "home-intro") {
      section.data.imageUrl = "/uploads/home-intro.jpg";
    } else if (section.id === "home-gallery") {
      section.data.images = section.data.images.map((image: any, idx: number) => {
        if (idx === 0) image.url = "/uploads/hero-bg.jpg";
        else if (idx === 1) image.url = "/uploads/home-intro.jpg";
        else if (idx === 2) image.url = "/uploads/gallery-3.jpg";
        else if (idx === 3) image.url = "/uploads/gallery-4.jpg";
        else if (idx === 4) image.url = "/uploads/gallery-5.jpg";
        else if (idx === 5) image.url = "/uploads/gallery-6.jpg";
        return image;
      });
    }
    return section;
  });

  await prisma.page.update({
    where: { slug: "home" },
    data: { sections: updatedSections }
  });

  console.log("Database records updated successfully!");
  prisma.$disconnect();
}

main().catch(err => {
  console.error("Script failed:", err);
  prisma.$disconnect();
});
