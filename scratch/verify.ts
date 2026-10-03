import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== Verification Script ===");

  // 1. Verify Media Count
  const mediaCount = await prisma.media.count();
  console.log(`Media Table Record Count: ${mediaCount}`);
  if (mediaCount === 0) {
    console.log("✅ SUCCESS: Media table is empty (blank) as requested.");
  } else {
    console.log(`❌ ERROR: Media table has ${mediaCount} records.`);
  }

  // 2. Verify Home Page Meetings Section
  const homePage = await prisma.page.findUnique({
    where: { slug: 'home' }
  });

  if (!homePage) {
    console.log("❌ ERROR: Home page not found in database.");
    return;
  }

  const sections = typeof homePage.sections === 'string'
    ? JSON.parse(homePage.sections)
    : homePage.sections;

  const meetingsSection = sections.find((sec: any) => sec.id === 'home-national-meetings');
  if (!meetingsSection) {
    console.log("❌ ERROR: Meetings section (home-national-meetings) not found.");
    return;
  }

  const items = meetingsSection.data?.items || [];
  console.log(`Meetings Items Count: ${items.length}`);
  
  if (items.length === 23) {
    console.log("✅ SUCCESS: Found all 23 Indian political leaders in the meetings section!");
  } else {
    console.log(`❌ ERROR: Found ${items.length} items instead of 23.`);
  }

  console.log("\nLeader Names seeded in database:");
  items.forEach((item: any, index: number) => {
    console.log(`${index + 1}. ${item.dignitary} (${item.dignitaryRole})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
