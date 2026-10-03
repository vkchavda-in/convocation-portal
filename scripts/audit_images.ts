import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  const dbImages = new Set<string>();
  const pageImageMap: Record<string, string[]> = {};

  for (const page of pages) {
    const raw = page.sections;
    const sections = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const str = JSON.stringify(sections);
    const matches = str.match(/\/uploads\/[^\s"',]+/g) || [];
    const assetMatches = str.match(/\/assets\/images\/[^\s"',]+/g) || [];
    const allForPage = [...new Set([...matches, ...assetMatches])];
    pageImageMap[page.slug] = allForPage;
    allForPage.forEach(img => dbImages.add(img));
  }

  console.log('--- IMAGES USED IN PAGES ---');
  for (const [slug, imgs] of Object.entries(pageImageMap)) {
    if (imgs.length > 0) {
      console.log(`Page [${slug}]:`);
      imgs.forEach(i => console.log(`   ${i}`));
    }
  }

  console.log('\n--- ALL UNIQUE IMAGES IN DB (' + dbImages.size + ') ---');
  Array.from(dbImages).sort().forEach(img => console.log('  ', img));

  const uploadsDir = 'public/uploads';
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`\n--- FILES IN public/uploads (${files.length}) ---`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
