const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const home = await prisma.page.findUnique({ where: { slug: 'home' } });
  const sections = Array.isArray(home.sections) ? home.sections : JSON.parse(home.sections || '[]');
  const pastGuests = sections.find(s => s.id === 'home-past-convocation-guests');
  console.log(JSON.stringify(pastGuests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
