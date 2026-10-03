import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ThoughtLeadership() {
  const articles = [
    {
      category: 'Policy',
      title: 'Reimagining NEP 2020: From Policy to Practice',
      excerpt: 'An analysis of the National Education Policy implementation challenges and opportunities in Indian higher education.',
      readTime: '8 min read',
      date: 'May 2026'
    },
    {
      category: 'Innovation',
      title: 'The AI Revolution in Indian Universities',
      excerpt: 'How artificial intelligence is reshaping pedagogy, assessment, and student outcomes across institutions.',
      readTime: '6 min read',
      date: 'April 2026'
    },
    {
      category: 'Leadership',
      title: 'Building Resilient Educational Institutions',
      excerpt: 'Lessons from navigating disruption and leading change in a rapidly evolving academic landscape.',
      readTime: '10 min read',
      date: 'March 2026'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-4">
              <BookOpen className="text-[var(--royal-blue)]" size={18} />
              <span className="text-[var(--royal-blue)]">Thought Leadership</span>
            </div>
            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Latest Insights & Publications
            </h2>
            <p className="text-[var(--midnight-navy)]/70" style={{ fontSize: '1.125rem' }}>
              Perspectives on education policy, innovation, and leadership
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={index}
              className="bg-[var(--warm-white)] rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center">
                <BookOpen size={48} className="text-[#f9c53c] group-hover:scale-110 transition-transform" />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8C6514] px-3 py-1 bg-[#f9c53c]/15 border border-[#f9c53c]/30 rounded-full font-bold text-xs">
                    {article.category}
                  </span>
                  <span className="text-[var(--midnight-navy)]/50">
                    {article.date}
                  </span>
                </div>

                <h3 className="mb-3 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors font-semibold" style={{ fontSize: '1.25rem' }}>
                  {article.title}
                </h3>

                <p className="text-[var(--midnight-navy)]/60 mb-4 leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--midnight-navy)]/10">
                  <span className="text-[var(--midnight-navy)]/50">
                    {article.readTime}
                  </span>
                  <button className="text-[var(--royal-blue)] flex items-center space-x-1 group-hover:text-[#8C6514] transition-colors font-semibold">
                    <span>Read More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
