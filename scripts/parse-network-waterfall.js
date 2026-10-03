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
  
  const networkRequests = audits['network-requests'] || {};
  console.log("network-requests details key:", networkRequests.details ? Object.keys(networkRequests.details) : 'None');
  if (networkRequests.details && networkRequests.details.items) {
    console.log(`Found ${networkRequests.details.items.length} network requests.`);
    // print first 5 items to inspect format
    console.log("Sample items:", JSON.stringify(networkRequests.details.items.slice(0, 5), null, 2));
  }
} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
