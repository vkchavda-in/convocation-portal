import { Brain, Network, Sparkles } from 'lucide-react';

export default function FutureOfEducation() {
  const pillars = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Personalized education pathways driven by artificial intelligence and adaptive learning technologies.',
      highlights: ['Smart Curriculum Design', 'Predictive Analytics', 'Personalized Mentorship']
    },
    {
      icon: Network,
      title: 'Seamless Industry Integration',
      description: 'Breaking down silos between academia and industry for real-world relevance and employment readiness.',
      highlights: ['Live Industry Projects', 'Corporate Co-Creation', 'Workplace Immersion']
    },
    {
      icon: Sparkles,
      title: 'Innovation-First Culture',
      description: 'Cultivating an ecosystem where curiosity, experimentation, and entrepreneurship thrive.',
      highlights: ['Research to Market', 'Student Startups', 'Failure as Learning']
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'white'
          }}>
            Future of Education
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Three foundational pillars driving the transformation of higher education
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10 hover:bg-white/10 hover:border-[var(--champagne-gold)] transition-all group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--champagne-gold)] to-white rounded-full mb-6 group-hover:scale-110 transition-transform">
                <pillar.icon className="text-[var(--midnight-navy)]" size={28} />
              </div>

              <h3 className="mb-4 text-white group-hover:text-[var(--champagne-gold)] transition-colors" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {pillar.title}
              </h3>

              <p className="text-white/70 mb-6 leading-relaxed">
                {pillar.description}
              </p>

              <ul className="space-y-2">
                {pillar.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center text-white/60">
                    <div className="w-1.5 h-1.5 bg-[var(--champagne-gold)] rounded-full mr-3" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
