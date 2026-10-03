const fs = require('fs');
const path = require('path');

function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('LCP') || content.includes('TBT')) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('LCP') || line.includes('TBT') || line.includes('FCP') || line.includes('Speed Index')) {
          if (line.includes('s') || line.includes('ms') || line.includes('score') || line.includes('≈') || line.includes('=')) {
            console.log(`${path.basename(filePath)} L${idx+1}: ${line.trim()}`);
          }
        }
      });
    }
  } catch (e) {
    // ignore
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== 'conversations') {
        traverse(fullPath);
      }
    } else if (file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.log')) {
      searchFile(fullPath);
    }
  }
}

const brainDir = "C:\\Users\\viren\\.gemini\\antigravity";
if (fs.existsSync(brainDir)) {
  traverse(brainDir);
}
console.log("Search complete.");
