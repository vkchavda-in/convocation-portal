const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsImagesDir = path.join(__dirname, '..', 'public', 'assets', 'images');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

async function getFiles(dir, exts = ['.png', '.jpg', '.jpeg', '.webp']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await getFiles(filePath, exts));
    } else {
      const ext = path.extname(file).toLowerCase();
      // Only get original images (ignore already generated .webp/.avif responsive sizes)
      if (exts.includes(ext) && !file.includes('-mobile.avif') && !file.includes('-tablet.avif') && !file.includes('-desktop.avif') && !file.endsWith('.avif') && !(ext === '.webp' && file.endsWith('.webp') && fs.existsSync(filePath.replace('.webp', '.png')))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function compressInPlace(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const tempPath = filePath + '.tmp';
  
  try {
    const statBefore = fs.statSync(filePath);
    const sizeBeforeKB = Math.round(statBefore.size / 1024);
    
    // Skip already small files (less than 30KB) to avoid overhead
    if (statBefore.size < 30 * 1024) {
      console.log(`Skipping small file: ${path.basename(filePath)} (${sizeBeforeKB} KB)`);
      return;
    }

    let pipeline = sharp(filePath);
    if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, quality: 75, force: true });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 75, progressive: true, force: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 80, force: true });
    } else {
      return;
    }

    await pipeline.toFile(tempPath);
    
    const statAfter = fs.statSync(tempPath);
    const sizeAfterKB = Math.round(statAfter.size / 1024);
    
    if (statAfter.size < statBefore.size) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      console.log(`Compressed: ${path.basename(filePath)} - ${sizeBeforeKB} KB -> ${sizeAfterKB} KB (${Math.round((1 - statAfter.size / statBefore.size) * 100)}% savings)`);
    } else {
      fs.unlinkSync(tempPath);
      console.log(`Keep original (no compression savings): ${path.basename(filePath)} (${sizeBeforeKB} KB)`);
    }
  } catch (err) {
    console.error(`Error compressing ${filePath}:`, err);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

async function generateResponsiveVersions(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);

  try {
    console.log(`Generating responsive sizes for: ${baseName}${ext}`);
    
    // 1. WebP version
    const webpPath = path.join(outputDir, `${baseName}.webp`);
    if (!fs.existsSync(webpPath)) {
      await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    }
    
    // 2. AVIF version
    const avifPath = path.join(outputDir, `${baseName}.avif`);
    if (!fs.existsSync(avifPath)) {
      await sharp(filePath).avif({ quality: 75 }).toFile(avifPath);
    }
    
    // 3. Mobile AVIF (480px width)
    const mobilePath = path.join(outputDir, `${baseName}-mobile.avif`);
    if (!fs.existsSync(mobilePath)) {
      await sharp(filePath).resize({ width: 480 }).avif({ quality: 60 }).toFile(mobilePath);
    }
    
    // 4. Tablet AVIF (800px width)
    const tabletPath = path.join(outputDir, `${baseName}-tablet.avif`);
    if (!fs.existsSync(tabletPath)) {
      await sharp(filePath).resize({ width: 800 }).avif({ quality: 70 }).toFile(tabletPath);
    }
    
    // 5. Desktop AVIF (1200px width)
    const desktopPath = path.join(outputDir, `${baseName}-desktop.avif`);
    if (!fs.existsSync(desktopPath)) {
      await sharp(filePath).resize({ width: 1200 }).avif({ quality: 75 }).toFile(desktopPath);
    }
    
  } catch (err) {
    console.error(`Failed to generate sizes for ${filePath}:`, err);
  }
}

async function main() {
  console.log('--- STARTING COMPREHENSIVE IMAGE OPTIMIZATION ---');
  
  // 1. Scan and process assets images
  console.log('Processing public/assets/images...');
  const assetFiles = await getFiles(assetsImagesDir);
  for (const file of assetFiles) {
    // Compress in-place first (except master portrait source portrait.png)
    if (path.basename(file) !== 'portrait.png') {
      await compressInPlace(file);
    }
    // Generate multi-size responsive conversions
    await generateResponsiveVersions(file);
  }
  
  // 2. Scan and process uploaded CMS images
  console.log('Processing public/uploads...');
  const uploadFiles = await getFiles(uploadsDir);
  for (const file of uploadFiles) {
    // Compress in-place first
    await compressInPlace(file);
    // Generate multi-size responsive conversions
    await generateResponsiveVersions(file);
  }
  
  console.log('--- COMPREHENSIVE IMAGE OPTIMIZATION COMPLETED ---');
}

main().catch(console.error);
