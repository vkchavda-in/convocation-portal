const fs = require('fs');
const path = require('path');

const logPath = "C:\\Users\\viren\\.gemini\\antigravity\\brain\\424d14a7-3451-47e8-b4f6-e369016ed106\\.system_generated\\tasks\\task-767.log";

if (!fs.existsSync(logPath)) {
  console.error("Log file not found!");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

console.log("=== PARSED PREVIOUS METRICS ===");
lines.forEach(line => {
  // Look for lines that contain FCP, LCP, TBT, Speed Index with numbers
  const lower = line.toLowerCase();
  if (
    (lower.includes('lcp') || lower.includes('tbt') || lower.includes('fcp') || lower.includes('speed index') || lower.includes('performance')) &&
    (lower.includes('ms') || lower.includes('s') || lower.includes('score') || lower.includes('approx') || lower.includes('≈') || lower.includes('='))
  ) {
    if (!line.includes('search-all-metrics') && !line.includes('const ') && !line.includes('console.log')) {
      console.log(line.trim());
    }
  }
});
