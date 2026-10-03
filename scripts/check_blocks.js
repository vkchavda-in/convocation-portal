const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blocks = await prisma.block.findMany();
  console.log('Total blocks:', blocks.length);
  for (const b of blocks) {
    if (b.blockKey && (b.blockKey.includes('guest') || b.blockKey.includes('convocation') || b.type === 'CARD_GRID')) {
      console.log(`Block [${b.id}] key=${b.blockKey}, type=${b.type}, pageId=${b.pageId}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
