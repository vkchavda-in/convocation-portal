import { GraduationCap } from 'lucide-react';

export default function EducationalJourney() {
  const education = [
    {
      degree: 'Doctor of Philosophy (Ph.D.)',
      field: 'Educational Leadership & Policy',
      institution: 'Premier Research University',
      year: '2005',
      highlights: ['Dissertation on Innovation Ecosystems in Higher Education', 'Gold Medal for Outstanding Research']
    },
    {
      degree: 'Master of Business Administration (MBA)',
      field: 'Strategic Management',
      institution: 'Top Business School',
      year: '1998',
      highlights: ['Specialization in Organizational Development', 'Dean\'s List Recognition']
    },
    {
      degree: 'Bachelor of Engineering (B.E.)',
      field: 'Computer Science',
      institution: 'Leading Technical University',
      year: '1995',
      highlights: ['First Class with Distinction', 'University Topper in Final Year']
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[var(--royal-blue)]/10 px-4 py-2 rounded-full mb-6">
            <GraduationCap className="text-[var(--royal-blue)]" size={18} />
            <span className="text-[var(--royal-blue)]">Academic Background</span>
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Educational Journey
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            A foundation of academic excellence spanning technology, management, and educational leadership
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {education.map((edu, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-[var(--midnight-navy)] mb-1" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                    {edu.degree}
                  </h3>
                  <p className="text-[var(--royal-blue)] mb-2">
                    {edu.field}
                  </p>
                  <p className="text-[var(--midnight-navy)]/60">
                    {edu.institution}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-xl text-[#060f24] font-bold shadow-md shadow-amber-500/20">
                    {edu.year}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--midnight-navy)]/10">
                <ul className="space-y-2">
                  {edu.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start text-[var(--midnight-navy)]/70">
                      <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
