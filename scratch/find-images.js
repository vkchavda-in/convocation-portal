const fs = require('fs');
const path = require('path');

const dumpPath = path.join(__dirname, '..', 'scripts', 'all-pages-dump.json');
if (!fs.existsSync(dumpPath)) {
  console.error('Dump file not found');
  process.exit(1);
}

const dataStr = fs.readFileSync(dumpPath, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(dataStr);

const images = new Set();

function traverse(obj) {
  if (!obj || typeof obj !== 'object') return;
  
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
    return;
  }
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      const val = obj[key].toLowerCase();
      if (val.startsWith('/') && (val.endsWith('.png') || val.endsWith('.jpg') || val.endsWith('.jpeg') || val.endsWith('.webp') || val.endsWith('.avif') || val.endsWith('.svg'))) {
        images.add(obj[key]);
      } else if (val.startsWith('http') && (val.includes('.jpg') || val.includes('.png') || val.includes('.webp') || val.includes('.avif') || val.includes('.jpeg'))) {
        images.add(obj[key]);
      }
    } else {
      traverse(obj[key]);
    }
  }
}

traverse(data);

console.log('--- FOUND IMAGES ---');
Array.from(images).sort().forEach(img => console.log(img));
