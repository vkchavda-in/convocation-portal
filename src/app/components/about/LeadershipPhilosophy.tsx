import { Compass } from 'lucide-react';

export default function LeadershipPhilosophy() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-6 shadow-lg shadow-amber-500/20">
              <Compass className="text-[#060f24]" size={32} />
            </div>

            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              Leadership Philosophy
            </h2>
          </div>

          <div className="bg-[var(--warm-white)] rounded-xl p-12 border border-[var(--midnight-navy)]/10">
            <p className="mb-6 text-[var(--midnight-navy)]/80 leading-relaxed" style={{ fontSize: '1.125rem' }}>
              My approach to educational leadership is rooted in three interconnected principles that guide
              every decision, initiative, and institutional transformation:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="mb-3 text-[var(--royal-blue)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  1. Student-Centricity Above All
                </h3>
                <p className="text-[var(--midnight-navy)]/70 leading-relaxed">
                  Every policy, every program, every partnership must ultimately serve one purpose: empowering
                  students to discover their potential, develop their capabilities, and deploy their talents to
                  create meaningful impact in the world.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-[var(--royal-blue)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  2. Innovation Through Collaboration
                </h3>
                <p className="text-[var(--midnight-navy)]/70 leading-relaxed">
                  Real innovation happens at the intersection of academia, industry, and society. Building bridges
                  between these worlds—through partnerships, research collaborations, and shared learning—creates
                  ecosystems where breakthrough ideas can flourish.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-[var(--royal-blue)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  3. Excellence Without Compromise
                </h3>
                <p className="text-[var(--midnight-navy)]/70 leading-relaxed">
                  Leadership in education demands an unwavering commitment to quality—in teaching, research,
                  infrastructure, and governance. Excellence is not a destination; it's a relentless pursuit that
                  inspires everyone in the institution to reach higher.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
