const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'lighthouse-report-warmed.json');

if (!fs.existsSync(reportPath)) {
  console.error("Lighthouse report file not found!");
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const audits = data.audits || {};

  console.log("=== SCANNING AUDITS FOR LCP ELEMENT ===");
  for (const [key, audit] of Object.entries(audits)) {
    const auditStr = JSON.stringify(audit);
    if (auditStr.includes('hero-bg') || auditStr.includes('Largest Contentful Paint') || auditStr.includes('LCP')) {
      if (audit.details && JSON.stringify(audit.details).includes('node')) {
        console.log(`Audit: "${key}"`);
        console.log(`  Title: ${audit.title}`);
        console.log(`  Snippet:`, JSON.stringify(audit.details.items, null, 2));
      }
    }
  }

  // Also let's check trace events or other metrics if any
  const firstPaint = audits['first-contentful-paint'];
  const lcp = audits['largest-contentful-paint'];
  console.log(`FCP Value: ${firstPaint.displayValue}`);
  console.log(`LCP Value: ${lcp.displayValue}`);

} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
