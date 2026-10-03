import { Award, Trophy } from 'lucide-react';

export default function AwardsRecognition() {
  const awards = [
    {
      year: '2025',
      title: 'National Excellence in Education Leadership Award',
      organization: 'Ministry of Education, Government of India'
    },
    {
      year: '2024',
      title: 'Innovation Champion of the Year',
      organization: 'FICCI Higher Education Summit'
    },
    {
      year: '2023',
      title: 'Best Vice Chancellor Award',
      organization: 'Association of Indian Universities'
    },
    {
      year: '2022',
      title: 'Industry-Academia Integration Pioneer',
      organization: 'NASSCOM Education Council'
    },
    {
      year: '2021',
      title: 'Distinguished Educator Award',
      organization: 'All India Council for Technical Education'
    },
    {
      year: '2020',
      title: 'Digital Transformation Leader',
      organization: 'EdTech Leadership Forum'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-6 shadow-lg shadow-amber-500/20">
            <Trophy className="text-[#060f24]" size={32} />
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Awards & Recognition
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            National and institutional honors recognizing leadership excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="text-[#f9c53c]" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#8C6514] font-bold mb-2">{award.year}</div>
                  <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
                    {award.title}
                  </h3>
                  <p className="text-[var(--midnight-navy)]/60">
                    {award.organization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
