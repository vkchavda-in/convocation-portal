import { Heart, Eye, Zap, Shield, Users2, Globe } from 'lucide-react';

export default function CoreValues() {
  const values = [
    {
      icon: Heart,
      title: 'Integrity',
      description: 'Upholding the highest ethical standards in all decisions and actions'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Fostering open communication and accountability at every level'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Embracing change and encouraging creative problem-solving'
    },
    {
      icon: Shield,
      title: 'Excellence',
      description: 'Pursuing quality and continuous improvement relentlessly'
    },
    {
      icon: Users2,
      title: 'Inclusivity',
      description: 'Creating opportunities for all, regardless of background'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'Preparing students for leadership in a interconnected world'
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
            Core Values
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Guiding principles that define leadership approach and institutional culture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <value.icon className="text-[#f9c53c]" size={28} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {value.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
