const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const isClean = process.argv.includes('--clean') || process.argv.includes('--force-clean') || process.env.CLEAN === '1';
  const snapshotPath = path.join(__dirname, 'db_snapshot.json');

  if (!fs.existsSync(snapshotPath)) {
    console.error(`Snapshot file not found at ${snapshotPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  // Auto-normalize any remaining /uploads/ to /media/
  const normalizedRaw = raw.replace(/\/uploads\//g, '/media/');
  const snapshot = JSON.parse(normalizedRaw);

  console.log(`Loading database snapshot (Exported at ${snapshot.metadata?.exportedAt || 'N/A'})...`);
  console.log(`Records to seed: ${snapshot.pages?.length || 0} pages, ${snapshot.settings?.length || 0} settings, ${snapshot.folders?.length || 0} folders, ${snapshot.media?.length || 0} media items.`);

  if (isClean) {
    console.log('\n🧹 Performing clean database reset before seeding...');
    await prisma.media.deleteMany().catch(() => {});
    await prisma.mediaFolder.deleteMany().catch(() => {});
    await prisma.page.deleteMany().catch(() => {});
    await prisma.setting.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    console.log('✅ Existing records cleared.');
  }

  // 1. Seed Users (Upsert by username)
  if (snapshot.users && snapshot.users.length > 0) {
    console.log('Seeding Users...');
    for (const user of snapshot.users) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: {
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          passwordHash: user.passwordHash
        },
        create: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          passwordHash: user.passwordHash
        }
      });
    }
  }

  // 2. Seed Settings (Upsert by key)
  if (snapshot.settings && snapshot.settings.length > 0) {
    console.log('Seeding Settings...');
    for (const setting of snapshot.settings) {
      const settingVal = typeof setting.value === 'string' ? setting.value.replace(/\/uploads\//g, '/media/') : setting.value;
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {
          value: settingVal
        },
        create: {
          key: setting.key,
          value: settingVal
        }
      });
    }
  }

  // 3. Seed Media Folders
  if (snapshot.folders && snapshot.folders.length > 0) {
    console.log('Seeding Media Folders...');
    // Seed parent folders first, then child folders
    const rootFolders = snapshot.folders.filter(f => !f.parentId);
    const childFolders = snapshot.folders.filter(f => f.parentId);

    for (const folder of rootFolders) {
      await prisma.mediaFolder.upsert({
        where: { id: folder.id },
        update: {
          name: folder.name,
          slug: folder.slug,
          icon: folder.icon,
          color: folder.color,
          description: folder.description,
          parentId: null,
          isTrash: folder.isTrash || false
        },
        create: {
          id: folder.id,
          name: folder.name,
          slug: folder.slug,
          icon: folder.icon,
          color: folder.color,
          description: folder.description,
          parentId: null,
          isTrash: folder.isTrash || false
        }
      });
    }

    for (const folder of childFolders) {
      await prisma.mediaFolder.upsert({
        where: { id: folder.id },
        update: {
          name: folder.name,
          slug: folder.slug,
          icon: folder.icon,
          color: folder.color,
          description: folder.description,
          parentId: folder.parentId,
          isTrash: folder.isTrash || false
        },
        create: {
          id: folder.id,
          name: folder.name,
          slug: folder.slug,
          icon: folder.icon,
          color: folder.color,
          description: folder.description,
          parentId: folder.parentId,
          isTrash: folder.isTrash || false
        }
      });
    }
  }

  // 4. Seed Media (Upsert by id)
  if (snapshot.media && snapshot.media.length > 0) {
    console.log('Seeding Media Library records...');
    for (const item of snapshot.media) {
      const mediaUrl = item.url ? item.url.replace(/\/uploads\//g, '/media/') : item.url;
      await prisma.media.upsert({
        where: { id: item.id },
        update: {
          filename: item.filename,
          originalName: item.originalName,
          mimeType: item.mimeType,
          size: item.size,
          url: mediaUrl,
          alt: item.alt || '',
          folderId: item.folderId || null,
          isTrash: item.isTrash || false
        },
        create: {
          id: item.id,
          filename: item.filename,
          originalName: item.originalName,
          mimeType: item.mimeType,
          size: item.size,
          url: mediaUrl,
          alt: item.alt || '',
          folderId: item.folderId || null,
          isTrash: item.isTrash || false
        }
      });
    }
  }

  // 5. Seed Pages (Upsert by slug)
  if (snapshot.pages && snapshot.pages.length > 0) {
    console.log('Seeding Pages & Sections...');
    for (const page of snapshot.pages) {
      const pageSections = typeof page.sections === 'string'
        ? page.sections.replace(/\/uploads\//g, '/media/')
        : page.sections;

      await prisma.page.upsert({
        where: { slug: page.slug },
        update: {
          title: page.title,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          order: page.order,
          isPublished: page.isPublished,
          isMaintenance: page.isMaintenance || false,
          sections: pageSections
        },
        create: {
          id: page.id,
          slug: page.slug,
          title: page.title,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          order: page.order,
          isPublished: page.isPublished,
          isMaintenance: page.isMaintenance || false,
          sections: pageSections
        }
      });
    }
  }

  console.log('Database seeded successfully from snapshot! 🎉');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
