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
  
  const elementKeys = Object.keys(audits).filter(k => k.toLowerCase().includes('element') || k.toLowerCase().includes('node'));
  console.log("Found keys with 'element' or 'node':", elementKeys);
  
  for (const k of elementKeys) {
    const audit = audits[k];
    if (audit.score !== undefined || audit.displayValue !== undefined) {
      console.log(`Key "${k}": ${audit.title || ''}`);
      if (audit.details && audit.details.items) {
        console.log(`  Items:`, JSON.stringify(audit.details.items.slice(0, 2), null, 2));
      }
    }
  }
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
