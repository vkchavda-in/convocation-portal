const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "folder" TEXT DEFAULT 'General';`);
    console.log('Successfully ensured folder column in Media table');
    
    const media = await prisma.$queryRawUnsafe(`SELECT id, filename, folder FROM "Media" LIMIT 5;`);
    console.log('Sample media rows with folder:', media);
  } catch (err) {
    console.error('Error adding folder column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
