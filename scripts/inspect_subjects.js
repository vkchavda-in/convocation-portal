const sharp = require('sharp');
const fs = require('fs');

async function main() {
  const files = fs.readdirSync('public/uploads').filter(f => f.startsWith('convocation-') && f.endsWith('.jpg'));
  
  for (const f of files) {
    const img = sharp('public/uploads/' + f);
    const meta = await img.metadata();
    
    // Extract center 50% vs left 25% vs right 25%
    const centerW = Math.round(meta.width * 0.5);
    const centerH = Math.round(meta.height * 0.5);
    const centerLeft = Math.round(meta.width * 0.25);
    const centerTop = Math.round(meta.height * 0.25);

    const centerStats = await sharp('public/uploads/' + f)
      .extract({ left: centerLeft, top: centerTop, width: centerW, height: centerH })
      .stats();

    console.log(f, 'Center Mean RGB:', Math.round(centerStats.channels[0].mean), Math.round(centerStats.channels[1].mean), Math.round(centerStats.channels[2].mean));
  }
}

main();
