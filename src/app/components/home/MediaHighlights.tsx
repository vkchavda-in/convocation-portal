import { Play, Newspaper, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MediaHighlights() {
  const mediaItems = [
    {
      type: 'video',
      title: 'Keynote at National Education Summit 2026',
      source: 'FICCI Higher Education',
      thumbnail: 'video'
    },
    {
      type: 'article',
      title: 'Leading Change in Higher Education',
      source: 'The Times of India',
      thumbnail: 'article'
    },
    {
      type: 'video',
      title: 'Industry-Academia Integration Panel',
      source: 'NASSCOM EdTech',
      thumbnail: 'video'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Media Highlights
            </h2>
            <p className="text-[var(--midnight-navy)]/70" style={{ fontSize: '1.125rem' }}>
              Featured appearances, interviews, and coverage
            </p>
          </div>
          <Link
            href="/media"
            className="hidden md:inline-flex items-center space-x-2 text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors group font-semibold"
          >
            <span>View All Media</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mediaItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center relative">
                {item.type === 'video' ? (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                ) : (
                  <Newspaper size={48} className="text-[#f9c53c] group-hover:scale-110 transition-transform" />
                )}
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors line-clamp-2 font-semibold">
                  {item.title}
                </h3>
                <p className="text-[var(--midnight-navy)]/60 text-sm">
                  {item.source}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/media"
            className="inline-flex items-center space-x-2 text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors group font-semibold"
          >
            <span>View All Media</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
