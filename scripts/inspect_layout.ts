import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'layout-for-awardees' } });
  console.log(JSON.stringify(page?.sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
