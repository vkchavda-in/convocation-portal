import { Building, CheckCircle2 } from 'lucide-react';

export default function InstitutionBuilding() {
  const achievements = [
    {
      title: 'Infrastructure Modernization',
      items: [
        'Established 15 state-of-the-art research labs',
        'Built Innovation & Entrepreneurship Hub',
        'Created Smart Campus with IoT integration'
      ]
    },
    {
      title: 'Academic Excellence',
      items: [
        'Redesigned 50+ programs aligned with NEP 2020',
        'Launched interdisciplinary research initiatives',
        'Achieved NAAC A++ accreditation'
      ]
    },
    {
      title: 'Student Success',
      items: [
        'Placement rates increased by 40%',
        'Student startups raised ₹100+ Cr funding',
        'International exchange programs expanded 300%'
      ]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-6">
            <Building className="text-[var(--royal-blue)]" size={18} />
            <span className="text-[var(--royal-blue)]">Institution Building</span>
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Building World-Class Institutions
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Strategic initiatives that transformed institutional capabilities and outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all"
            >
              <h3 className="mb-6 text-[var(--midnight-navy)]" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {achievement.title}
              </h3>
              <ul className="space-y-4">
                {achievement.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#f9c53c] flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-[var(--midnight-navy)]/70">{item}</span>
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
