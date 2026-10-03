const fs = require('fs');
const path = require('path');

function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('LCP') || content.includes('TBT') || content.includes('FCP') || content.includes('Speed Index')) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('LCP') || line.includes('TBT') || line.includes('FCP') || line.includes('Speed Index')) {
          if (line.includes('ms') || line.includes('s') || line.includes('≈') || line.includes('=')) {
            console.log(`${filePath} L${idx+1}: ${line.trim()}`);
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
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        traverse(fullPath);
      }
    } else {
      searchFile(fullPath);
    }
  }
}

// Traverse brain appData directory recursively
const brainDir = "C:\\Users\\viren\\.gemini\\antigravity";
if (fs.existsSync(brainDir)) {
  traverse(brainDir);
}
console.log("Done searching.");
