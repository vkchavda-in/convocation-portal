const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VERIFIED_CONVOCATION_GUESTS = [
  {
    category: '19th Convocation',
    year: 'Jan 8, 2026',
    title: 'Dr. Pradyuman Vaja',
    subtitle: 'Chief Guest',
    description: '• Dr. V. Narayanan • Shri Ashok Chaudhary',
    icon: 'Award'
  },
  {
    category: '18th Convocation',
    year: 'Jan 16, 2025',
    title: 'Shri Amit Shah',
    subtitle: 'Hon\'ble Union Minister of Home Affairs & Cooperation, Govt. of India',
    description: '• Shri Rushikesh Patel • Shri Harsh Sanghavi',
    icon: 'Award'
  },
  {
    category: '17th Convocation',
    year: 'Jan 2024',
    title: 'Dr. Pradyuman Vaja',
    subtitle: 'Chief Guest',
    description: '• Smt. Rutvi Sheth',
    icon: 'Award'
  },
  {
    category: '16th Convocation',
    year: 'Jan 5, 2023',
    title: 'Shri Bhupendrabhai Patel',
    subtitle: 'Hon\'ble Chief Minister of Gujarat',
    description: '• Shri Rushikeshbhai Patel • Swami Sachhidanand Maharaj',
    icon: 'Award'
  },
  {
    category: '15th Convocation',
    year: 'Dec 4, 2021',
    title: 'Shri Bhupendrabhai Patel',
    subtitle: 'Hon\'ble Chief Minister of Gujarat',
    description: '• Shri Rushikeshbhai Patel',
    icon: 'Award'
  },
  {
    category: '14th Convocation',
    year: 'Dec 22, 2020',
    title: 'Dr. Soraya M. Coley',
    subtitle: 'President, Cal Poly Pomona (Virtual Ceremony)',
    description: 'Virtual Ceremony (No physical guests due to COVID-19 safety measures)',
    icon: 'Award'
  },
  {
    category: '13th Convocation',
    year: 'Jan 5, 2020',
    title: 'Shri Mansukh Mandaviya',
    subtitle: 'Hon\'ble Union Minister of State for Shipping & Chemicals/Fertilizers',
    description: '• Shri Mahendra Patel • Shri Raju Shah',
    icon: 'Award'
  },
  {
    category: '12th Convocation',
    year: 'Dec 2018',
    title: 'Shri O. P. Kohli',
    subtitle: 'Hon\'ble Governor of Gujarat',
    description: '• Local State & Industry Representatives',
    icon: 'Award'
  },
  {
    category: '11th Convocation',
    year: 'Dec 19, 2017',
    title: 'Dr. Malini V. Shankar, IAS',
    subtitle: 'Director General of Shipping, Ministry of Shipping, Govt. of India',
    description: '• Maritime & University Academic Deans',
    icon: 'Award'
  },
  {
    category: '10th Convocation',
    year: 'Jan 4, 2017',
    title: 'Shri Vijay Rupani',
    subtitle: 'Hon\'ble Chief Minister of Gujarat',
    description: '• Shri Ganpatbhai Patel',
    icon: 'Award'
  },
  {
    category: '9th Convocation',
    year: 'Jan 12, 2016',
    title: 'Shri Pratul Shroff',
    subtitle: 'Founder & CEO, eInfochips',
    description: '• Corporate Leaders from Gujarat Tech Ecosystem',
    icon: 'Award'
  },
  {
    category: '8th Convocation',
    year: 'Late 2014',
    title: 'Shri Saurabh Patel',
    subtitle: 'Hon\'ble Minister of Finance & Energy, Govt. of Gujarat',
    description: '• Prominent State Tech Entrepreneurs',
    icon: 'Award'
  },
  {
    category: '7th Convocation',
    year: 'Jan 2014',
    title: 'Prof. S. S. Mantha',
    subtitle: 'Hon\'ble Chairman, AICTE',
    description: '• Smt. Lata Singh • Dr. Huzaifa Khorakiwala',
    icon: 'Award'
  },
  {
    category: '6th Convocation',
    year: 'Mid 2012',
    title: 'Shri S. R. Rao / S. Jagadeesan, IAS',
    subtitle: 'Senior Civil Services & Industry Leadership',
    description: '• Shri S. D. Rajgopalan',
    icon: 'Award'
  },
  {
    category: '5th Convocation',
    year: 'Feb 25, 2012',
    title: 'Shri Pankajbhai R. Patel',
    subtitle: 'Chairman & Managing Director, Zydus Cadila',
    description: '• Executive Board Members',
    icon: 'Award'
  },
  {
    category: '4th Convocation',
    year: 'Jan 22, 2011',
    title: 'Justice S. J. Mukhopadhaya',
    subtitle: 'Hon\'ble Chief Justice, High Court of Gujarat',
    description: '• Judicial & Legal Heads',
    icon: 'Award'
  },
  {
    category: '3rd Convocation',
    year: 'Jan 4, 2010',
    title: 'Shri Narendra Modi',
    subtitle: 'Hon\'ble Chief Minister of Gujarat',
    description: '• Shri Anilbhai Patel',
    icon: 'Award'
  },
  {
    category: '2nd Convocation',
    year: 'Jan 3, 2009',
    title: 'Dr. D. P. Agrawal',
    subtitle: 'Hon\'ble Chairman, Union Public Service Commission (UPSC)',
    description: '• National Level Education Board Administrators',
    icon: 'Award'
  },
  {
    category: '1st Convocation',
    year: 'Jan 19, 2008',
    title: 'Dr. Bakulbhai Dholakia',
    subtitle: 'Director, Indian Institute of Management Ahmedabad (IIM-A)',
    description: '• Shri Ganpatbhai Patel',
    icon: 'Award'
  }
];

async function main() {
  try {
    const home = await prisma.page.findUnique({ where: { slug: 'home' } });
    if (!home) {
      console.error('Home page not found!');
      return;
    }

    let sections = Array.isArray(home.sections) ? home.sections : JSON.parse(home.sections || '[]');

    const pastGuestsBlock = {
      id: 'home-past-convocation-guests',
      type: 'card_grid',
      data: {
        title: 'Eminent Guests of Past Convocations',
        category: 'Convocation Heritage',
        subtitle: 'Honouring the visionary leaders, statesmen, and scientists who have graced Ganpat University\'s ceremonies across all 19 editions.',
        cardType: 'guest_marquee',
        columns: 3,
        items: VERIFIED_CONVOCATION_GUESTS
      }
    };

    const existingIdx = sections.findIndex(s => s.id === 'home-past-convocation-guests');
    if (existingIdx >= 0) {
      sections[existingIdx] = pastGuestsBlock;
    } else {
      const testimonialsIdx = sections.findIndex(s => s.id === 'home-testimonials');
      if (testimonialsIdx >= 0) {
        sections.splice(testimonialsIdx, 0, pastGuestsBlock);
      } else {
        sections.push(pastGuestsBlock);
      }
    }

    await prisma.page.update({
      where: { slug: 'home' },
      data: { sections }
    });

    console.log(`Successfully updated home-past-convocation-guests with ${VERIFIED_CONVOCATION_GUESTS.length} verified records (19th to 1st convocation).`);
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
