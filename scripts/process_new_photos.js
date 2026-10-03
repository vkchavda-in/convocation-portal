const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const sourceDir = 'D:/Downloads/New folder/New folder';
const uploadsDir = path.join(process.cwd(), 'public/uploads');

// Guest filenames patterns that MUST be preserved
const GUEST_PRESERVE_PATTERNS = [
  'pra-vaja',
  'v-narayanan',
  'ashok-chaudhary',
  'president-ganpatbhai-patel',
  'logo'
];

function shouldPreserve(filename) {
  const lower = filename.toLowerCase();
  return GUEST_PRESERVE_PATTERNS.some(p => lower.includes(p));
}

async function main() {
  console.log('=== STEP 1: CLEANING UP OLD UPLOADS (EXCEPT GUESTS & LOGO) ===');
  if (fs.existsSync(uploadsDir)) {
    const existingFiles = fs.readdirSync(uploadsDir);
    let deletedCount = 0;
    for (const f of existingFiles) {
      if (!shouldPreserve(f)) {
        fs.unlinkSync(path.join(uploadsDir, f));
        deletedCount++;
      }
    }
    console.log(`Cleaned up ${deletedCount} old files. Kept guest portraits & logo.`);
  }

  console.log('\n=== STEP 2: PROCESSING 23 NEW CONVOCATION PHOTOS ===');
  const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
  console.log(`Found ${sourceFiles.length} photos in source folder.`);

  const processedImages = [];

  for (let i = 0; i < sourceFiles.length; i++) {
    const origFilename = sourceFiles[i];
    const sourcePath = path.join(sourceDir, origFilename);
    const indexStr = String(i + 1).padStart(2, '0');
    const baseName = `convocation-${indexStr}-${origFilename.replace(/\.[^/.]+$/, '').toLowerCase()}`;
    const outJpg = `${baseName}.jpg`;
    const outWebp = `${baseName}.webp`;
    const outAvif = `${baseName}.avif`;

    console.log(`[${i + 1}/${sourceFiles.length}] Processing ${origFilename} -> ${outJpg}`);

    const image = sharp(sourcePath);
    const meta = await image.metadata();

    // Auto-rotate based on EXIF orientation and resize to max 2048px width/height
    const pipeline = sharp(sourcePath).rotate();

    // 1. Full-size Web optimized JPEG (max 2048px)
    await pipeline
      .clone()
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(path.join(uploadsDir, outJpg));

    // 2. WebP
    await pipeline
      .clone()
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(path.join(uploadsDir, outWebp));

    // 3. AVIF
    await pipeline
      .clone()
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 82 })
      .toFile(path.join(uploadsDir, outAvif));

    // Responsive Desktop / Tablet / Mobile variants for fast responsive loading
    await pipeline
      .clone()
      .resize({ width: 1440, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(uploadsDir, `${baseName}-desktop.webp`));

    await pipeline
      .clone()
      .resize({ width: 1440, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 80 })
      .toFile(path.join(uploadsDir, `${baseName}-desktop.avif`));

    await pipeline
      .clone()
      .resize({ width: 768, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(uploadsDir, `${baseName}-tablet.webp`));

    await pipeline
      .clone()
      .resize({ width: 768, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 80 })
      .toFile(path.join(uploadsDir, `${baseName}-tablet.avif`));

    await pipeline
      .clone()
      .resize({ width: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(uploadsDir, `${baseName}-mobile.webp`));

    await pipeline
      .clone()
      .resize({ width: 480, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 80 })
      .toFile(path.join(uploadsDir, `${baseName}-mobile.avif`));

    const isVertical = meta.height > meta.width;
    processedImages.push({
      id: i + 1,
      filename: outJpg,
      url: `/uploads/${outJpg}`,
      aspect: isVertical ? 'tall' : 'wide',
      orig: origFilename
    });
  }

  console.log(`\nSuccessfully processed and generated variants for ${processedImages.length} images.`);

  console.log('\n=== STEP 3: UPDATING DATABASE PAGES WITH NEW CONVOCATION PHOTOS ===');
  
  // Categorize images for gallery
  const galleryItems = processedImages.map((img, idx) => {
    let cat = 'ceremony';
    let title = 'Grand Convocation Ceremony';
    
    if (idx % 3 === 0) {
      cat = 'ceremony';
      title = `Convocation Ceremony Moment ${idx + 1}`;
    } else if (idx % 3 === 1) {
      cat = 'awardees';
      title = `Degrees & Medal Awardees ${idx + 1}`;
    } else {
      cat = 'campus';
      title = `Campus & Event Atmosphere ${idx + 1}`;
    }

    return {
      id: img.id,
      category: cat,
      title: title,
      aspect: img.aspect,
      url: img.url,
      imageUrl: img.url
    };
  });

  const heroSliderImages = [
    processedImages[0]?.url || '/uploads/convocation-01-0u3a0768.jpg',
    processedImages[7]?.url || processedImages[1]?.url,
    processedImages[14]?.url || processedImages[2]?.url,
    processedImages[15]?.url || processedImages[3]?.url,
    processedImages[20]?.url || processedImages[4]?.url
  ];

  const metricsBgImage = processedImages[7]?.url || processedImages[0]?.url;
  const layoutVenueImage = processedImages[14]?.url || processedImages[0]?.url;

  // 1. Update HOME page
  const homePage = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (homePage) {
    const sections = typeof homePage.sections === 'string' ? JSON.parse(homePage.sections) : homePage.sections;
    for (const s of sections) {
      if (s.id === 'home-hero') {
        s.data.bgImage = heroSliderImages[0];
        s.data.bgImages = heroSliderImages;
      } else if (s.id === 'home-awardees-metrics') {
        s.data.bgImage = metricsBgImage;
      }
    }
    await prisma.page.update({
      where: { slug: 'home' },
      data: { sections: sections }
    });
    console.log('Updated [home] page with new hero images and metrics backdrop.');
  }

  // 2. Update GALLERY page
  const galleryPage = await prisma.page.findUnique({ where: { slug: 'gallery' } });
  if (galleryPage) {
    const sections = typeof galleryPage.sections === 'string' ? JSON.parse(galleryPage.sections) : galleryPage.sections;
    for (const s of sections) {
      if (s.type === 'hero') {
        s.data.bgImage = heroSliderImages[0];
      } else if (s.type === 'gallery') {
        s.data.categories = [
          { id: 'all', label: 'All Photos' },
          { id: 'ceremony', label: 'Ceremony & Stage' },
          { id: 'awardees', label: 'Awardees & Medals' },
          { id: 'campus', label: 'Campus & Memories' }
        ];
        s.data.images = galleryItems;
      }
    }
    await prisma.page.update({
      where: { slug: 'gallery' },
      data: { sections: sections }
    });
    console.log(`Updated [gallery] page with all ${galleryItems.length} convocation photos.`);
  }

  // 3. Update LAYOUT-FOR-AWARDEES page
  const layoutPage = await prisma.page.findUnique({ where: { slug: 'layout-for-awardees' } });
  if (layoutPage) {
    const sections = typeof layoutPage.sections === 'string' ? JSON.parse(layoutPage.sections) : layoutPage.sections;
    for (const s of sections) {
      if (s.type === 'hero') {
        s.data.bgImage = heroSliderImages[1] || heroSliderImages[0];
      } else if (s.type === 'media' && s.data?.videos) {
        // Venue visual
        s.data.venueImage = layoutVenueImage;
      }
    }
    await prisma.page.update({
      where: { slug: 'layout-for-awardees' },
      data: { sections: sections }
    });
    console.log('Updated [layout-for-awardees] page.');
  }

  // 4. Update other subpages hero backgrounds if needed
  const subpages = await prisma.page.findMany({
    where: { slug: { in: ['19th-convocation-3', 'convocation-schedule', 'schedule-for-gold-medalists-and-phd-awardees', 'bus-transportation'] } }
  });
  for (const p of subpages) {
    const sections = typeof p.sections === 'string' ? JSON.parse(p.sections) : p.sections;
    for (const s of sections) {
      if (s.type === 'hero') {
        s.data.bgImage = heroSliderImages[Math.floor(Math.random() * heroSliderImages.length)];
      }
    }
    await prisma.page.update({
      where: { slug: p.slug },
      data: { sections: sections }
    });
  }
  console.log(`Updated subpages hero headers with real convocation photos.`);

  console.log('\n=== ALL COMPLETED SUCCESSFULLY ===');
}

main()
  .catch(err => {
    console.error('Error:', err);
  })
  .finally(() => prisma.$disconnect());
