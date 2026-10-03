import { Brain, Cpu, Database, Zap } from 'lucide-react';

export default function AIDigitalLearning() {
  const features = [
    {
      icon: Brain,
      title: 'Personalized Learning Pathways',
      description: 'AI algorithms adapt content difficulty, pacing, and format to individual learning styles and progress.'
    },
    {
      icon: Cpu,
      title: 'Intelligent Assessment',
      description: 'Automated, continuous evaluation with instant feedback and competency-based progression tracking.'
    },
    {
      icon: Database,
      title: 'Data-Driven Insights',
      description: 'Predictive analytics identify at-risk students, optimize resource allocation, and inform strategic decisions.'
    },
    {
      icon: Zap,
      title: 'Immersive Experiences',
      description: 'Virtual labs, simulations, and AR/VR environments bring abstract concepts to life.'
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
            AI & Digital Learning
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Leveraging artificial intelligence to create adaptive, personalized, and scalable education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-[#f9c53c]" size={28} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)]" style={{ fontSize: '1.125rem' }}>
                {feature.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
