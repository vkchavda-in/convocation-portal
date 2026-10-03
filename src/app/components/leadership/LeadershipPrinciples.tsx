import { Target, Users2, Compass, Zap } from 'lucide-react';

export default function LeadershipPrinciples() {
  const principles = [
    {
      icon: Target,
      title: 'Vision-Driven Strategy',
      description: 'Every decision, initiative, and investment aligns with a clear long-term vision for institutional excellence and societal impact.'
    },
    {
      icon: Users2,
      title: 'Collaborative Leadership',
      description: 'Building consensus, empowering teams, and fostering a culture where every stakeholder contributes to shared success.'
    },
    {
      icon: Compass,
      title: 'Ethical Decision-Making',
      description: 'Unwavering commitment to integrity, transparency, and accountability in governance and institutional operations.'
    },
    {
      icon: Zap,
      title: 'Agility & Innovation',
      description: 'Embracing change, experimenting with new models, and rapidly adapting to evolving educational and technological landscapes.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Leadership Principles
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Core tenets that guide decision-making and institutional transformation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <principle.icon className="text-[#f9c53c]" size={28} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {principle.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
