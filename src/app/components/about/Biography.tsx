import { User } from 'lucide-react';

export default function Biography() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-6">
              <User className="text-[var(--royal-blue)]" size={18} />
              <span className="text-[var(--royal-blue)]">Biography</span>
            </div>

            <h2 className="mb-6" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)',
              lineHeight: '1.2'
            }}>
              A Life Dedicated to Educational Excellence
            </h2>

            <div className="space-y-6 text-[var(--midnight-navy)]/80 leading-relaxed" style={{ fontSize: '1.125rem' }}>
              <p>
                Dr. Mahendra Sharma is a distinguished educational leader with over two decades of transformative
                experience in higher education administration, policy development, and institutional excellence.
              </p>

              <p>
                Currently serving as Vice Chancellor, Dr. Sharma has pioneered innovative reforms that bridge the
                gap between academia and industry, creating pathways for students to thrive in an ever-evolving
                global economy.
              </p>

              <p>
                His leadership philosophy centers on student empowerment, research-driven innovation, and collaborative
                ecosystem building—principles that have guided his successful tenure at multiple prestigious institutions.
              </p>

              <p>
                A sought-after speaker and thought leader, Dr. Sharma has contributed extensively to national education
                policy dialogues and has been instrumental in shaping frameworks that promote quality, accessibility,
                and innovation in Indian higher education.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10">
              <h3 className="mb-4 text-[var(--midnight-navy)]">Current Role</h3>
              <p className="text-[var(--midnight-navy)]/70 mb-2">Vice Chancellor</p>
              <p className="text-[var(--royal-blue)]">Leading Institution | 2018 - Present</p>
            </div>

            <div className="bg-[var(--warm-white)] rounded-xl p-8 border border-[var(--midnight-navy)]/10">
              <h3 className="mb-4 text-[var(--midnight-navy)]">Areas of Expertise</h3>
              <ul className="space-y-2">
                {[
                  'Higher Education Leadership',
                  'Policy Development & Reform',
                  'Industry-Academia Integration',
                  'Research & Innovation Management',
                  'Student-Centric Learning Design',
                  'Institutional Excellence'
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-[var(--midnight-navy)]/70">
                    <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl p-8 text-white">
              <h3 className="mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-white/70">Experience</span>
                  <span>20+ Years</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-white/70">Institutions Led</span>
                  <span>3 Universities</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="text-white/70">Publications</span>
                  <span>75+ Research Papers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Speaking Engagements</span>
                  <span>100+ Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
