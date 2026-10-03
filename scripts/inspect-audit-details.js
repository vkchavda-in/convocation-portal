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
  
  console.log("largest-contentful-paint audit object:");
  console.log(JSON.stringify(audits['largest-contentful-paint'], null, 2));
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
