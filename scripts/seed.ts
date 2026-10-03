import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper to parse data.js nested arrays into HTML tables for CustomModule
function parseTableToHtml(table: string[][]): string {
  if (!table || table.length === 0) return '';
  
  let html = '<div class="overflow-x-auto my-8 border border-slate-200/60 rounded-xl shadow-sm bg-white">';
  html += '<table class="min-w-full divide-y divide-slate-200 font-sans text-xs md:text-sm">';
  
  // Find maximum column count
  const maxCols = Math.max(...table.map(r => r.length));

  table.forEach((row, rIdx) => {
    const isHeader = rIdx === 0 || row.some(cell => {
      const c = (cell || '').toLowerCase();
      return c === 'timing' || c === 'time' || c === 'detailed schedule' || c === 'particulars' || c === 'venue';
    });

    if (row.length === 1) {
      // Banners / headers bridging all columns
      html += `<tr class="bg-gradient-to-r from-[#002147] to-[#0a3563] text-white font-bold text-sm tracking-wide"><td colspan="${maxCols}" class="px-6 py-4 border-b border-slate-200/50">${row[0]}</td></tr>`;
    } else if (isHeader) {
      // Column Header
      html += '<tr class="bg-slate-50 border-b font-semibold text-slate-700">';
      row.forEach(cell => {
        html += `<th class="px-6 py-3 text-left border-b border-slate-200">${cell}</th>`;
      });
      html += '</tr>';
    } else {
      // Data cells
      html += '<tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-150">';
      row.forEach(cell => {
        html += `<td class="px-6 py-4 text-slate-650 font-medium leading-relaxed">${cell}</td>`;
      });
      html += '</tr>';
    }
  });
  
  html += '</table></div>';
  return html;
}

// Helpers for sorting/resolving gallery images into specific years
function resolveImageCategory(url: string): string {
  const u = (url || '').toLowerCase();
  if (u.includes('18th')) return '18th-convocation';
  if (u.includes('17th')) return '17th-convocation';
  if (u.includes('16th')) return '16th-convocation';
  if (u.includes('15') || u.includes('convocation15')) return '15th-convocation';
  if (u.includes('14') || u.includes('convocation14')) return '14th-convocation';
  if (u.includes('13') || u.includes('convocation13')) return '13th-convocation';
  if (u.includes('12') || u.includes('convocation12')) return '12th-convocation';
  return 'other';
}

