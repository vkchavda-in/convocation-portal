const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'lighthouse-report.json');

if (!fs.existsSync(reportPath)) {
  console.error("Lighthouse report file not found!");
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const audits = data.audits || {};
  
  const entries = Object.entries(audits).map(([key, audit]) => `${key}: ${audit.title || ''}`);
  console.log("All audit keys and titles:");
  console.log(entries.join('\n'));
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
