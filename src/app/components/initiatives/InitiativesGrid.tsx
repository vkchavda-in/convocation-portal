import { Cpu, Users2, Globe2, Sprout, BookOpen, Lightbulb } from 'lucide-react';

export default function InitiativesGrid() {
  const initiatives = [
    {
      icon: Cpu,
      category: 'Technology & Innovation',
      title: 'Center for Industry 4.0 Excellence',
      description: 'State-of-the-art labs for AI, IoT, robotics, and advanced manufacturing with hands-on industry projects.',
      status: 'Active',
      impact: '500+ students trained annually'
    },
    {
      icon: Users2,
      category: 'Entrepreneurship',
      title: 'Student Startup Incubation Program',
      description: 'Seed funding, mentorship, workspace, and network support for student entrepreneurs.',
      status: 'Active',
      impact: '45 startups launched, ₹100+ Cr raised'
    },
    {
      icon: Globe2,
      category: 'Global Collaboration',
      title: 'International Research Partnerships',
      description: 'Joint research programs, faculty exchange, and student mobility with 12 partner universities.',
      status: 'Expanding',
      impact: '25+ active research projects'
    },
    {
      icon: Sprout,
      category: 'Sustainability',
      title: 'Green Campus & Sustainability Lab',
      description: 'Zero-waste initiatives, renewable energy adoption, and research on sustainable technologies.',
      status: 'Active',
      impact: '40% carbon footprint reduction'
    },
    {
      icon: BookOpen,
      category: 'Skill Development',
      title: 'Industry Certification Programs',
      description: 'Partnerships with tech giants for industry-recognized certifications and upskilling.',
      status: 'Active',
      impact: '2,000+ certifications awarded'
    },
    {
      icon: Lightbulb,
      category: 'Research',
      title: 'Innovation & Research Grant Program',
      description: 'Funding and mentorship for faculty and student research projects across disciplines.',
      status: 'Active',
      impact: '₹50 Cr allocated, 100+ projects funded'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="h-2 bg-gradient-to-r from-[var(--royal-blue)] to-[#f9c53c]" />
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <initiative.icon className="text-[#f9c53c]" size={24} />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#060f24] font-bold text-xs px-3 py-1 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-xl shadow-sm">
                    {initiative.category}
                  </span>
                  <span className="text-[var(--royal-blue)]">{initiative.status}</span>
                </div>

                <h3 className="mb-3 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors" style={{ fontSize: '1.25rem' }}>
                  {initiative.title}
                </h3>

                <p className="text-[var(--midnight-navy)]/60 mb-4 leading-relaxed">
                  {initiative.description}
                </p>

                <div className="pt-4 border-t border-[var(--midnight-navy)]/10">
                  <div className="text-[var(--royal-blue)]">{initiative.impact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
