import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const globalHeader = await prisma.setting.findUnique({ where: { key: "global_header" } });
  console.log("=== GLOBAL HEADER ===");
  console.log(JSON.stringify(globalHeader ? JSON.parse(globalHeader.value) : null, null, 2));

  const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
  console.log("=== HOME HERO SECTION ===");
  if (homePage) {
    const sections = homePage.sections as any[];
    const heroSection = sections.find(s => s.type === 'hero');
    console.log(JSON.stringify(heroSection, null, 2));
  } else {
    console.log("Home page not found");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
