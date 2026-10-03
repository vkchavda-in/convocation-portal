import { Newspaper } from 'lucide-react';

export default function NewsCoverage() {
  const news = [
    {
      headline: 'Leading University Tops National Rankings Under Dr. Sharma\'s Leadership',
      source: 'Education Today',
      date: 'June 2026'
    },
    {
      headline: 'Innovation Hub Launched with ₹50 Cr Industry Investment',
      source: 'Business Standard',
      date: 'May 2026'
    },
    {
      headline: 'University Signs MoUs with 5 International Partners',
      source: 'The Hindu',
      date: 'April 2026'
    },
    {
      headline: 'Student Startups Backed by University Raise ₹100 Cr',
      source: 'Economic Times',
      date: 'March 2026'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <h2 className="mb-12 text-center" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--midnight-navy)'
        }}>
          News Coverage
        </h2>

        <div className="space-y-6 max-w-4xl mx-auto">
          {news.map((item, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl p-6 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center">
                    <Newspaper className="text-[#f9c53c]" size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
                    {item.headline}
                  </h3>
                  <div className="flex items-center gap-4 text-[var(--midnight-navy)]/60">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
