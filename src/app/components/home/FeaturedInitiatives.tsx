import { ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedInitiatives() {
  const initiatives = [
    {
      category: 'Innovation',
      title: 'Center for Industry 4.0 Excellence',
      description: 'Bridging academia with emerging technologies through hands-on learning labs and corporate partnerships.',
      impact: '500+ Students Trained',
      status: 'Active'
    },
    {
      category: 'Entrepreneurship',
      title: 'Student Startup Incubation Program',
      description: 'Providing mentorship, funding, and resources to transform student ideas into viable ventures.',
      impact: '45 Startups Launched',
      status: 'Active'
    },
    {
      category: 'Global Collaboration',
      title: 'International Research Partnerships',
      description: 'Establishing collaborative research programs with leading universities across the globe.',
      impact: '12 Partner Universities',
      status: 'Expanding'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Featured Initiatives
            </h2>
            <p className="text-[var(--midnight-navy)]/70" style={{ fontSize: '1.125rem' }}>
              Transformative programs shaping the future of education
            </p>
          </div>
          <Link
            href="/initiatives"
            className="hidden md:inline-flex items-center space-x-2 text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors group font-semibold"
          >
            <span>View All Initiatives</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="h-2 bg-gradient-to-r from-[var(--royal-blue)] to-[#f9c53c]" />
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#8C6514] px-3 py-1 bg-[#f9c53c]/15 border border-[#f9c53c]/30 rounded-full font-bold text-xs">
                    {initiative.category}
                  </span>
                  <span className="text-[var(--royal-blue)] flex items-center">
                    <Target size={16} className="mr-1" />
                    {initiative.status}
                  </span>
                </div>

                <h3 className="mb-3 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors font-semibold" style={{ fontSize: '1.25rem' }}>
                  {initiative.title}
                </h3>

                <p className="text-[var(--midnight-navy)]/60 mb-4 leading-relaxed">
                  {initiative.description}
                </p>

                <div className="pt-4 border-t border-[var(--midnight-navy)]/10">
                  <div className="text-[var(--royal-blue)] font-bold">
                    {initiative.impact}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/initiatives"
            className="inline-flex items-center space-x-2 text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors group font-semibold"
          >
            <span>View All Initiatives</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
