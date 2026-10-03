import { Lightbulb } from 'lucide-react';

export default function LeadershipPhilosophySection() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#f9c53c] to-[var(--royal-blue)] rounded-full mb-8 shadow-md">
            <Lightbulb className="text-white" size={32} />
          </div>

          <h2 className="mb-6" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Leadership is a Journey, Not a Destination
          </h2>

          <p className="text-[var(--midnight-navy)]/80 leading-relaxed mb-8" style={{ fontSize: '1.125rem' }}>
            True leadership in education is measured not by the accolades earned, but by the institutions strengthened,
            the lives transformed, and the ecosystems built. It requires courage to challenge the status quo, wisdom to
            balance tradition with innovation, and humility to learn from every stakeholder—students, faculty, industry
            partners, and the community at large.
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] mx-auto rounded-full" />
        </div>
      </div>
    </section>
  );
}