async function main() {
  console.log("Loading Convocation data from data.js...");
  const dataPath = path.join(process.cwd(), 'data.js');
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at ${dataPath}`);
  }
  
  // Require data.js
  const CONVOCATION_DATA = require(dataPath);
  if (!CONVOCATION_DATA) {
    throw new Error("Failed to load CONVOCATION_DATA from data.js");
  }

  console.log("Cleaning database content...");
  await prisma.page.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Users
  console.log("Seeding admin user...");
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  // Pre-generated hash for "admin@2026"
  const adminPasswordHash = "$2b$12$Tj9zX.bM9kDuWQN4zzaLLeJy/YOehUhcl8PTwUVSKInkL0A7HWw4C";
  await prisma.user.create({
    data: {
      username: adminUsername,
      passwordHash: adminPasswordHash,
      name: "Ganpat University Admin",
      role: "SUPER_ADMIN",
      isActive: true
    }
  });

  // 2. Seed Settings
  console.log("Seeding settings...");
  
  const navLinks = [
    { label: "Home", href: "/" },
    { 
      label: "Guests", 
      href: "#",
      children: [
        { label: "Chief Guest", href: "/chief-guest" },
        { label: "Guest of Honour", href: "/guest-of-honour-2026" },
        { label: "President Profile", href: "/president-ganpat-university" },
        { label: "Director General", href: "/director-general" }
      ]
    },
    {
      label: "Schedules",
      href: "#",
      children: [
        { label: "Convocation Schedule", href: "/convocation-schedule" },
        { label: "Gold Medalists & PhD", href: "/schedule-for-gold-medalists-and-phd-awardees" },
        { label: "Awardees Schedule", href: "/schedule-for-the-awardees" },
        { label: "Group Photography", href: "/group-photography" },
        { label: "Bus Transportation", href: "/bus-transportation" }
      ]
    },
    {
      label: "Guidelines",
      href: "#",
      children: [
        { label: "Invitation for Attendees", href: "/19th-convocation-3" },
        { label: "General Guidelines", href: "/guideline-for-convocation" },
        { label: "Campus Venues Map", href: "/layout-for-awardees" }
      ]
    },
    {
      label: "Academic Lists",
      href: "#",
      children: [
        { label: "Scholastic Medals", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Gold-Medal-details.pdf" },
        { label: "Faculty of Pharmacy", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Pharmacy.pdf" },
        { label: "Engineering & Tech", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Engineering-Technology.pdf" },
        { label: "Computer Applications", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Computer-Applications.pdf" },
        { label: "Management Studies", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Management-Studies.pdf" },
        { label: "Faculty of Science", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Science.pdf" },
        { label: "Social Science", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-Social-Sciences-Humanities.pdf" },
        { label: "Architecture & Design", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Architecture-Design-and-Planning.pdf" },
        { label: "Agriculture", href: "https://convocation.guni.ac.in/wp-content/uploads/2026/01/19th_Convo_Faculty-of-Agriculture-Allied-Sciences-Technology.pdf" }
      ]
    },
    { label: "Gallery", href: "/gallery" }
  ];

  const headerSettings = {
    siteName: "19th Convocation",
    subheading: "Ganpat University",
    logoUrl: CONVOCATION_DATA.global.logoUrl,
    logoSize: "lg",
    navLinks: navLinks,
    ctaLabel: "Contact Us",
    ctaUrl: "/contact",
    contact: CONVOCATION_DATA.global.contact,
    socials: CONVOCATION_DATA.global.socials
  };

  const footerSettings = {
    tagline: "The 19th Convocation of Ganpat University marks a milestone celebrating student excellence, academic achievements, and the journey forward into career excellence.",
    copyright: `© 2026 Ganpat University. All rights reserved. ${CONVOCATION_DATA.global.title}.`,
    email: CONVOCATION_DATA.global.contact.email,
    address: "Ganpat Vidyanagar, Mehsana-Gandhinagar Highway, PO - 384012, Gujarat, India",
    columns: [
      {
        heading: "Guests & Patrons",
        links: [
          { label: "Chief Guest", href: "/chief-guest" },
          { label: "Guest of Honour", href: "/guest-of-honour-2026" },
          { label: "President", href: "/president-ganpat-university" },
          { label: "Director General", href: "/director-general" }
        ]
      },
      {
        heading: "Quick Access",
        links: [
          { label: "Schedules", href: "/convocation-schedule" },
          { label: "Attendees Invite", href: "/19th-convocation-3" },
          { label: "Bus Details", href: "/bus-transportation" },
          { label: "Gallery Archive", href: "/gallery" }
        ]
      }
    ],
    socials: [
      { platform: "facebook", url: CONVOCATION_DATA.global.socials.facebook },
      { platform: "twitter", url: CONVOCATION_DATA.global.socials.twitter },
      { platform: "linkedin", url: CONVOCATION_DATA.global.socials.linkedin }
    ]
  };

  const appSettings = {
    siteName: "19th Convocation",
    siteDescription: CONVOCATION_DATA.global.title,
    contactEmail: CONVOCATION_DATA.global.contact.email,
    defaultMetaTitle: CONVOCATION_DATA.global.title,
    defaultMetaDescription: "Official website for the 19th Convocation of Ganpat University (GUNI). Guidelines, schedules, guest bio, layout, and logistics for awardees and guests.",
    maintenanceMode: false,
    maintenanceMessage: "Website is updating. Please try again soon."
  };

  await prisma.setting.create({ data: { key: "theme", value: "theme-convocation" } });
  await prisma.setting.create({ data: { key: "fontPairing", value: "pairing-modern-sans" } });
  await prisma.setting.create({ data: { key: "siteName", value: "19th Convocation" } });
  await prisma.setting.create({ data: { key: "global_header", value: JSON.stringify(headerSettings) } });
  await prisma.setting.create({ data: { key: "global_footer", value: JSON.stringify(footerSettings) } });
  await prisma.setting.create({ data: { key: "app_settings", value: JSON.stringify(appSettings) } });

  // 3. Seed Pages
  console.log("Seeding home page...");
  
  // Home Introduction Gallery
  const introImages = CONVOCATION_DATA.home.sections[0]?.images || [];
  
  // Mapped student testimonials
  const testimonials = [
    {
      title: "Mit Patel",
      subtitle: "Graduating Student (SKPCPER)",
      description: "It was my immense fortune to be the part of Ganpat University-SKPCPER. The institute has always been excellent in imparting knowledge through industry replicate infrastructure and practical approaches.",
      rating: 5
    },
    {
      title: "Lavina Agarwal",
      subtitle: "Graduating Student (Dept of Computer Science)",
      description: "I consider myself fortunate for being a part of this 5-Star International Ganpat University. For Me, Life in Ganpat University - Department of Computer Science has been awesome and inspirational. Safest, greenest and cleanest campus.",
      rating: 5
    },
    {
      title: "Muskan Khoja",
      subtitle: "Graduating Student (SKPCPER)",
      description: "SKPCPER has been nothing less than what I had hoped for. It has nurtured me and made me what I am today. Four years spent here was splendid. It broadens my knowledge and endured me with career excellence.",
      rating: 5
    },
    {
      title: "Poojan Kulshreshtha",
      subtitle: "Graduating Student (GUNI-ICT)",
      description: "It was my great experience to learn Big Data Analytics at Ganpat University-Institute of Computer Technology. I found professors were highly experienced and cooperative. They taught us various concepts with theoretical and practical perceptions.",
      rating: 5
    },
    {
      title: "Mitesh Gajjar",
      subtitle: "Graduating Student (CyberSecurity)",
      description: "CyberSecurity is a growing field and getting a master's degree from GUNI helped me a lot. The best thing about this University is the cross-culture interaction between students from various parts of the world. I am grateful.",
      rating: 5
    },
    {
      title: "Kirti Prajapati",
      subtitle: "Graduating Student (MSW Department)",
      description: "It was a great experience studying at Ganpat University, a memory to cherish for lifetime. My experience at Ganpat University was full of learning and grooming. I am thankful to all the faculties, mentors and entire MSW department.",
      rating: 5
    }
  ];

  // Awardees Corner Home Section Items
  const awardeesCornerItems = [
    {
      category: "Invitation",
      title: "Official Invitation",
      description: "Invitation letter to graduating batch. Check robe collection deposit, timing, dress codes, and confirm attendance.",
      icon: "Mail",
      year: "Action Required",
      highlights: ["Confirm by January 2nd", "Robe cash deposit: Rs. 500", "Strict formal dress code"]
    },
    {
      category: "Schedules",
      title: "Event Schedules",
      description: "Complete timetable for reporting, Gown collection, photoshoots, procession timings, and certificate distribution.",
      icon: "Calendar",
      year: "Schedules",
      highlights: ["Reporting: 9:00 - 10:00 AM", "Procession: 4:30 PM", "Dinner: 7:00 PM onwards"]
    },
    {
      category: "Guidelines",
      title: "Robe & Venue Guidelines",
      description: "Discipline, safety rules, seating arrangements, robing spots and instructions for attendees and parents.",
      icon: "FileText",
      year: "Guidelines",
      highlights: ["Parents seated by 3:30 PM", "Robe returning & refund", "Keep campus clean & green"]
    },
    {
      category: "Transport",
      title: "Bus Transportation",
      description: "Complimentary bus routes, pick-up points, timings and coordinator details from major hubs (Ahmedabad, Gandhinagar, Mehsana).",
      icon: "Truck",
      year: "Logistics",
      highlights: ["Ahmedabad: Jivabhai", "Gandhinagar: Amarsing", "Mehsana: Ashwinbhai"]
    },
    {
      category: "Photography",
      title: "Photography Timelines",
      description: "Timetable for class group photos, gold medalists and PhD interactions with university patrons and guests.",
      icon: "Camera",
      year: "Memories",
      highlights: ["Awardees Group: 10:30 AM", "PhDs & Gold: 3:30 PM", "UVPCE Garden Venue"]
    },
    {
      category: "Locations Map",
      title: "Concern Locations Map",
      description: "Exact coordinates and maps for key venues, certificate tables, photoshoots, and dinner counters.",
      icon: "MapPin",
      year: "Directions",
      highlights: ["Open Air Theater", "Sports Complex Pandal", "Individual Institutes"]
    }
  ];

  const homeSections = [
    {
      id: "home-hero",
      type: "hero",
      data: {
        layoutVariant: "maritime-cinematic",
        bgImage: "/uploads/convocation-08-158a3767.jpg",
        bgImages: [
          "/uploads/convocation-08-158a3767.jpg",
          "/uploads/convocation-14-158a9227.jpg",
          "/uploads/convocation-12-158a9209.jpg",
          "/uploads/convocation-21-mhdv5790.jpg",
          "/uploads/convocation-01-0u3a0768.jpg"
        ],
        title: "19th Convocation",
        subtitle: "January 8, 2026 • 4:30 PM onwards",
        description: "Celebrating the dedication, persistence and academic triumphs of our graduating batch. Welcome awardees, parents, and distinguished guests to the grand ceremony.",
        primaryCTA: { label: "Invitation details", url: "/19th-convocation-3" },
        secondaryCTA: { label: "Logistics & Schedule", url: "/convocation-schedule" }
      }
    },
    {
      id: "home-hero-info",
      type: "hero_info",
      data: {
        title: "19th Convocation",
        tagline: "Ganpat University",
        subtitle: "January 8, 2026 • 4:30 PM onwards",
        description: "Celebrating the dedication, persistence and academic triumphs of our graduating batch. Welcome awardees, parents, and distinguished guests to the grand ceremony.",
        primaryCTA: { label: "Invitation details", url: "/19th-convocation-3" },
        secondaryCTA: { label: "Logistics & Schedule", url: "/convocation-schedule" },
        heroStats: [
          { value: "8th Jan", label: "Ceremony Date", icon: "Calendar" },
          { value: "4:30 PM", label: "Procession Starts", icon: "Clock" },
          { value: "2026", label: "Graduating Batch", icon: "GraduationCap" }
        ]
      }
    },
    {
      id: "home-guests",
      type: "guests",
      data: {
        title: "Our Distinguished Guests",
        category: "19th Convocation",
        subtitle: "Welcoming our guests of honour who will guide and inspire our future leaders.",
        items: [
          {
            category: "The Chief Guest",
            name: "Dr. Pradyuman Vaja",
            role: "Hon'ble Minister for Higher and Technical Education, Government of Gujarat",
            description: "Dr. Pradyuman Ganubhai Vaja is an Indian politician and medical professional from Gujarat. Born in 1969, he completed his MBBS, DGO, and MD from Gujarat University and later earned LLB and LLM degrees. He is known for his commitment to public service, healthcare, and educational advancement.",
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
            description: "Dr. V. Narayanan, Distinguished Scientist (Apex Grade), assumed charge as Secretary, Department of Space, Chairman, Space Commission, and Chairman, ISRO in January 2025. Prior to this, he served as Director, Liquid Propulsion Systems Centre (LPSC), spearheading cryogenic propulsion for India's space missions.",
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
            description: "Shri Ashok Chaudhary is the Chairman of AMUL (Gujarat Cooperative Milk Marketing Federation), leading one of India's largest and most successful cooperative food brands and driving rural development through innovation in dairy cooperative models.",
            image: "/uploads/ashok-chaudhary.png",
            url: "#",
            socials: {
              facebook: "https://www.facebook.com/ganpatuni",
              twitter: "https://twitter.com/Ganpat_Uni",
              instagram: "https://www.instagram.com/ganpatuniversity/"
            }
          }
        ]
      }
    },
    {
      id: "home-awardees-metrics",
      type: "awardees_stats",
      data: {
        title: "19th Convocation at a Glance",
        subtitle: "Academic highlights and achievements of the graduating batch.",
        bgImage: "/uploads/convocation-metrics-bg.jpg"
      }
    },
    {
      id: "home-dg-message",
      type: "quote",
      data: {
        quote: "Education is not merely the acquisition of knowledge; it is the transformation of character, the cultivation of wisdom, and the ignition of a lifelong passion for excellence. Today marks not an end, but a magnificent beginning for every graduate.",
        author: "Dr. Mahendra Sharma",
        citation: "Pro-Chancellor & Director General, Ganpat University",
        category: "Director General's Message",
        image: "/assets/images/portrait.png",
        signature: "/assets/images/signature_transparent.png",
        imagePosition: "right",
        layout: "editorial",
        align: "left",
        fontStyle: "serif",
        showAccents: true,
        backgroundTheme: "cream",
        imageSize: "medium"
      }
    },
    {
      id: "home-president-message",
      type: "quote",
      data: {
        quote: "\"Knowledge will take you to the places you want to go. Make sure that you recognize the significance of knowledge as a part of life and what it can do for you. If the fish is taken out of the water, they would have no life. Knowledge is very similar to you.\"",
        author: "Shri Ganpatbhai Patel (Padma Shri)",
        citation: "Patron-in-Chief & President, Ganpat University",
        category: "President's Message",
        image: "/uploads/president-ganpatbhai-patel.png",
        imagePosition: "left",
        layout: "editorial",
        align: "left",
        fontStyle: "serif",
        showAccents: true,
        backgroundTheme: "parchment",
        imageSize: "medium"
      }
    },
    {
      id: "home-awardees-corner",
      type: "card_grid",
      data: {
        title: "Awardees & Attendees Corner",
        category: "Graduation Central",
        subtitle: "Everything you need to know about attendance, schedules, dress codes, transport and venue locations.",
        cardType: "academic",
        columns: 3,
        items: awardeesCornerItems
      }
    },
    {
      id: "home-testimonials",
      type: "card_grid",
      data: {
        title: "Graduating Students' Testimonial",
        category: "GUNVAN Voices",
        subtitle: "Reflections and experiences of our graduating scholars on their journey at Ganpat University.",
        cardType: "testimonial",
        columns: 3,
        items: testimonials.map(t => ({
          title: t.title,
          subtitle: t.subtitle,
          description: t.description,
          rating: t.rating,
          icon: "Quote"
        }))
      }
    }
  ];

  await prisma.page.create({
    data: {
      slug: "home",
      title: "Home",
      metaTitle: CONVOCATION_DATA.global.title,
      metaDescription: "19th Convocation of Ganpat University. Celebrated on 8th Jan 2026. Schedule, guest biographies, bus details, and attendance confirmation.",
      order: 1,
      isPublished: true,
      sections: homeSections as any
    }
  });

  console.log("Seeding Dignitary subpages...");
  
  // Chief Guest Page
  const cgBio = CONVOCATION_DATA.chiefGuest.sections[1].content;
  await prisma.page.create({
    data: {
      slug: "chief-guest",
      title: "Chief Guest Profile",
      metaTitle: "Chief Guest - Dr. Pradyuman Vaja | 19th Convocation GUNI",
      metaDescription: "Biography of Dr. Pradyuman Vaja, Hon'ble Minister for Higher and Technical Education, Gujarat.",
      order: 2,
      isPublished: true,
      sections: [
        {
          id: "cg-hero",
          type: "hero",
          data: {
            title: "Dr. Pradyuman Vaja",
            subtitle: "Hon'ble Minister for Higher & Technical Education, Government of Gujarat",
            description: "Introducing our esteemed Chief Guest for the 19th Convocation of Ganpat University.",
            isSubpage: true,
            variant: "subpage-dark"
          }
        },
        {
          id: "cg-bio",
          type: "narrative",
          data: {
            title: "Dr. Pradyuman Vaja",
            category: "Chief Guest",
            layout: "editorial",
            imageUrl: "/uploads/pra-vaja-1781068508584.png",
            imageAlt: "Dr. Pradyuman Vaja Portrait",
            body: [
              "Hon'ble Minister for Higher & Technical Education, Government of Gujarat",
              ...cgBio.filter((p: any) => typeof p === 'string' && !p.startsWith("Subheading") && !p.startsWith("Hon'ble"))
            ]
          }
        }
      ] as any
    }
  });

  // Guest of Honour Page
  const gohBio = CONVOCATION_DATA.guestOfHonour.sections[1].content;
  await prisma.page.create({
    data: {
      slug: "guest-of-honour-2026",
      title: "Guest of Honour Profile",
      metaTitle: "Guest of Honour - Dr. V. Narayanan | 19th Convocation GUNI",
      metaDescription: "Biography of Dr. V. Narayanan, Secretary, Department of Space and Chairman, ISRO.",
      order: 3,
      isPublished: true,
      sections: [
        {
          id: "goh-hero",
          type: "hero",
          data: {
            title: "Dr. V. Narayanan",
            subtitle: "Hon'ble Chairman, Indian Space Research Organisation (ISRO)",
            description: "Introducing our esteemed Guest of Honour for the 19th Convocation of Ganpat University.",
            isSubpage: true,
            variant: "subpage-dark"
          }
        },
        {
          id: "goh-bio",
          type: "narrative",
          data: {
            title: "Dr. V. Narayanan",
            category: "Guest of Honour",
            layout: "editorial",
            imageUrl: "/uploads/v-narayanan.png",
            imageAlt: "Dr. V. Narayanan Portrait",
            body: [
              "Hon'ble Chairman, Indian Space Research Organisation (ISRO)",
              ...gohBio.filter((p: any) => typeof p === 'string' && !p.includes("Dr. V. Narayanan, Distinguished Scientist"))
            ]
          }
        }
      ] as any
    }
  });

  // President Page
  const presBio = CONVOCATION_DATA.president.sections[1].content;
  await prisma.page.create({
    data: {
      slug: "president-ganpat-university",
      title: "President Profile",
      metaTitle: "President - Shri Ganpatbhai Patel (Padma Shri) | GUNI",
      metaDescription: "Profile and philanthropic work of Shree Ganpat Bhai Patel, President & Patron-in-Chief of Ganpat University.",
      order: 4,
      isPublished: true,
      sections: [
        {
          id: "pres-hero",
          type: "hero",
          data: {
            title: "Shri Ganpatbhai Patel",
            subtitle: "Patron-in-Chief & President, Ganpat University",
            description: "A visionary engineer, technocrat, and philanthropist dedicated to social upliftment through education.",
            isSubpage: true,
            variant: "subpage-dark"
          }
        },
        {
          id: "pres-bio",
          type: "narrative",
          data: {
            title: "Shri Ganpatbhai Patel (Padma Shri)",
            category: "Patron-in-Chief & President",
            layout: "editorial",
            imageUrl: "/uploads/president-ganpatbhai-patel.png",
            imageAlt: "Shri Ganpatbhai Patel Portrait",
            body: [
              "Patron-in-Chief & President, Ganpat University — A visionary engineer, technocrat, and philanthropist dedicated to social upliftment through education.",
              ...presBio.filter((p: any) => typeof p === 'string' && !p.startsWith("Subheading") && !p.startsWith("Patron-in-Chief") && !p.startsWith("Ganpatbhai Patel"))
            ]
          }
        }
      ] as any
    }
  });

  // Director General Page
  const dgBio = CONVOCATION_DATA.directorGeneral.sections[2].content;
  await prisma.page.create({
    data: {
      slug: "director-general",
      title: "Director General Profile",
      metaTitle: "Director General - Dr. Mahendra Sharma | GUNI",
      metaDescription: "Academic profile and message of Dr. Mahendra Sharma, Pro-Chancellor and Director General, Ganpat University.",
      order: 5,
      isPublished: true,
      sections: [
        {
          id: "dg-hero",
          type: "hero",
          data: {
            title: "Dr. Mahendra Sharma",
            subtitle: "Pro-Chancellor and Director General, Ganpat University",
            description: "Over 25 years of experience developing skill-based and industry-linked educational models.",
            isSubpage: true,
            variant: "subpage-dark"
          }
        },
        {
          id: "dg-bio",
          type: "narrative",
          data: {
            title: "Dr. Mahendra Sharma",
            category: "Pro-Chancellor & Director General",
            layout: "editorial",
            imageUrl: "/assets/images/portrait.png",
            imageAlt: "Dr. Mahendra Sharma Portrait",
            body: [
              "Pro-Chancellor and Director General, Ganpat University — Over 25 years of experience developing skill-based and industry-linked educational models.",
              ...dgBio.filter((p: any) => typeof p === 'string')
            ]
          }
        }
      ] as any
    }
  });

  console.log("Seeding Informational pages...");

  // Invitation Page
  const inviteContent = CONVOCATION_DATA.invitationForAttendees.sections[1].content;
  const inviteEventInfo = CONVOCATION_DATA.invitationForAttendees.sections[2].content[0];
  await prisma.page.create({
    data: {
      slug: "19th-convocation-3",
      title: "Invitation for Attendees",
      metaTitle: "19th Convocation Invitation | Ganpat University",
      metaDescription: "Official convocation invitation, robe deposit details, hashtags, and dress code rules for graduating students.",
      order: 6,
      isPublished: true,
      sections: [
        {
          id: "invite-hero",
          type: "hero",
          data: {
            title: "Invitation for Attendees",
            subtitle: "19th Convocation of Ganpat University",
            description: "Official invitation and instructions for our graduating students.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "invite-details",
          type: "narrative",
          data: {
            title: "Dear Graduating Students,",
            category: "Official Invite",
            layout: "centered",
            body: inviteContent
          }
        },
        {
          id: "invite-cards",
          type: "card_grid",
          data: {
            title: "Event & Logistics Info",
            category: "Event Info",
            cardType: "standard",
            columns: 2,
            items: [
              {
                title: "Schedule Summary",
                description: `${inviteEventInfo.join(" • ")}`,
                icon: "Clock"
              },
              {
                title: "Helpline contacts",
                description: "University Reception: +91 8200788446 \n Examination Section: +91 9328801750",
                icon: "Phone"
              }
            ]
          }
        }
      ] as any
    }
  });

  // Guidelines Page
  await prisma.page.create({
    data: {
      slug: "guideline-for-convocation",
      title: "Guidelines for Convocation",
      metaTitle: "Guidelines for Convocation | 19th Convocation GUNI",
      metaDescription: "Important rules, robe collection locations, discipline codes, and guidelines to be followed during the ceremony.",
      order: 7,
      isPublished: true,
      sections: [
        {
          id: "guides-hero",
          type: "hero",
          data: {
            title: "Guideline for Convocation",
            subtitle: "Attendee Discipline & Code of Conduct",
            description: "Please read and follow these guidelines to maintain decorum during the ceremony.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "guides-list",
          type: "narrative",
          data: {
            title: "Ceremony & Robing Rules",
            category: "Discipline",
            layout: "principles",
            categoryIcon: "FileText",
            body: [
              "Awardees are requested to review and strictly adhere to the following rules regarding registration, procession, photography, and dining during the event."
            ],
            sidePanel: {
              items: [
                "Robe Collection: Get your registration and collect your Robe from the designated places at your respective institutes.",
                "Procession Discipline: Maintain proper distance and discipline during the procession.",
                "Seating: Occupy your pre-allocated seat at the Ceremony Venue before the procession enters the pandal. Do not move the chairs.",
                "Parents Seating: Parents and companions will directly occupy their seats at the Venue by 03:30 PM.",
                "Disbursal Discipline: Maintain discipline, silence, and social distancing while leaving the venue after completion of the ceremony.",
                "Group Photo: Students shall maintain social distance before, during, and after group photos.",
                "Experience & Dining: Capture your memories in the experience zone and have dinner at designated counters in the Dinner Zone."
              ]
            }
          }
        }
      ] as any
    }
  });

  // Venue Layout Map Page
  await prisma.page.create({
    data: {
      slug: "layout-for-awardees",
      title: "Venue Locations Map",
      metaTitle: "Campus Layout & Locations Map | 19th Convocation GUNI",
      metaDescription: "Layout map of Ganpat University campus showing the ceremony tent, photography zones, and dining areas.",
      order: 8,
      isPublished: true,
      sections: [
        {
          id: "layout-hero",
          type: "hero",
          data: {
            title: "Concern Locations Map",
            subtitle: "Ganpat Vidyanagar Campus Layout",
            description: "Interactive map showing the exact layouts for the Convocation ceremony.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "layout-map",
          type: "media",
          data: {
            title: "Campus Seating & Locations Layout Map",
            description: "Complete visual map of the Open Air Theater, parking, robing centers, and dining complexes.",
            mediaUrl: "/uploads/convocation-15-dsc02474.jpg",
            mediaType: "image",
            aspectRatio: "video"
          }
        }
      ] as any
    }
  });

  console.log("Seeding Schedules & Transportation pages...");

  // Convocation Procession Timeline Schedule
  const convoSchedTable = CONVOCATION_DATA.convocationSchedule.sections[0].tables[0];
  await prisma.page.create({
    data: {
      slug: "convocation-schedule",
      title: "Convocation Schedule",
      metaTitle: "Convocation Ceremony Schedule | 19th Convocation GUNI",
      metaDescription: "Detailed schedule and timings of the 19th Convocation procession, welcoming remarks, guest addresses, and medal distributions.",
      order: 9,
      isPublished: true,
      sections: [
        {
          id: "schedule-hero",
          type: "hero",
          data: {
            title: "Convocation Schedule",
            subtitle: "Official Procession & Ceremony Timeline",
            description: "Follow the sequence of events during the 19th Convocation Ceremony.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "schedule-table-block",
          type: "custom",
          data: {
            title: "Procession Timeline (January 8, 2026)",
            subtitle: "Exact timing and sequence of the official convocation activities.",
            body: parseTableToHtml(convoSchedTable),
            fullWidth: false
          }
        }
      ] as any
    }
  });

  // Gold Medalists & PhD Schedule
  const goldMedalistsTable = CONVOCATION_DATA.scheduleGoldMedalistsPhd.sections[1].tables[0];
  const goldMedalistsContacts = CONVOCATION_DATA.scheduleGoldMedalistsPhd.sections[2].content;
  await prisma.page.create({
    data: {
      slug: "schedule-for-gold-medalists-and-phd-awardees",
      title: "Gold Medalists & PhD Schedule",
      metaTitle: "Gold Medalist & PhD Schedule | 19th Convocation GUNI",
      metaDescription: "Rehearsal timing, pre-convocation studio interviews, group photography, and coordinator contacts for PhD and Gold Medalists.",
      order: 10,
      isPublished: true,
      sections: [
        {
          id: "gold-hero",
          type: "hero",
          data: {
            title: "Gold Medalists & PhD",
            subtitle: "Timetable & Rehearsal Guidelines",
            description: "Reporting, rehearsals, photoshoot, and ISRO Chairman interaction schedule for distinguished awardees.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "gold-table-block",
          type: "custom",
          data: {
            title: "Schedule of Activities",
            subtitle: "Timings for Gold Medalists & Doctorates.",
            body: parseTableToHtml(goldMedalistsTable),
            fullWidth: false
          }
        },
        {
          id: "gold-contacts",
          type: "card_grid",
          data: {
            title: "Route & Rehearsal Coordinators",
            category: "Support Team",
            cardType: "standard",
            columns: 2,
            items: goldMedalistsContacts.map((c: string) => {
              const [name, phone] = c.split(" - ");
              return {
                title: name,
                description: `Mobile Contact: ${phone}`,
                icon: "Phone"
              };
            })
          }
        }
      ] as any
    }
  });

  // Schedule for regular Awardees
  const awardeesTable = CONVOCATION_DATA.scheduleAwardees.sections[0].tables[0];
  const awardeesInstructions = CONVOCATION_DATA.scheduleAwardees.sections[0].content[2];
  await prisma.page.create({
    data: {
      slug: "schedule-for-the-awardees",
      title: "Schedule for the Awardees",
      metaTitle: "General Awardees Schedule | 19th Convocation GUNI",
      metaDescription: "Reporting, gown distribution, seating timelines, degree distributions, and dinner timings for graduating students.",
      order: 11,
      isPublished: true,
      sections: [
        {
          id: "awardees-hero",
          type: "hero",
          data: {
            title: "Schedule for the Awardees",
            subtitle: "Student Timeline & Logistics",
            description: "Ensure you arrive on time to collect your gown and take your pre-allocated seat.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "awardees-table-block",
          type: "custom",
          data: {
            title: "Timetable of Events",
            subtitle: "General awardee activities starting from 9:00 AM.",
            body: parseTableToHtml(awardeesTable),
            fullWidth: false
          }
        },
        {
          id: "awardees-notes",
          type: "narrative",
          data: {
            title: "Important Instructions",
            category: "Notice Board",
            layout: "personal_message",
            categoryIcon: "Info",
            body: awardeesInstructions
          }
        }
      ] as any
    }
  });

  // Group Photography Schedule
  const photoTable1 = CONVOCATION_DATA.groupPhotography.sections[0].tables[0];
  const photoTable2 = CONVOCATION_DATA.groupPhotography.sections[0].tables[1];
  await prisma.page.create({
    data: {
      slug: "group-photography",
      title: "Group Photography Schedule",
      metaTitle: "Class Group Photo Schedule | 19th Convocation GUNI",
      metaDescription: "Timing schedule and location guidelines for graduating batch group photoshoots with faculty members.",
      order: 12,
      isPublished: true,
      sections: [
        {
          id: "photo-hero",
          type: "hero",
          data: {
            title: "Group Photography",
            subtitle: "Classroom & Distinguished Photoshoots",
            description: "Timings and venues for capturing graduation batch photographs.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "photo-table-1",
          type: "custom",
          data: {
            title: "Doctorates & Medalists Photoshoot",
            subtitle: "Timing: 3:30 PM",
            body: parseTableToHtml(photoTable1),
            fullWidth: false
          }
        },
        {
          id: "photo-table-2",
          type: "custom",
          data: {
            title: "Faculty Class Photoshoot",
            subtitle: "Timing: 10:30 AM to 1:00 PM",
            body: parseTableToHtml(photoTable2),
            fullWidth: false
          }
        }
      ] as any
    }
  });

  // Bus Transportation routes
  const busTable = CONVOCATION_DATA.busTransportation.sections[0].tables[0];
  const busNotes = CONVOCATION_DATA.busTransportation.sections[1].content[0];
  await prisma.page.create({
    data: {
      slug: "bus-transportation",
      title: "Bus Transportation",
      metaTitle: "Bus Transportation Routes & Contacts | 19th Convocation GUNI",
      metaDescription: "Complimentary bus routes, departure timings, and coordinator phone numbers from Ahmedabad, Gandhinagar, and Mehsana.",
      order: 13,
      isPublished: true,
      sections: [
        {
          id: "bus-hero",
          type: "hero",
          data: {
            title: "Bus Transportation",
            subtitle: "Complimentary Pick-up Routes",
            description: "Ganpat University provides transportation from major hubs. Check pick-up details below.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "bus-table-block",
          type: "custom",
          data: {
            title: "Bus Routes, Schedules & Coordinators",
            subtitle: "Ahmedabad, Gandhinagar, Mehsana and surrounding areas.",
            body: parseTableToHtml(busTable),
            fullWidth: false
          }
        },
        {
          id: "bus-notes",
          type: "narrative",
          data: {
            title: "Coordination Guidelines",
            category: "General instructions",
            layout: "personal_message",
            categoryIcon: "Info",
            body: busNotes
          }
        }
      ] as any
    }
  });

  // Gallery dynamic page
  const galleryImages = [
    { id: 1, title: "Grand Convocation Ceremony", category: "ceremony", aspect: "wide", url: "/uploads/convocation-01-0u3a0768.jpg", description: "The panoramic view of the Ganpat University Open Air Theater decorated for the grand 19th Convocation ceremony." },
    { id: 2, title: "Academic Procession & Dais", category: "ceremony", aspect: "wide", url: "/uploads/convocation-02-0u3a0868.jpg", description: "Academic procession and assembly of university patrons, faculty, and distinguished guests." },
    { id: 3, title: "Lighting of the Ceremonial Lamp", category: "ceremony", aspect: "wide", url: "/uploads/convocation-03-0u3a0987.jpg", description: "Inaugural lamp lighting by dignitaries marking the commencement of the 19th Convocation." },
    { id: 4, title: "Dignitaries & Keynote Address", category: "ceremony", aspect: "wide", url: "/uploads/convocation-04-0u3a1809.jpg", description: "Keynote presidential and leadership addresses inspiring graduates on future career pathways." },
    { id: 5, title: "Gold Medalists Felicitations", category: "awardees", aspect: "wide", url: "/uploads/convocation-05-0u3a1942.jpg", description: "Merit awardees and gold medal recipients being honored on the main dais." },
    { id: 6, title: "Awarding Degree Certificates", category: "awardees", aspect: "wide", url: "/uploads/convocation-06-0u3a1946.jpg", description: "Conferral of undergraduate and postgraduate degree scrolls to graduating students." },
    { id: 7, title: "Graduating Batch Celebration", category: "awardees", aspect: "wide", url: "/uploads/convocation-07-0u3a1947.jpg", description: "Joyful graduation moments and celebratory milestone photographs of the class of 2026." },
    { id: 8, title: "Auditorium & Seating Pandal", category: "campus", aspect: "wide", url: "/uploads/convocation-08-158a3767.jpg", description: "Campus pandal and seating infrastructure prepared for thousands of graduating students and parents." },
    { id: 9, title: "Faculty Deans & Scholars Assembly", category: "ceremony", aspect: "wide", url: "/uploads/convocation-09-158a3954.jpg", description: "Faculty deans, department heads, and scholars in formal academic regalia." },
    { id: 10, title: "Honouring Doctoral PhD Scholars", category: "awardees", aspect: "wide", url: "/uploads/convocation-10-158a3965.jpg", description: "Research scholars receiving their doctoral hoods and degrees." },
    { id: 11, title: "Class of 2026 Group Photo", category: "awardees", aspect: "wide", url: "/uploads/convocation-11-158a3966.jpg", description: "Graduating batch class photograph with university leadership." },
    { id: 12, title: "Open Air Theater Assembly", category: "campus", aspect: "wide", url: "/uploads/convocation-12-158a9209.jpg", description: "Grand panoramic assembly at the Open Air Amphitheater." },
    { id: 13, title: "Academic Robes & Regalia", category: "campus", aspect: "wide", url: "/uploads/convocation-13-158a9214.jpg", description: "Robing and gown collection pavilions across constituent institutions." },
    { id: 14, title: "Ceremonial Dais Panorama", category: "ceremony", aspect: "wide", url: "/uploads/convocation-14-158a9227.jpg", description: "Dignitaries, patron-in-chief, and guest speakers presiding over the ceremony." },
    { id: 15, title: "Campus Gardens & Greenery", category: "campus", aspect: "wide", url: "/uploads/convocation-15-dsc02474.jpg", description: "Scenic views of the lush green Ganpat University campus." },
    { id: 16, title: "Evening Procession & Illuminations", category: "campus", aspect: "wide", url: "/uploads/convocation-16-dsc02488.jpg", description: "Illuminated campus walkways and convocation venue decorations." },
    { id: 17, title: "Student Cheer & Celebration", category: "awardees", aspect: "wide", url: "/uploads/convocation-17-img_0782.jpg", description: "Graduates celebrating their milestone achievement with peers." },
    { id: 18, title: "Parents & Families in Attendance", category: "campus", aspect: "wide", url: "/uploads/convocation-18-img_0803.jpg", description: "Proud parents and families witnessing the graduation ceremony." },
    { id: 19, title: "Diploma & Degree Distribution", category: "awardees", aspect: "wide", url: "/uploads/convocation-19-img_0804.jpg", description: "Departmental certificate and degree distribution counters." },
    { id: 20, title: "Patron-in-Chief Address", category: "ceremony", aspect: "wide", url: "/uploads/convocation-20-img_0901.jpg", description: "President Shri Ganpatbhai Patel addressing the graduating batch." },
    { id: 21, title: "Grand Finale & Tossing of Caps", category: "awardees", aspect: "wide", url: "/uploads/convocation-21-mhdv5790.jpg", description: "Graduates tossing their mortarboard caps in celebration." },
    { id: 22, title: "Dignitary Group Memento", category: "ceremony", aspect: "wide", url: "/uploads/convocation-22-_2001672.jpg", description: "University leadership presenting mementos to distinguished guests." },
    { id: 23, title: "Memorable Convocation Moments", category: "campus", aspect: "wide", url: "/uploads/convocation-23-_2001729.jpg", description: "Unforgettable memories and farewell moments from the 19th Convocation." }
  ];

  const galleryCategories = [
    { id: "all", label: "All Photos" },
    { id: "ceremony", label: "Ceremony & Stage" },
    { id: "awardees", label: "Awardees & Medals" },
    { id: "campus", label: "Campus & Memories" }
  ];

  await prisma.page.create({
    data: {
      slug: "gallery",
      title: "Gallery Archive",
      metaTitle: "Convocation Gallery Archive | Ganpat University",
      metaDescription: "Visual archive of graduation ceremony snapshots spanning 12th to 18th convocations of Ganpat University.",
      order: 14,
      isPublished: true,
      sections: [
        {
          id: "gallery-hero",
          type: "hero",
          data: {
            title: "Gallery Archive",
            subtitle: "Visual History of Excellence",
            description: "Review images of pride and joy from our past convocation ceremonies.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "gallery-photos",
          type: "gallery",
          data: {
            title: "Visual Memories",
            subtitle: "Grouped by convocation years.",
            categories: galleryCategories,
            images: galleryImages
          }
        }
      ] as any
    }
  });

  // Contact Page
  await prisma.page.create({
    data: {
      slug: "contact",
      title: "Contact Us",
      metaTitle: "Contact Convocation Office | Ganpat University",
      metaDescription: "Contact numbers, official email, campus addresses, and support helplines for the 19th Convocation.",
      order: 15,
      isPublished: true,
      sections: [
        {
          id: "contact-hero",
          type: "hero",
          data: {
            title: "Contact Us",
            subtitle: "Support & Helplines",
            description: "Get in touch with the coordination committee for any queries.",
            isSubpage: true,
            variant: "subpage-light"
          }
        },
        {
          id: "contact-main",
          type: "contact",
          data: {
            title: "Send a Message",
            subtitle: "Fill out the form below or reach us directly via email/phone."
          }
        },
        {
          id: "contact-text",
          type: "narrative",
          data: {
            title: "Official Address & Support",
            category: "Contact Details",
            layout: "principles",
            categoryIcon: "Mail",
            body: [
              "Please keep in touch with the support coordinators or examination department for immediate assistance."
            ],
            sidePanel: {
              items: [
                `Official Address: Ganpat University, Ganpat Vidyanagar, Mehsana-Gandhinagar Highway, PO - 384012`,
                `Office Email: ${CONVOCATION_DATA.global.contact.email}`,
                `Office Phone: ${CONVOCATION_DATA.global.contact.phone}`,
                `Working Hours: ${CONVOCATION_DATA.global.contact.workingHours}`
              ]
            }
          }
        }
      ] as any
    }
  });

  // PDF dynamic pages removed, now linked directly as external links in navigation menu.

  console.log("All pages, settings, and users seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
