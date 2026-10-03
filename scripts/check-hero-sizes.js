const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const files = [
  'hero-bg.jpg',
  'hero-bg.webp',
  'hero-bg-mobile.avif',
  'hero-bg-tablet.avif',
  'hero-bg-desktop.avif'
];

console.log("=== HERO BACKGROUND ASSET SIZES ===");
files.forEach(f => {
  const filePath = path.join(UPLOADS_DIR, f);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`${f}: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes)`);
  } else {
    console.log(`${f}: NOT FOUND`);
  }
});
