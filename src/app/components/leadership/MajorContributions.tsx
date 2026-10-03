import { Sparkles } from 'lucide-react';

export default function MajorContributions() {
  const contributions = [
    {
      category: 'Policy & Governance',
      title: 'National Education Policy Implementation',
      description: 'Led institutional adoption of NEP 2020 framework, serving as a model for other universities across the country.',
      impact: 'Consulted by 15+ institutions'
    },
    {
      category: 'Industry Collaboration',
      title: 'Corporate Partnership Ecosystem',
      description: 'Built strategic alliances with 200+ companies, creating pathways for internships, placements, and collaborative research.',
      impact: '₹500+ Cr partnership value'
    },
    {
      category: 'Innovation & Research',
      title: 'Research Excellence Initiative',
      description: 'Established grant programs, mentorship networks, and publication incentives that tripled research output.',
      impact: '500+ publications, 100+ patents'
    },
    {
      category: 'Student Empowerment',
      title: 'Entrepreneurship & Innovation Culture',
      description: 'Created incubation facilities, seed funding programs, and mentorship networks for student entrepreneurs.',
      impact: '45 successful startups'
    },
    {
      category: 'Global Outreach',
      title: 'International Partnerships',
      description: 'Forged collaborations with universities in USA, UK, Germany, and Australia for research and student exchange.',
      impact: '12 partner universities'
    },
    {
      category: 'Digital Transformation',
      title: 'Technology-Enabled Learning',
      description: 'Championed adoption of AI-powered learning platforms, virtual labs, and data-driven decision-making.',
      impact: 'Hybrid learning for all programs'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-full mb-6 shadow-lg shadow-amber-500/20">
            <Sparkles className="text-[#060f24]" size={32} />
          </div>

          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Major Contributions
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Landmark initiatives that shaped institutional trajectory and national impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contributions.map((contribution, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group"
            >
              <div className="h-2 bg-gradient-to-r from-[var(--royal-blue)] to-[#f9c53c]" />
              <div className="p-8">
                <div className="text-[#060f24] font-bold text-xs px-3 py-1 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-xl shadow-sm inline-block mb-4">
                  {contribution.category}
                </div>
                <h3 className="mb-3 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors" style={{ fontSize: '1.25rem' }}>
                  {contribution.title}
                </h3>
                <p className="text-[var(--midnight-navy)]/70 mb-4 leading-relaxed">
                  {contribution.description}
                </p>
                <div className="pt-4 border-t border-[var(--midnight-navy)]/10">
                  <div className="text-[var(--royal-blue)]">{contribution.impact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
