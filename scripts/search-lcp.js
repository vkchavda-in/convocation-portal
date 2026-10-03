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
  
  for (const [key, audit] of Object.entries(audits)) {
    const title = audit.title || '';
    const desc = audit.description || '';
    if (title.includes('Largest Contentful Paint') || desc.includes('Largest Contentful Paint')) {
      console.log(`Key: "${key}"`);
      console.log(`  Title: ${title}`);
      console.log(`  Details keys:`, audit.details ? Object.keys(audit.details) : 'None');
      if (audit.details && audit.details.items) {
        console.log(`  Details items:`, JSON.stringify(audit.details.items.slice(0, 1), null, 2));
      }
    }
  }
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
