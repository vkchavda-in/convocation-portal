import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting comprehensive fix for all image references and quotes in the database...");

  // 1. Fix Home Page
  const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
  if (homePage) {
    console.log("Updating Home Page...");
    const sections = (homePage.sections as any[]).map((section) => {
      if (section.id === "home-hero") {
        section.data.bgImage = "/uploads/hero-bg.jpg";
        section.data.bgImages = [
          "/uploads/hero-bg.jpg",
          "/uploads/home-intro.jpg",
          "/uploads/gallery-3.jpg",
          "/uploads/gallery-4.jpg",
          "/uploads/gallery-5.jpg",
          "/uploads/gallery-6.jpg"
        ];
      } else if (section.id === "home-guests") {
        section.data.items = [
          {
            category: "The Chief Guest",
            name: "Dr. Pradyuman Vaja",
            role: "Hon'ble Minister for Higher and Technical Education, Government of Gujarat",
            description: "Dr. Pradyuman Ganubhai Vaja is an Indian politician and medical professional from Gujarat. He completed his MBBS, DGO, and MD from Gujarat University and later earned LLB and LLM degrees. He is known for his commitment to public service, healthcare, and educational advancement.",
            image: "/uploads/pra-vaja-1781068508584.png",
            url: "/chief-guest",
            socials: {
              facebook: "https://www.facebook.com/ganpatuni",
              twitter: "https://twitter.com/Ganpat_Uni",
              instagram: "https://www.instagram.com/ganpatuniversity/"
            }
          },
          {
            category: "The Guest of Honour",
            name: "Dr. V. Narayanan",
            role: "Hon'ble Chairman, Indian Space Research Organisation (ISRO)",
            description: "Dr. V. Narayanan, Distinguished Scientist, assumed charge as Secretary, Department of Space, Chairman, Space Commission, and Chairman, ISRO in January 2025. Prior to this, he served as Director, Liquid Propulsion Systems Centre (LPSC), spearheading cryogenic propulsion for India's space program.",
            image: "/uploads/v-narayanan.png",
            url: "/guest-of-honour-2026",
            socials: {
              facebook: "https://www.facebook.com/ganpatuni",
              twitter: "https://twitter.com/Ganpat_Uni",
              instagram: "https://www.instagram.com/ganpatuniversity/"
            }
          },
          {
            category: "The Special Guest",
            name: "Shri Ashok Chaudhary",
            role: "Chairman, AMUL Gujarat Cooperative Milk Marketing Federation (GCMMF)",
            description: "Shri Ashok Chaudhary is the Chairman of AMUL (Gujarat Cooperative Milk Marketing Federation), leading one of India's largest and most successful cooperative food brands and driving rural empowerment through innovation.",
            image: "/uploads/ashok-chaudhary.png",
            url: "#",
            socials: {
              facebook: "https://www.facebook.com/ganpatuni",
              twitter: "https://twitter.com/Ganpat_Uni",
              instagram: "https://www.instagram.com/ganpatuniversity/"
            }
          }
        ];
      } else if (section.id === "home-awardees-metrics") {
        section.data.bgImage = "/uploads/gallery-6.jpg";
      } else if (section.id === "home-dg-message") {
        section.data = {
          quote: "Education is not merely the acquisition of knowledge; it is the transformation of character, the cultivation of wisdom, and the ignition of a lifelong passion for excellence. Today marks not an end, but a magnificent beginning for every graduate.",
          author: "Dr. Mahendra Sharma",
          citation: "Pro-Chancellor & Director General, Ganpat University",
          category: "Director General's Message",
          image: "/assets/images/portrait.png",
          signature: "/assets/images/signature_transparent.png",
          layout: "editorial",
          align: "left",
          fontStyle: "serif",
          imageSize: "large",
          showAccents: true,
          backgroundTheme: "cream"
        };
      } else if (section.id === "home-president-message") {
        section.data = {
          quote: "\"Knowledge will take you to the places you want to go. Make sure that you recognize the significance of knowledge as a part of life and what it can do for you. If the fish is taken out of the water, they would have no life. Knowledge is very similar to you.\"",
          author: "Shri Ganpatbhai Patel (Padma Shri)",
          citation: "Patron-in-Chief & President, Ganpat University",
          category: "President's Message",
          image: "/uploads/president-ganpatbhai-patel.png",
          layout: "editorial",
          align: "left",
          fontStyle: "serif",
          imageSize: "large",
          showAccents: true,
          backgroundTheme: "parchment"
        };
      }
      return section;
    });

    await prisma.page.update({
      where: { slug: "home" },
      data: { sections }
    });
    console.log("Home page updated successfully!");
  }

  // 2. Fix Chief Guest Page
  const cgPage = await prisma.page.findUnique({ where: { slug: "chief-guest" } });
  if (cgPage) {
    console.log("Updating Chief Guest Page...");
    const sections = (cgPage.sections as any[]).map((section) => {
      if (section.id === "cg-bio") {
        section.data.imageUrl = "/uploads/pra-vaja-1781068508584.png";
      }
      return section;
    });
    await prisma.page.update({
      where: { slug: "chief-guest" },
      data: { sections }
    });
    console.log("Chief Guest page updated successfully!");
  }

  // 3. Fix Guest of Honour Page
  const gohPage = await prisma.page.findUnique({ where: { slug: "guest-of-honour-2026" } });
  if (gohPage) {
    console.log("Updating Guest of Honour Page...");
    const sections = (gohPage.sections as any[]).map((section) => {
      if (section.id === "goh-bio") {
        section.data.imageUrl = "/uploads/v-narayanan.png";
      }
      return section;
    });
    await prisma.page.update({
      where: { slug: "guest-of-honour-2026" },
      data: { sections }
    });
    console.log("Guest of Honour page updated successfully!");
  }

  // 4. Fix President Page
  const presPage = await prisma.page.findUnique({ where: { slug: "president-ganpat-university" } });
  if (presPage) {
    console.log("Updating President Page...");
    const sections = (presPage.sections as any[]).map((section) => {
      if (section.id === "pres-bio") {
        section.data.imageUrl = "/uploads/president-ganpatbhai-patel.png";
      }
      return section;
    });
    await prisma.page.update({
      where: { slug: "president-ganpat-university" },
      data: { sections }
    });
    console.log("President page updated successfully!");
  }

  // 5. Fix Director General Page
  const dgPage = await prisma.page.findUnique({ where: { slug: "director-general" } });
  if (dgPage) {
    console.log("Updating Director General Page...");
    const sections = (dgPage.sections as any[]).map((section) => {
      if (section.id === "dg-bio") {
        section.data.imageUrl = "/assets/images/portrait.png";
      }
      return section;
    });
    await prisma.page.update({
      where: { slug: "director-general" },
      data: { sections }
    });
    console.log("Director General page updated successfully!");
  }

  // 6. Fix Layout Map Page
  const layoutPage = await prisma.page.findUnique({ where: { slug: "layout-for-awardees" } });
  if (layoutPage) {
    console.log("Updating Layout Map Page...");
    const sections = (layoutPage.sections as any[]).map((section) => {
      if (section.id === "layout-map") {
        section.data.mediaUrl = "/uploads/gallery-3.jpg";
      }
      return section;
    });
    await prisma.page.update({
      where: { slug: "layout-for-awardees" },
      data: { sections }
    });
    console.log("Layout Map page updated successfully!");
  }

  // 7. Fix Gallery Page
  const galleryPage = await prisma.page.findUnique({ where: { slug: "gallery" } });
  if (galleryPage) {
    console.log("Updating Gallery Page...");
    const galleryItems = [
      {
        id: 1,
        title: "Grand Convocation Amphitheater",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/hero-bg.jpg",
        description: "The panoramic view of the Ganpat University Open Air Theater decorated for the grand 19th Convocation ceremony."
      },
      {
        id: 2,
        title: "Graduation Procession & Ceremony Hall",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/home-intro.jpg",
        description: "Academic procession and assembly of university patrons, faculty, and distinguished guests."
      },
      {
        id: 3,
        title: "Campus Aerial View & Pandal Setup",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/gallery-3.jpg",
        description: "Campus gardens and venue infrastructure prepared for thousands of graduating students and parents."
      },
      {
        id: 4,
        title: "Academic Excellence & Robing Zone",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/gallery-4.jpg",
        description: "Robing and gown collection pavilions across constituent institutions."
      },
      {
        id: 5,
        title: "Graduating Scholars Celebrating",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/gallery-5.jpg",
        description: "Joyful graduation moments and celebratory milestone photographs of the class of 2026."
      },
      {
        id: 6,
        title: "Gold Medalists Felicitations",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/gallery-6.jpg",
        description: "Merit awardees and gold medal recipients being honored on the main dais."
      },
      {
        id: 7,
        title: "Visionary Leadership Address",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/the-visionary-leadersip-1781068506786.png",
        description: "Keynote presidential and leadership addresses inspiring graduates on future career pathways."
      },
      {
        id: 8,
        title: "Transformational Academic Models",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/transformational-leadership-1781068507972.png",
        description: "Highlighting Ganpat University's industry-aligned educational initiatives and corporate partnerships."
      },
      {
        id: 9,
        title: "Dignitaries on Dais",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/leaders-1781068505737.png",
        description: "Patron-in-Chief, President, and Chief Guests gracing the ceremonial stage."
      },
      {
        id: 10,
        title: "Visionary Educationalist Felicitations",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/visionary-educationalist-1781068509084.png",
        description: "Special recognitions honoring academic excellence and societal transformation."
      },
      {
        id: 11,
        title: "Academic Values & Heritage",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/academic-values-1781068500128.png",
        description: "Preserving the timeless values of Vidya and integrity in higher education."
      },
      {
        id: 12,
        title: "BusinessWorld Leadership Coverage",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/businessworld-1781068501113.png",
        description: "National media feature celebrating Ganpat University's groundbreaking milestones."
      },
      {
        id: 13,
        title: "Chitralekha Feature Spread",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/chitralekhan-1781068503275.png",
        description: "State-wide press coverage of the annual convocation and student achievements."
      },
      {
        id: 14,
        title: "Commemorative Coffee Table Book",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/how-dr-m-sharma-is-revolutiocoffee-table-book-pdfa-1781068504389.png",
        description: "Special commemorative edition documenting two decades of educational transformation."
      },
      {
        id: 15,
        title: "Convocation Regalia Assembly",
        category: "19th-convocation",
        aspect: "wide",
        url: "/uploads/23-1781068498795.png",
        description: "Faculty deans, department heads, and scholars in formal academic regalia."
      },
      {
        id: 16,
        title: "Hon'ble Minister Dr. Pradyuman Vaja Address",
        category: "19th-convocation",
        aspect: "square",
        url: "/uploads/pra-vaja-1781068508584.png",
        description: "Chief Guest Dr. Pradyuman Vaja addressing the convocation assembly."
      },
      {
        id: 17,
        title: "Hon'ble ISRO Chairman Dr. V. Narayanan Keynote",
        category: "19th-convocation",
        aspect: "square",
        url: "/uploads/v-narayanan.png",
        description: "Guest of Honour Dr. V. Narayanan delivering the convocation keynote on space innovation and leadership."
      },
      {
        id: 18,
        title: "Special Guest Shri Ashok Chaudhary (AMUL)",
        category: "19th-convocation",
        aspect: "square",
        url: "/uploads/ashok-chaudhary.png",
        description: "Special Guest Shri Ashok Chaudhary encouraging young entrepreneurs and graduates."
      },
      {
        id: 19,
        title: "President Padma Shri Ganpatbhai Patel",
        category: "19th-convocation",
        aspect: "tall",
        url: "/uploads/president-ganpatbhai-patel.png",
        description: "Patron-in-Chief & President Shri Ganpatbhai Patel sharing his inspiring wisdom."
      },
      {
        id: 20,
        title: "Hon'ble Prime Minister Narendra Modi at GUNI",
        category: "18th-convocation",
        aspect: "square",
        url: "/uploads/narendramodi-1781068508407.avif",
        description: "Historical convocation address by Hon'ble Prime Minister Narendra Modi at Ganpat University."
      },
      {
        id: 21,
        title: "Hon'ble Union Minister Amit Shah Keynote",
        category: "18th-convocation",
        aspect: "square",
        url: "/uploads/amit-shah-1781068507872.avif",
        description: "Dignitary address by Hon'ble Union Minister Amit Shah at the annual convocation ceremony."
      },
      {
        id: 22,
        title: "Hon'ble Chief Minister Bhupendrabhai Patel",
        category: "17th-convocation",
        aspect: "square",
        url: "/uploads/bhupendra3-1781068508006.avif",
        description: "Chief Minister Bhupendrabhai Patel addressing scholars and awarding degrees."
      },
      {
        id: 23,
        title: "Former Chief Minister Vijay Rupani Address",
        category: "16th-convocation",
        aspect: "square",
        url: "/uploads/vijayrupani-1781068509033.avif",
        description: "Distinguished address by Former Chief Minister Vijay Rupani at the convocation ceremony."
      },
      {
        id: 24,
        title: "Union Minister Mansukh Mandaviya",
        category: "15th-convocation",
        aspect: "square",
        url: "/uploads/mansukh-1781068508134.avif",
        description: "Hon'ble Union Minister Mansukh Mandaviya addressing graduating medical and pharmacy students."
      }
    ];

    const categories = [
      { id: "all", label: "All Photos" },
      { id: "19th-convocation", label: "19th Convocation" },
      { id: "18th-convocation", label: "18th Convocation" },
      { id: "17th-convocation", label: "17th Convocation" },
      { id: "16th-convocation", label: "16th Convocation" },
      { id: "15th-convocation", label: "15th Convocation" }
    ];

    const sections = (galleryPage.sections as any[]).map((section) => {
      if (section.id === "gallery-photos") {
        section.data.images = galleryItems;
        section.data.categories = categories;
      }
      return section;
    });

    await prisma.page.update({
      where: { slug: "gallery" },
      data: { sections }
    });
    console.log("Gallery page updated successfully!");
  }

  console.log("\nALL DATABASE UPDATES COMPLETED SUCCESSFULLY!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
