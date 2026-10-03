const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'src', 'components', 'modules');
const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.tsx'));

console.log(`Scanning ${files.length} modules to restore optimized blur...`);

files.forEach(file => {
  const filePath = path.join(modulesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Restore blur in initial opacity object: initial={{ opacity: 0, ... }} -> initial={{ opacity: 0, filter: 'blur(3px)', ... }}
  content = content.replace(/initial=\{\{\s*opacity:\s*0\s*(,?)/g, "initial={{ opacity: 0, filter: 'blur(3px)'$1");

  // 2. Restore blur in whileInView opacity object: whileInView={{ opacity: 1, ... }} -> whileInView={{ opacity: 1, filter: 'blur(0px)', ... }}
  content = content.replace(/whileInView=\{\{\s*opacity:\s*1\s*(,?)/g, "whileInView={{ opacity: 1, filter: 'blur(0px)'$1");

  // 3. Restore blur in animate opacity object: animate={{ opacity: 1, ... }} -> animate={{ opacity: 1, filter: 'blur(0px)', ... }}
  content = content.replace(/animate=\{\{\s*opacity:\s*1\s*(,?)/g, "animate={{ opacity: 1, filter: 'blur(0px)'$1");

  // 4. Inject hardware acceleration: <motion.div ... initial={{ ... filter: 'blur(3px)' }} -> <motion.div style={{ willChange: 'filter, opacity' }} ...
  content = content.replace(/<motion\.([a-zA-Z0-9]+)([^>]*?initial=\{\{\s*opacity:\s*0,\s*filter:\s*['"]blur\(3px\)['"])/g, "<motion.$1 style={{ willChange: 'filter, opacity' }}$2");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Restored optimized blur in: ${file}`);
  }
});

console.log('Done restoring optimized blur animations!');
