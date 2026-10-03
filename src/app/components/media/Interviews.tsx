import { Mic } from 'lucide-react';

export default function Interviews() {
  const interviews = [
    {
      title: 'Reimagining the Future of Education',
      outlet: 'The Times of India',
      date: 'May 2026',
      type: 'Print Interview'
    },
    {
      title: 'Leadership in a Changing World',
      outlet: 'LinkedIn Live',
      date: 'April 2026',
      type: 'Video Interview'
    },
    {
      title: 'Building Innovation Ecosystems in Universities',
      outlet: 'Entrepreneur India',
      date: 'March 2026',
      type: 'Feature Article'
    },
    {
      title: 'The Role of AI in Higher Education',
      outlet: 'EdTech Review Podcast',
      date: 'February 2026',
      type: 'Podcast'
    }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <h2 className="mb-12 text-center" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--midnight-navy)'
        }}>
          Interviews & Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {interviews.map((interview, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="text-[#f9c53c]" size={24} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[#8C6514] font-bold mb-2">{interview.type}</div>
                  <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors">
                    {interview.title}
                  </h3>
                  <p className="text-[var(--midnight-navy)]/60 mb-1">{interview.outlet}</p>
                  <p className="text-[var(--midnight-navy)]/50">{interview.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
