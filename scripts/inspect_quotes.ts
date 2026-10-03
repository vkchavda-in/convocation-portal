import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  for (const page of pages) {
    const rawSections = page.sections;
    const sections = typeof rawSections === 'string' ? JSON.parse(rawSections) : rawSections;
    if (Array.isArray(sections)) {
      const quoteSections = sections.filter((s: any) => s.type === 'quote');
      if (quoteSections.length > 0) {
        console.log(`\nPage: ${page.slug} (Quotes: ${quoteSections.length})`);
        quoteSections.forEach((q: any, i: number) => {
          console.log(`  [${i}] id: ${q.id}, author: "${q.data?.author}", layout: "${q.data?.layout}", imagePosition: "${q.data?.imagePosition}", image: "${q.data?.image || q.data?.imageUrl}", bg: "${q.data?.backgroundTheme}"`);
        });
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
