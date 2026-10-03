import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const slugs = ['layout-for-awardees', 'chief-guest', 'guest-of-honour-2026', 'president-ganpat-university', 'director-general'];
  for (const slug of slugs) {
    const page = await prisma.page.findUnique({ where: { slug } });
    console.log(`\n=== PAGE: ${slug} ===`);
    console.log(JSON.stringify(page?.sections, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
