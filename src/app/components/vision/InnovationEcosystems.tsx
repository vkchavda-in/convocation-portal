import { Lightbulb } from 'lucide-react';

export default function InnovationEcosystems() {
  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-6 shadow-lg shadow-amber-500/20">
              <Lightbulb className="text-[#060f24]" size={32} />
            </div>

            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Building Innovation Ecosystems
            </h2>
          </div>

          <div className="bg-white rounded-xl p-12 border border-[var(--midnight-navy)]/10">
            <p className="text-[var(--midnight-navy)]/80 leading-relaxed mb-6" style={{ fontSize: '1.125rem' }}>
              True innovation flourishes when institutions create environments where curiosity, experimentation,
              and collaboration are not just encouraged—they're embedded in the culture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="mb-3 text-[var(--royal-blue)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  Physical Infrastructure
                </h3>
                <ul className="space-y-2 text-[var(--midnight-navy)]/70">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Maker spaces & prototyping labs
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Incubation centers with seed funding
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Collaborative research hubs
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-[var(--royal-blue)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  Cultural Enablers
                </h3>
                <ul className="space-y-2 text-[var(--midnight-navy)]/70">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Failure as a learning opportunity
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Multidisciplinary project teams
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    Mentorship from entrepreneurs & researchers
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
