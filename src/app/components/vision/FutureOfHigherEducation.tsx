import { Telescope } from 'lucide-react';

export default function FutureOfHigherEducation() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-8 shadow-lg shadow-amber-500/20">
            <Telescope className="text-[#060f24]" size={32} />
          </div>

          <h2 className="mb-6" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            The Future of Higher Education
          </h2>

          <p className="text-[var(--midnight-navy)]/80 leading-relaxed mb-8" style={{ fontSize: '1.125rem' }}>
            The next decade will redefine what it means to learn, teach, and lead in higher education. Technology,
            globalization, and changing workforce needs demand institutions that are agile, student-centric, and
            innovation-driven. The future belongs to universities that can seamlessly integrate academic rigor with
            real-world relevance, research with entrepreneurship, and local impact with global perspective.
          </p>

          <div className="bg-[var(--warm-white)] rounded-xl p-12 border border-[var(--midnight-navy)]/10">
            <blockquote className="text-[var(--royal-blue)]" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              fontStyle: 'italic',
              lineHeight: '1.6'
            }}>
              "Education is no longer about transmitting knowledge—it's about cultivating the capacity to learn,
              adapt, and create in a world of constant change."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
