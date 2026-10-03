import { Calendar } from 'lucide-react';

export default function CareerMilestones() {
  const milestones = [
    {
      year: '2018',
      title: 'Vice Chancellor - Current Institution',
      description: 'Leading comprehensive transformation initiatives, research excellence, and industry partnerships'
    },
    {
      year: '2014',
      title: 'Pro Vice Chancellor - Leading Technical University',
      description: 'Spearheaded academic reforms and established innovation centers'
    },
    {
      year: '2010',
      title: 'Dean - Faculty of Engineering & Technology',
      description: 'Launched industry-integrated curriculum and research collaborations'
    },
    {
      year: '2006',
      title: 'Professor & Head - Department of Management',
      description: 'Built entrepreneurship programs and corporate partnerships'
    },
    {
      year: '2002',
      title: 'Associate Professor - Business School',
      description: 'Pioneered case-based teaching and executive education programs'
    },
    {
      year: '1998',
      title: 'Assistant Professor - Management Studies',
      description: 'Established research focus on innovation and organizational development'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-6">
            <Calendar className="text-[var(--royal-blue)]" size={18} />
            <span className="text-[var(--royal-blue)]">Career Timeline</span>
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Career Milestones
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Two decades of progressive leadership across premier institutions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--royal-blue)] to-[#f9c53c] hidden md:block" />

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex gap-8 group">
                  {/* Year indicator */}
                  <div className="flex-shrink-0 w-24">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full flex items-center justify-center text-[#060f24] font-bold shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform md:ml-0 ml-auto">
                      <span style={{ fontFamily: 'var(--font-heading)' }}>{milestone.year}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-[var(--warm-white)] rounded-xl p-6 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all">
                      <h3 className="mb-2 text-[var(--midnight-navy)]" style={{ fontSize: '1.25rem' }}>
                        {milestone.title}
                      </h3>
                      <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
