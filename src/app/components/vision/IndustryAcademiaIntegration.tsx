import { Network, Handshake, Target, TrendingUp } from 'lucide-react';

export default function IndustryAcademiaIntegration() {
  const strategies = [
    {
      icon: Handshake,
      title: 'Strategic Corporate Partnerships',
      description: 'Long-term alliances with industry leaders for curriculum co-creation, faculty exchange, and joint research programs.'
    },
    {
      icon: Target,
      title: 'Live Industry Projects',
      description: 'Students work on real business challenges, gaining hands-on experience and industry exposure before graduation.'
    },
    {
      icon: Network,
      title: 'Co-Learning Ecosystems',
      description: 'Corporate professionals and students learn together, bridging theory-practice gap and building professional networks.'
    },
    {
      icon: TrendingUp,
      title: 'Career Readiness Programs',
      description: 'Skill development initiatives, mentorship tracks, and placement support aligned with industry requirements.'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Industry-Academia Integration
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Breaking down silos to create seamless pathways from classroom to career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {strategies.map((strategy, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <strategy.icon className="text-[#f9c53c]" size={24} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)]" style={{ fontSize: '1.25rem' }}>
                {strategy.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {strategy.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
