import { Mic, Handshake, Newspaper, FlaskConical } from 'lucide-react';

export default function CollaborationCategories() {
  const categories = [
    {
      icon: Mic,
      title: 'Speaking Invitations',
      description: 'Keynotes, panel discussions, and expert talks on education leadership and innovation.'
    },
    {
      icon: Handshake,
      title: 'Academic Partnerships',
      description: 'Institutional collaborations, exchange programs, and joint initiatives.'
    },
    {
      icon: Newspaper,
      title: 'Media Requests',
      description: 'Interviews, features, and expert commentary on higher education topics.'
    },
    {
      icon: FlaskConical,
      title: 'Research Collaboration',
      description: 'Joint research projects, publications, and knowledge-sharing opportunities.'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            Collaboration Opportunities
          </h2>
          <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Explore ways to connect, collaborate, and create impact together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all text-center group cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <category.icon className="text-[#f9c53c]" size={28} />
              </div>
              <h3 className="mb-3 text-[var(--midnight-navy)]" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {category.title}
              </h3>
              <p className="text-[var(--midnight-navy)]/60 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
