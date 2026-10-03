import Masonry from 'react-responsive-masonry';
import { Image } from 'lucide-react';

interface GalleryGridProps {
  activeCategory: string;
}

export default function GalleryGrid({ activeCategory }: GalleryGridProps) {
  const images = [
    { id: 1, category: 'leadership', title: 'National Education Summit 2026', aspect: 'tall' },
    { id: 2, category: 'convocations', title: 'Annual Convocation 2026', aspect: 'wide' },
    { id: 3, category: 'international', title: 'Visit to Stanford University', aspect: 'square' },
    { id: 4, category: 'industry', title: 'MoU Signing with Tech Giant', aspect: 'square' },
    { id: 5, category: 'students', title: 'Student Interaction Session', aspect: 'tall' },
    { id: 6, category: 'campus', title: 'Innovation Hub Inauguration', aspect: 'wide' },
    { id: 7, category: 'innovation', title: 'Startup Pitch Competition', aspect: 'square' },
    { id: 8, category: 'leadership', title: 'Policy Roundtable Discussion', aspect: 'square' },
    { id: 9, category: 'convocations', title: 'Graduation Ceremony', aspect: 'tall' },
    { id: 10, category: 'international', title: 'International Conference Keynote', aspect: 'wide' },
    { id: 11, category: 'industry', title: 'Corporate Partnership Summit', aspect: 'square' },
    { id: 12, category: 'students', title: 'Student Innovation Showcase', aspect: 'tall' }
  ];

  const filteredImages = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory);

  const getAspectClass = (aspect: string) => {
    switch (aspect) {
      case 'tall':
        return 'aspect-[3/4]';
      case 'wide':
        return 'aspect-[16/9]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <Masonry columnsCount={3} gutter="1.5rem">
      {filteredImages.map((image) => (
        <div
          key={image.id}
          className="bg-[var(--warm-white)] rounded-lg overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[var(--champagne-gold)] hover:shadow-xl transition-all group cursor-pointer"
        >
          <div className={`${getAspectClass(image.aspect)} bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center relative overflow-hidden`}>
            <Image size={48} className="text-[var(--champagne-gold)] group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white px-4 py-2 bg-white/20 backdrop-blur-sm rounded">
                View Image
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
              {image.title}
            </h3>
          </div>
        </div>
      ))}
    </Masonry>
  );
}
