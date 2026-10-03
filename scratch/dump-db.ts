import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching current database records...");
  const pages = await prisma.page.findMany({
    orderBy: { order: 'asc' }
  });
  const settings = await prisma.setting.findMany();
  const media = await prisma.media.findMany();
  const users = await prisma.user.findMany();

  // Create a clean seed TS content
  const code = `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Database snapshot taken on ${new Date().toISOString()}
const pagesData: any[] = ${JSON.stringify(pages, null, 2)};

const settingsData: any[] = ${JSON.stringify(settings, null, 2)};

const mediaData: any[] = ${JSON.stringify(media, null, 2)};

const usersData: any[] = ${JSON.stringify(users, null, 2)};

async function main() {
  console.log("Seeding database from snapshot...");

  // 1. Users
  console.log("Seeding users...");
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      create: {
        username: user.username,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }

  // 2. Settings
  console.log("Seeding settings...");
  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  // 3. Media
  console.log("Seeding media...");
  await prisma.media.deleteMany({});
  for (const item of mediaData) {
    await prisma.media.create({
      data: {
        id: item.id,
        filename: item.filename,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        url: item.url,
        alt: item.alt,
      }
    });
  }

  // 4. Pages
  console.log("Seeding pages...");
  for (const page of pagesData) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        sections: page.sections as any,
        order: page.order,
        isPublished: page.isPublished,
      },
      create: {
        slug: page.slug,
        title: page.title,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        sections: page.sections as any,
        order: page.order,
        isPublished: page.isPublished,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const seedPath = path.join(process.cwd(), "scripts", "seed.ts");
  fs.writeFileSync(seedPath, code, "utf8");
  console.log("Successfully replaced seed.ts with current database snapshot!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
