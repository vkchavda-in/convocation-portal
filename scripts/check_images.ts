import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  console.log('Total pages:', pages.length);
  
  for (const p of pages) {
    let sections: any = p.sections;
    if (typeof sections === 'string') {
      try { sections = JSON.parse(sections); } catch (e) {}
    }
    
    console.log(`\n========================================`);
    console.log(`PAGE: slug="${p.slug}", title="${p.title}"`);
    console.log(`========================================`);

    if (Array.isArray(sections)) {
      sections.forEach((s: any, idx: number) => {
        console.log(`  Section [${idx}] type="${s.type}" id="${s.id}"`);
        if (s.type === 'quote') {
          console.log(`    QUOTE DATA:`, JSON.stringify(s.data, null, 2));
        }
        
        // Find missing local images in this section
        const str = JSON.stringify(s);
        const matches = str.match(/["'](\/[^"']+\.(png|jpg|jpeg|webp|avif|svg))["']/gi) || [];
        for (const m of matches) {
          const cleanPath = m.replace(/["']/g, '');
          const localFile = path.join(process.cwd(), 'public', cleanPath.replace(/^\//, ''));
          const exists = fs.existsSync(localFile);
          if (!exists) {
            console.log(`    ❌ MISSING LOCAL FILE: ${cleanPath}`);
          }
        }
        // Also check if remote URLs or external URLs
        const remoteMatches = str.match(/https?:\/\/[^"']+/gi) || [];
        if (remoteMatches.length > 0) {
          console.log(`    ⚠️ Remote URLs found (${remoteMatches.length}):`, remoteMatches.slice(0, 3));
        }
      });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
