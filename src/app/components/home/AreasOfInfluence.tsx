import { GraduationCap, Lightbulb, Globe2, Rocket, Users, TrendingUp } from 'lucide-react';

export default function AreasOfInfluence() {
  const areas = [
    {
      icon: GraduationCap,
      title: 'Higher Education Reform',
      description: 'Modernizing curricula, governance, and quality assurance frameworks'
    },
    {
      icon: Lightbulb,
      title: 'Research & Innovation',
      description: 'Building research centers and fostering a culture of inquiry'
    },
    {
      icon: Globe2,
      title: 'Industry-Academia Integration',
      description: 'Creating seamless pathways between education and employment'
    },
    {
      icon: Rocket,
      title: 'Entrepreneurship Ecosystems',
      description: 'Incubating startups and nurturing student entrepreneurship'
    },
    {
      icon: Users,
      title: 'Student-Centric Learning',
      description: 'Designing experiences that empower and inspire learners'
    },
    {
      icon: TrendingUp,
      title: 'Digital Transformation',
      description: 'Leveraging AI and technology for future-ready education'
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
            Areas of Influence
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Strategic domains where visionary leadership is driving systemic change
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 border border-[var(--midnight-navy)]/10 hover:border-[var(--champagne-gold)] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <area.icon className="text-[var(--champagne-gold)]" size={24} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
                {area.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
