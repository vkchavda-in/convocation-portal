import { Globe } from 'lucide-react';

export default function GlobalEducation() {
  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-8 shadow-lg shadow-amber-500/20">
            <Globe className="text-[#060f24]" size={32} />
          </div>

          <h2 className="mb-6" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Global Education Perspective
          </h2>

          <p className="text-[var(--midnight-navy)]/80 leading-relaxed mb-12" style={{ fontSize: '1.125rem' }}>
            Preparing students for leadership in an interconnected world requires global exposure, cross-cultural
            competence, and international collaboration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10">
              <div className="mb-4 text-[#8C6514] font-bold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                12+
              </div>
              <h3 className="mb-2 text-[var(--midnight-navy)]">Partner Universities</h3>
              <p className="text-[var(--midnight-navy)]/60">Across USA, UK, Germany, Australia</p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10">
              <div className="mb-4 text-[#8C6514] font-bold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                500+
              </div>
              <h3 className="mb-2 text-[var(--midnight-navy)]">Student Exchanges</h3>
              <p className="text-[var(--midnight-navy)]/60">Annual international mobility programs</p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10">
              <div className="mb-4 text-[#8C6514] font-bold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                25+
              </div>
              <h3 className="mb-2 text-[var(--midnight-navy)]">Joint Research Projects</h3>
              <p className="text-[var(--midnight-navy)]/60">Collaborative international research</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
