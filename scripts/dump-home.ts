import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (!page) { console.log('No home page found'); return; }
  const sections = typeof page.sections === 'string'
    ? JSON.parse(page.sections as string)
    : page.sections;
  console.log(JSON.stringify(sections, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
