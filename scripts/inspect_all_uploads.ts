import fs from 'fs';
import path from 'path';

function inspect() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const assetsDir = path.join(process.cwd(), 'public', 'assets', 'images');

  const uploadFiles = fs.readdirSync(uploadsDir);
  const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

  console.log('=== ASSET IMAGES ===');
  assetFiles.forEach(f => console.log('  /assets/images/' + f));

  console.log('\n=== UPLOAD IMAGES ===');
  uploadFiles.forEach(f => console.log('  /uploads/' + f));
}

inspect();
