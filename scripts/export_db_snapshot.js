const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportSnapshot() {
  console.log('Fetching all database records for snapshot...');

  const users = await prisma.user.findMany();
  const settings = await prisma.setting.findMany();
  const pages = await prisma.page.findMany({ orderBy: { order: 'asc' } });
  const folders = await prisma.mediaFolder.findMany();
  const media = await prisma.media.findMany();

  const snapshot = {
    metadata: {
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        settings: settings.length,
        pages: pages.length,
        folders: folders.length,
        media: media.length
      }
    },
    users,
    settings,
    pages,
    folders,
    media
  };

  const snapshotPath = path.join(__dirname, '../prisma/db_snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`Snapshot saved to ${snapshotPath} (${(fs.statSync(snapshotPath).size / 1024).toFixed(1)} KB)`);
  console.log('Counts:', snapshot.metadata.counts);
}

exportSnapshot()
  .catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
