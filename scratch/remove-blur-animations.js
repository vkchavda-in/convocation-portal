const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'src', 'components', 'modules');
const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.tsx'));

console.log(`Scanning ${files.length} modules for blur animations...`);

files.forEach(file => {
  const filePath = path.join(modulesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: filter with trailing comma, e.g. "filter: 'blur(6px)', "
  content = content.replace(/filter\s*:\s*['"]blur\(\d+px\)['"]\s*,\s*/g, '');

  // Pattern 2: filter with leading comma, e.g. ", filter: 'blur(6px)'"
  content = content.replace(/\s*,\s*filter\s*:\s*['"]blur\(\d+px\)['"]/g, '');

  // Pattern 3: standalone filter (no comma), e.g. "filter: 'blur(6px)'"
  content = content.replace(/\s*filter\s*:\s*['"]blur\(\d+px\)['"]/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned blur animations in: ${file}`);
  }
});

console.log('Done cleaning blur animations!');
