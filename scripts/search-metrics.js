const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('LCP') || content.includes('TBT')) {
        console.log(`Found in: ${fullPath}`);
        // print lines matching LCP or TBT
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('LCP') || line.includes('TBT') || line.includes('FCP') || line.includes('Speed Index')) {
            console.log(`  L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(process.cwd());
// also search in the brain/artifacts directory!
const brainDir = "C:\\Users\\viren\\.gemini\\antigravity\\brain\\424d14a7-3451-47e8-b4f6-e369016ed106";
if (fs.existsSync(brainDir)) {
  console.log("\nSearching in brain directory...");
  searchDir(brainDir);
}
