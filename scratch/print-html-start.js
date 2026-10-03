const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'viren', '.gemini', 'antigravity', 'brain', 'c599db0f-1e41-4117-81e7-c766ec6f5d2c', '.system_generated', 'steps', '603', 'content.md');
const content = fs.readFileSync(filePath, 'utf8');

console.log("=== START ===");
console.log(content.slice(0, 1500));

console.log("=== END ===");
console.log(content.slice(-1500));
