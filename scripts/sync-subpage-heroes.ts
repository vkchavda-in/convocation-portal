import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting subpage heroes synchronization...");
  
  // Fetch all pages
  const pages = await prisma.page.findMany();
  
  let updatedCount = 0;
  
  for (const page of pages) {
    // Skip homepage
    if (page.slug === "home") {
      continue;
    }
    
    // Parse sections
    let sections: any[] = [];
    if (typeof page.sections === "string") {
      sections = JSON.parse(page.sections);
    } else if (Array.isArray(page.sections)) {
      sections = page.sections as any[];
    }
    
    let updated = false;
    
    const newSections = sections.map((section) => {
      if (section.type === "hero") {
        updated = true;
        return {
          ...section,
          data: {
            ...section.data,
            variant: "subpage-light",
            subpageAlign: "center",
            subpageHeight: "short",
            lightGradientPos: "none",
            lightBgStyle: "dots",
            isSubpage: true,
          }
        };
      }
      return section;
    });
    
    if (updated) {
      await prisma.page.update({
        where: { id: page.id },
        data: {
          sections: newSections
        }
      });
      console.log(`Synced hero block for page: ${page.title} (${page.slug})`);
      updatedCount++;
    }
  }
  
  console.log(`Successfully synced ${updatedCount} subpage heroes.`);
}

main()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
