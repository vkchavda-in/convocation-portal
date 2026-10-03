const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  console.log('Total pages:', pages.length);
  for (const page of pages) {
    console.log(`Page: id=${page.id}, slug=${page.slug}, title=${page.title}`);
    const sections = Array.isArray(page.sections) ? page.sections : JSON.parse(page.sections || '[]');
    console.log(`  Sections count: ${sections.length}`);
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      console.log(`  [${i}] type=${s.type}, id=${s.id}, title=${s.data?.title || s.title || ''}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
