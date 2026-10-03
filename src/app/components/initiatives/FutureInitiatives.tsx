import { Rocket } from 'lucide-react';

export default function FutureInitiatives() {
  const upcoming = [
    {
      title: 'AI Research & Innovation Center',
      timeline: 'Launching 2027',
      description: 'Dedicated facility for AI research, ethics, and application development with industry collaboration.'
    },
    {
      title: 'Global Learning Commons',
      timeline: 'Launching 2028',
      description: 'Physical and virtual space connecting students worldwide for collaborative learning experiences.'
    },
    {
      title: 'Sustainable Solutions Lab',
      timeline: 'Launching 2026',
      description: 'Research and prototyping facility focused on climate tech, clean energy, and circular economy.'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-6 shadow-lg shadow-amber-500/20">
            <Rocket className="text-[#060f24]" size={32} />
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Future Initiatives
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Upcoming programs and facilities planned for the next phase of institutional growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {upcoming.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all"
            >
              <div className="text-[#8C6514] font-bold mb-3">{item.timeline}</div>
              <h3 className="mb-4 text-[var(--midnight-navy)]" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
