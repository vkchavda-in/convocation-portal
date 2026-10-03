import { FileText, Download } from 'lucide-react';

export default function Vision2035Manifesto() {
  return (
    <section className="py-24 bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
            <FileText className="text-[#f9c53c]" size={48} />
          </div>

          <h2 className="mb-6" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: '1.1'
          }}>
            Vision 2035 Manifesto
          </h2>

          <p className="text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto" style={{ fontSize: '1.25rem' }}>
            A comprehensive roadmap for transforming Indian higher education into a global leader in innovation,
            research excellence, and student empowerment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-left">
              <h3 className="mb-4 text-[#f9c53c]" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                Strategic Pillars
              </h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Student-Centric Learning Paradigm
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Industry-Academia Integration at Scale
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Research & Innovation Excellence
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Digital Transformation & AI Integration
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-left">
              <h3 className="mb-4 text-[#f9c53c]" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                Key Targets
              </h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  100% placement & entrepreneurship outcomes
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  500+ corporate partnerships
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Top 10 national research ranking
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                  Global recognition and accreditation
                </li>
              </ul>
            </div>
          </div>

          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Download size={20} />
            <span>Download Full Manifesto (PDF)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
