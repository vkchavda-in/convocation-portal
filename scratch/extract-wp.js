const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'viren', '.gemini', 'antigravity', 'brain', 'c599db0f-1e41-4117-81e7-c766ec6f5d2c', '.system_generated', 'steps', '603', 'content.md');
const content = fs.readFileSync(filePath, 'utf8');

// Find all matches for headings or classes
console.log("=== Matches ===");
const regexes = [
  /class="[^"]*guest[^"]*"/gi,
  /class="[^"]*dignit[^"]*"/gi,
  /<h2>[^<]*<\/h2>/gi,
  /<h3>[^<]*<\/h3>/gi,
];

regexes.forEach(re => {
  const matches = content.match(re);
  if (matches) {
    console.log(`Regex ${re}: found ${matches.length} matches`);
    console.log(matches.slice(0, 10));
  } else {
    console.log(`Regex ${re}: no matches`);
  }
});
