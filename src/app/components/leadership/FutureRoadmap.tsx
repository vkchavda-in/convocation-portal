import { Rocket, ArrowRight } from 'lucide-react';

export default function FutureRoadmap() {
  const roadmapItems = [
    {
      phase: '2026-2028',
      title: 'Next-Gen Learning Infrastructure',
      initiatives: [
        'AI-powered personalized learning pathways',
        'Virtual reality labs for immersive education',
        'Global classroom connectivity'
      ]
    },
    {
      phase: '2028-2030',
      title: 'Research & Innovation Scaling',
      initiatives: [
        'Interdisciplinary research hubs',
        'Industry-sponsored chairs and fellowships',
        'Sustainable solutions lab'
      ]
    },
    {
      phase: '2030-2035',
      title: 'Ecosystem Leadership',
      initiatives: [
        'Regional innovation cluster development',
        'Policy think tank for higher education',
        'Alumni-driven global impact network'
      ]
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <Rocket className="text-[#f9c53c]" size={32} />
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'white'
          }}>
            Future Roadmap: Vision 2035
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Strategic priorities for the next decade of educational transformation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roadmapItems.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 hover:border-[#f9c53c] transition-all"
            >
              <div className="text-[#f9c53c] font-bold mb-4" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {item.phase}
              </div>
              <h3 className="mb-6 text-white font-bold" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </h3>
              <ul className="space-y-3">
                {item.initiatives.map((initiative, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/80">
                    <ArrowRight className="text-[#f9c53c] flex-shrink-0 mt-1" size={18} />
                    {initiative}
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
