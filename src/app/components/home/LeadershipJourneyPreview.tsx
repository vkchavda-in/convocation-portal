import { ArrowRight, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function LeadershipJourneyPreview() {
  const milestones = [
    {
      year: '2008',
      title: 'Academic Excellence',
      description: 'Established research centers and innovation labs'
    },
    {
      year: '2014',
      title: 'Industry Integration',
      description: 'Built 200+ corporate partnerships for student success'
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Led institutional shift to hybrid learning ecosystems'
    },
    {
      year: '2024',
      title: 'Vision 2035',
      description: 'Launched future-focused strategic roadmap'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-6">
              <Briefcase className="text-[var(--royal-blue)]" size={18} />
              <span className="text-[var(--royal-blue)]">Career Highlights</span>
            </div>

            <h2 className="mb-6" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)',
              lineHeight: '1.2'
            }}>
              A Legacy of Transformative Leadership
            </h2>

            <p className="text-[var(--midnight-navy)]/70 leading-relaxed mb-8" style={{ fontSize: '1.125rem' }}>
              From pioneering institutional reforms to building world-class innovation ecosystems,
              explore the key milestones that define Dr. Sharma's visionary journey.
            </p>

            <Link
              href="/leadership"
              className="inline-flex items-center space-x-2 text-[var(--royal-blue)] hover:text-[#f9c53c] transition-colors group font-semibold"
            >
              <span>Explore Full Journey</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#f9c53c] to-[var(--royal-blue)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <span className="text-white font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                      {milestone.year}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
                    {milestone.title}
                  </h3>
                  <p className="text-[var(--midnight-navy)]/60">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
