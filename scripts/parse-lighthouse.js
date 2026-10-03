const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'lighthouse-report-phase6.json');

if (!fs.existsSync(reportPath)) {
  console.error("Lighthouse report file not found!");
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const audits = data.audits || {};
  
  const fcp = audits['first-contentful-paint'] || {};
  const lcp = audits['largest-contentful-paint'] || {};
  const tbt = audits['total-blocking-time'] || {};
  const speedIndex = audits['speed-index'] || {};
  const performanceScore = data.categories?.performance?.score;

  console.log("=== LIGHTHOUSE MEASURED METRICS ===");
  console.log(`Performance Score: ${performanceScore ? Math.round(performanceScore * 100) : 'N/A'}`);
  console.log(`FCP: ${fcp.displayValue || 'N/A'} (${fcp.numericValue ? Math.round(fcp.numericValue) + ' ms' : 'N/A'})`);
  console.log(`LCP: ${lcp.displayValue || 'N/A'} (${lcp.numericValue ? Math.round(lcp.numericValue) + ' ms' : 'N/A'})`);
  console.log(`TBT: ${tbt.displayValue || 'N/A'} (${tbt.numericValue ? Math.round(tbt.numericValue) + ' ms' : 'N/A'})`);
  console.log(`Speed Index: ${speedIndex.displayValue || 'N/A'} (${speedIndex.numericValue ? Math.round(speedIndex.numericValue) + ' ms' : 'N/A'})`);

  const lcpElementAudit = audits['largest-contentful-paint-element'] || {};
  console.log("\n=== LCP ELEMENT DETAILS ===");
  if (lcpElementAudit.details && lcpElementAudit.details.items) {
    lcpElementAudit.details.items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Selector: ${item.node?.selector}`);
      console.log(`  HTML: ${item.node?.snippet}`);
      console.log(`  Size: ${item.node?.boundingRect?.width} x ${item.node?.boundingRect?.height}`);
    });
  } else {
    console.log("No LCP element details found in report.");
  }
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
