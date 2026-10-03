import { TrendingUp, Users, Building2, Award } from 'lucide-react';

export default function ImpactMetrics() {
  const metrics = [
    {
      icon: Building2,
      value: '15+',
      label: 'Years of Leadership',
      description: 'Vice Chancellor Experience'
    },
    {
      icon: Users,
      value: '50,000+',
      label: 'Students Impacted',
      description: 'Across Multiple Institutions'
    },
    {
      icon: TrendingUp,
      value: '200+',
      label: 'Industry Partnerships',
      description: 'Built & Strengthened'
    },
    {
      icon: Award,
      value: '30+',
      label: 'National Recognitions',
      description: 'Awards & Honors'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-full mb-4 group-hover:scale-110 transition-transform">
                <metric.icon className="text-[var(--champagne-gold)]" size={28} />
              </div>
              <div className="mb-2" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                color: 'var(--midnight-navy)'
              }}>
                {metric.value}
              </div>
              <div className="text-[var(--midnight-navy)] mb-1">
                {metric.label}
              </div>
              <div className="text-[var(--midnight-navy)]/60">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
