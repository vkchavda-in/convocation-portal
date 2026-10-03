const fs = require('fs');
const path = require('path');

const filesToOptimize = [
  path.join(__dirname, '..', 'src', 'components', 'modules', 'MeetingsModule.tsx'),
  path.join(__dirname, '..', 'src', 'components', 'modules', 'NarrativeDividerModule.tsx')
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add import if not present
  if (!content.includes("import OptimizedImage")) {
    // Find import section to insert after first line or near other imports
    const importRegex = /import\s+[\s\S]*?;\r?\n/g;
    const match = content.match(importRegex);
    if (match && match.length > 0) {
      const lastImport = match[match.length - 1];
      const insertIdx = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertIdx) + 
                `import OptimizedImage from '@/components/shared/OptimizedImage';\n` + 
                content.slice(insertIdx);
      console.log(`Added OptimizedImage import to ${path.basename(filePath)}`);
    }
  }

  // 2. Replace <img with <OptimizedImage
  let count = 0;
  content = content.replace(/<img\b/g, () => {
    count++;
    return '<OptimizedImage';
  });

  if (count > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced ${count} <img> tags with <OptimizedImage> in ${path.basename(filePath)}`);
  } else {
    console.log(`No <img> tags to replace in ${path.basename(filePath)}`);
  }
}

filesToOptimize.forEach(processFile);
