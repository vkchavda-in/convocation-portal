import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating quote positions: Quote 1 (right), Quote 2 (left)...');
  const homePage = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (!homePage) {
    console.error('Home page not found!');
    return;
  }

  const rawSections = homePage.sections;
  const sections = typeof rawSections === 'string' ? JSON.parse(rawSections) : rawSections;

  let updatedCount = 0;
  for (const s of sections) {
    if (s.id === 'home-dg-message') {
      s.data = {
        ...s.data,
        quote: "Education is not merely the acquisition of knowledge; it is the transformation of character, the cultivation of wisdom, and the ignition of a lifelong passion for excellence. Today marks not an end, but a magnificent beginning for every graduate.",
        author: "Dr. Mahendra Sharma",
        citation: "Pro-Chancellor & Director General, Ganpat University",
        category: "Director General's Message",
        image: "/assets/images/portrait.png",
        signature: "/assets/images/signature_transparent.png",
        imagePosition: "right", // Photo on right
        layout: "editorial",
        backgroundTheme: "cream",
        fontStyle: "serif",
        imageSize: "medium"
      };
      updatedCount++;
      console.log('Updated home-dg-message -> imagePosition: right');
    } else if (s.id === 'home-president-message') {
      s.data = {
        ...s.data,
        quote: "\"Knowledge will take you to the places you want to go. Make sure that you recognize the significance of knowledge as a part of life and what it can do for you. If the fish is taken out of the water, they would have no life. Knowledge is very similar to you.\"",
        author: "Shri Ganpatbhai Patel (Padma Shri)",
        citation: "Patron-in-Chief & President, Ganpat University",
        category: "President's Message",
        image: "/uploads/president-ganpatbhai-patel.png",
        signature: "",
        imagePosition: "left", // Photo on left
        layout: "editorial",
        backgroundTheme: "parchment",
        fontStyle: "serif",
        imageSize: "medium"
      };
      updatedCount++;
      console.log('Updated home-president-message -> imagePosition: left');
    }
  }

  await prisma.page.update({
    where: { slug: 'home' },
    data: { sections: sections }
  });

  console.log(`Successfully updated ${updatedCount} quote sections in home page.`);
}

main()
  .catch(err => {
    console.error('Error updating quotes:', err);
  })
  .finally(() => prisma.$disconnect());
