import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany();
  const settings = await prisma.setting.findMany();
  const media = await prisma.media.findMany();
  const users = await prisma.user.findMany();

  const backupData = {
    pages,
    settings,
    media,
    users
  };

  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupsDir, `db_backup_${timestamp}.json`);
  const latestBackupPath = path.join(backupsDir, 'db_backup.json');

  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  fs.writeFileSync(latestBackupPath, JSON.stringify(backupData, null, 2));

  console.log(`Database backup saved successfully to ${backupPath} and backups/db_backup.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
