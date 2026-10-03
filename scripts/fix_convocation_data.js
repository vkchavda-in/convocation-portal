const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Fetch Home Page
    const home = await prisma.page.findUnique({ where: { slug: 'home' } });
    if (!home) {
      console.error('Home page not found!');
      return;
    }

    let sections = (home.sections || []);

    // 2. Fix Gallery Image Typos in Home Page
    sections = sections.map((sec) => {
      if (sec.type === 'gallery' && sec.data?.images) {
        sec.data.images = sec.data.images.map((img) => {
          let url = img.url;
          if (url === '/uploads/convocation-02-0u3a0889.jpg') url = '/uploads/convocation-02-0u3a0868.jpg';
          if (url === '/uploads/convocation-03-0u3a0907.jpg') url = '/uploads/convocation-03-0u3a0987.jpg';
          if (url === '/uploads/convocation-04-0u3a0915.jpg') url = '/uploads/convocation-04-0u3a1809.jpg';
          return { ...img, url };
        });
      }

      // 3. Fix Quote Blocks (Sharma Sir & Ganpatbhai Patel)
      if (sec.type === 'quote') {
        if (sec.data?.author?.includes('Sharma') || sec.id?.includes('dg')) {
          sec.data = {
            ...sec.data,
            signature: '', // Removed signature as requested
          };
        } else if (sec.data?.author?.includes('Patel') || sec.id?.includes('president')) {
          sec.data = {
            ...sec.data,
            category: 'President\'s Message',
            author: 'Ganpatbhai Patel (Padma Shri)',
            citation: 'Patron-in-Chief, President\nGanpat University',
            image: '/uploads/president-ganpatbhai-patel.png',
            signature: '',
            imagePosition: 'left',
            align: 'left',
            layout: 'editorial',
            showAccents: true,
          };
        }
      }

      return sec;
    });

    // 4. Create / Ensure Past Convocation Guests Block
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

    // Remove old past guest block if exists, then insert before home-testimonials
    const cleanedSections = sections.filter((s) => s.id !== 'home-past-convocation-guests');
    const testimonialsIdx = cleanedSections.findIndex((s) => s.id === 'home-testimonials' || (s.type === 'card_grid' && s.data?.cardType === 'testimonial'));

    if (testimonialsIdx >= 0) {
      cleanedSections.splice(testimonialsIdx, 0, pastGuestsBlock);
    } else {
      cleanedSections.push(pastGuestsBlock);
    }

    // Update Home Page in DB
    await prisma.page.update({
      where: { slug: 'home' },
      data: { sections: cleanedSections },
    });
    console.log('Home page updated successfully with fixed quotes, past convocation guests marquee, and corrected gallery images.');

    // 5. Also fix Gallery page images
    const galleryPage = await prisma.page.findUnique({ where: { slug: 'gallery' } });
    if (galleryPage) {
      let galSections = galleryPage.sections || [];
      galSections = galSections.map((sec) => {
        if (sec.type === 'gallery' && sec.data?.images) {
          sec.data.images = sec.data.images.map((img) => {
            let url = img.url;
            if (url === '/uploads/convocation-02-0u3a0889.jpg') url = '/uploads/convocation-02-0u3a0868.jpg';
            if (url === '/uploads/convocation-03-0u3a0907.jpg') url = '/uploads/convocation-03-0u3a0987.jpg';
            if (url === '/uploads/convocation-04-0u3a0915.jpg') url = '/uploads/convocation-04-0u3a1809.jpg';
            return { ...img, url };
          });
        }
        return sec;
      });

      await prisma.page.update({
        where: { slug: 'gallery' },
        data: { sections: galSections },
      });
      console.log('Gallery page images updated successfully.');
    }
  } catch (err) {
    console.error('Error updating convocation data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
