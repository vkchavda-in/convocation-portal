const fs = require('fs');

const logPath = 'C:\\Users\\viren\\.gemini\\antigravity\\brain\\c599db0f-1e41-4117-81e7-c766ec6f5d2c\\.system_generated\\logs\\transcript_full.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
  if (line.includes('AwardeesStatsModuleProps') && line.includes('write_to_file')) {
    const data = JSON.parse(line);
    const writeTool = data.tool_calls.find(tc => tc.name === 'write_to_file');
    if (writeTool && writeTool.args && writeTool.args.CodeContent) {
      let code = writeTool.args.CodeContent;
      // loop to unescape double/triple stringified values
      while (typeof code === 'string' && (code.startsWith('"') || code.includes('\\n'))) {
        try {
          const parsed = JSON.parse(code);
          if (typeof parsed === 'string') {
            code = parsed;
          } else {
            break;
          }
        } catch (e) {
          break;
        }
      }
      fs.writeFileSync('d:\\Desktop\\Convocation\\scratch\\original_stats.tsx', code);
      console.log("=== WRITTEN UNTRUNCATED ===");
      break;
    }
  }
}
