import { MessageCircle } from 'lucide-react';

export default function PersonalMessage() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] rounded-2xl p-12 lg:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <MessageCircle className="text-[#f9c53c]" size={28} />
            </div>

            <h2 className="mb-6" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              lineHeight: '1.2'
            }}>
              A Personal Message
            </h2>

            <div className="space-y-6 text-white/90 leading-relaxed" style={{ fontSize: '1.125rem' }}>
              <p>
                Throughout my journey in education, I've been privileged to witness the transformative power
                of learning—not just in classrooms, but in the lives it touches, the communities it strengthens,
                and the futures it creates.
              </p>

              <p>
                My vision has always been simple yet ambitious: to build institutions where every student feels
                empowered to dream big, where innovation is celebrated, where collaboration replaces competition,
                and where excellence is not an aspiration but a lived reality.
              </p>

              <p>
                As we stand at the cusp of a new era in education—shaped by technology, driven by global collaboration,
                and anchored in purpose—I remain committed to leading with integrity, vision, and an unwavering
                belief in the potential of our students.
              </p>

              <p className="pt-6 border-t border-white/20">
                <span className="text-[#f9c53c] font-semibold" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                  — Dr. Mahendra Sharma
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
