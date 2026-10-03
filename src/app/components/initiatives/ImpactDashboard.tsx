import { TrendingUp, Users, Briefcase, Award } from 'lucide-react';

export default function ImpactDashboard() {
  const metrics = [
    { icon: Users, label: 'Students Impacted', value: '50,000+', trend: '+25% YoY' },
    { icon: Briefcase, label: 'Industry Partnerships', value: '220+', trend: '+40% YoY' },
    { icon: Award, label: 'Startups Launched', value: '45', trend: 'Active' },
    { icon: TrendingUp, label: 'Research Projects', value: '150+', trend: 'Ongoing' }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)'
          }}>
            Collective Impact Dashboard
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Real outcomes from initiatives transforming student experience and institutional excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-4 shadow-lg shadow-amber-500/20">
                <metric.icon className="text-[#060f24]" size={28} />
              </div>
              <div className="mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>
                {metric.value}
              </div>
              <div className="text-white/90 mb-2">{metric.label}</div>
              <div className="text-[#f9c53c] font-bold">{metric.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
