const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const snapshotPath = path.join(__dirname, 'db_snapshot.json');

  if (!fs.existsSync(snapshotPath)) {
    console.error(`Snapshot file not found at ${snapshotPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(raw);

  console.log(`Loading database snapshot (Exported at ${snapshot.metadata?.exportedAt || 'N/A'})...`);
  console.log(`Records to seed: ${snapshot.pages?.length || 0} pages, ${snapshot.settings?.length || 0} settings, ${snapshot.folders?.length || 0} folders, ${snapshot.media?.length || 0} media items.`);

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
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value
        },
        create: {
          key: setting.key,
          value: setting.value
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
      await prisma.media.upsert({
        where: { id: item.id },
        update: {
          filename: item.filename,
          originalName: item.originalName,
          mimeType: item.mimeType,
          size: item.size,
          url: item.url,
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
          url: item.url,
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
      await prisma.page.upsert({
        where: { slug: page.slug },
        update: {
          title: page.title,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          order: page.order,
          isPublished: page.isPublished,
          isMaintenance: page.isMaintenance || false,
          sections: page.sections
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
          sections: page.sections
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
