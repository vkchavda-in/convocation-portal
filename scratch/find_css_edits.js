const fs = require('fs');

const logPath = 'C:\\Users\\viren\\.gemini\\antigravity\\brain\\c599db0f-1e41-4117-81e7-c766ec6f5d2c\\.system_generated\\logs\\transcript_full.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

let output = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.includes('.css') || line.includes('index.css') || line.includes('globals.css') || line.includes('theme.css')) {
    try {
      const data = JSON.parse(line);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
            const file = tc.args.TargetFile || tc.args.Target;
            if (file.endsWith('.css')) {
              output += `=========================================\n`;
              output += `Step ${data.step_index}: Tool: ${tc.name}, Target: ${file}\n`;
              output += `Instruction: ${tc.args.Instruction}\n`;
              output += `Description: ${tc.args.Description}\n`;
              output += `-----------------------------------------\n`;
              output += `TARGET CONTENT:\n${tc.args.TargetContent}\n`;
              output += `-----------------------------------------\n`;
              output += `REPLACEMENT CONTENT:\n${tc.args.ReplacementContent}\n`;
              output += `=========================================\n\n`;
            }
          }
        }
      }
    } catch (e) {
      // not JSON or other format
    }
  }
}

fs.writeFileSync('d:\\Desktop\\Convocation\\scratch\\css_history.txt', output);
console.log("=== WRITTEN css_history.txt ===");
