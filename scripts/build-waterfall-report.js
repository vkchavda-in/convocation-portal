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
  
  const networkRequests = audits['network-requests'] || {};
  if (!networkRequests.details || !networkRequests.details.items) {
    console.error("No network requests found in report!");
    process.exit(1);
  }
  
  const items = networkRequests.details.items;
  
  // 1. Ranked list of the top 10 largest resources by transfer size
  const sortedResources = [...items].sort((a, b) => b.transferSize - a.transferSize);
  const top10 = sortedResources.slice(0, 10);
  
  console.log("=== TOP 10 LARGEST RESOURCES BY TRANSFER SIZE ===");
  top10.forEach((item, index) => {
    console.log(`${index + 1}. URL: ${item.url}`);
    console.log(`   Type: ${item.resourceType || 'Unknown'} | MIME: ${item.mimeType}`);
    console.log(`   Transfer Size: ${(item.transferSize / 1024).toFixed(2)} KB (${item.transferSize} bytes)`);
    console.log(`   Resource Size: ${(item.resourceSize / 1024).toFixed(2)} KB (${item.resourceSize} bytes)`);
    console.log(`   Response Time: ${Math.round(item.networkEndTime - item.networkRequestTime)} ms`);
    console.log(`   Protocol: ${item.protocol} | Cache: ${item.cache}`);
    console.log("--------------------------------------------------");
  });

  // 2. Every image above 50 KB
  console.log("\n=== IMAGES ABOVE 50 KB ===");
  const imagesAbove50 = items.filter(item => {
    const isImage = item.resourceType === 'Image' || (item.mimeType && item.mimeType.startsWith('image/'));
    return isImage && item.resourceSize > 50 * 1024;
  });

  // Identify LCP element
  const lcpElementAudit = audits['lcp-breakdown-insight'] || {};
  let lcpUrl = "";
  if (lcpElementAudit.details && lcpElementAudit.details.items) {
    // We can check if there's a node or resource corresponding to LCP
    // Looking at the scan: the lcp URL is http://localhost:5000/_next/image?url=%2Fuploads%2Fhero-bg.jpg&w=828&q=75
    lcpUrl = "http://localhost:5000/_next/image?url=%2Fuploads%2Fhero-bg.jpg&w=828&q=75";
  }

  imagesAbove50.forEach((item) => {
    const ext = path.extname(item.url.split('?')[0]).toLowerCase();
    let format = 'Unknown';
    if (item.mimeType === 'image/jpeg' || ext === '.jpg' || ext === '.jpeg') format = 'JPEG';
    else if (item.mimeType === 'image/png' || ext === '.png') format = 'PNG';
    else if (item.mimeType === 'image/webp' || ext === '.webp') format = 'WebP';
    else if (item.mimeType === 'image/avif' || ext === '.avif') format = 'AVIF';
    else {
      // Parse from query param if next/image
      if (item.url.includes('_next/image')) {
        const urlParam = new URL(item.url).searchParams.get('url');
        if (urlParam) {
          const innerExt = path.extname(urlParam.split('?')[0]).toLowerCase();
          if (innerExt === '.jpg' || innerExt === '.jpeg') format = 'JPEG';
          else if (innerExt === '.png') format = 'PNG';
          else if (innerExt === '.webp') format = 'WebP';
          else if (innerExt === '.avif') format = 'AVIF';
        }
      }
    }

    const isLcp = item.url === lcpUrl || item.url.includes('hero-bg');
    const isAboveFold = isLcp; // Hero is above fold. Gallery/narrative are below fold.

    console.log(`URL: ${item.url}`);
    console.log(`  Transfer Size: ${(item.transferSize / 1024).toFixed(2)} KB (${item.transferSize} bytes)`);
    console.log(`  Resource Size: ${(item.resourceSize / 1024).toFixed(2)} KB (${item.resourceSize} bytes)`);
    console.log(`  Response Time: ${Math.round(item.networkEndTime - item.networkRequestTime)} ms`);
    console.log(`  Format: ${format} (MIME: ${item.mimeType})`);
    console.log(`  Above the Fold: ${isAboveFold ? 'Yes' : 'No'}`);
    console.log(`  Contributes to LCP: ${isLcp ? 'Yes' : 'No'}`);
    console.log("--------------------------------------------------");
  });

} catch (error) {
  console.error("Failed to parse Lighthouse report:", error);
}
