const fs = require('fs');
const files = fs.readdirSync('public/uploads').filter(f => f.startsWith('convocation-') && f.endsWith('.jpg'));

let html = `<!DOCTYPE html>
<html>
<head>
  <title>Convocation Photos Preview</title>
  <style>
    body { background: #0b132b; color: #fff; font-family: system-ui, sans-serif; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { background: #1c2541; border: 1px solid #3a506b; border-radius: 12px; overflow: hidden; }
    .card img { width: 100%; height: 220px; object-fit: cover; display: block; }
    .info { padding: 12px 16px; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Convocation Photos Preview (${files.length} Photos)</h1>
  <div class="grid">
    ${files.map(f => `
      <div class="card">
        <img src="/uploads/${f}" alt="${f}">
        <div class="info">${f}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync('public/preview-photos.html', html);
console.log('Preview written to public/preview-photos.html');
