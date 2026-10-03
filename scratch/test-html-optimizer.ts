import { optimizeHtmlImages } from '../src/components/shared/OptimizedImage';

const testHtml = `
<p>Hello world</p>
<img src="/uploads/chitralekhan.png" alt="Spread" style="width: 100%;" class="mx-auto my-4 rounded-lg" />
<p>Another paragraph</p>
<img class="test-class" src="/uploads/outlook_cover.jpg" alt="Outlook Cover" />
<img src="https://example.com/external.jpg" alt="External image" />
`;

console.log("=== ORIGINAL HTML ===");
console.log(testHtml.trim());
console.log("\n=== OPTIMIZED HTML ===");
console.log(optimizeHtmlImages(testHtml).trim());
