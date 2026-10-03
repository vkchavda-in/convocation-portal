import { useState } from 'react';
import { ChevronRight, Building2, Users, Rocket, Award, TrendingUp, Globe } from 'lucide-react';

export default function InteractiveTimeline() {
  const [activeYear, setActiveYear] = useState(2018);

  const timelineData = [
    {
      year: 2018,
      icon: Building2,
      title: 'Vice Chancellor - Transformational Era Begins',
      institution: 'Leading University',
      highlights: [
        'Launched Vision 2025 strategic plan for institutional excellence',
        'Established 5 new research centers focused on emerging technologies',
        'Initiated comprehensive curriculum reform aligned with industry needs'
      ],
      impact: {
        students: '10,000+',
        partnerships: '50+',
        innovations: '15 Centers'
      }
    },
    {
      year: 2020,
      icon: TrendingUp,
      title: 'Digital Transformation & Pandemic Leadership',
      institution: 'Leading University',
      highlights: [
        'Led institution through COVID-19 with seamless transition to hybrid learning',
        'Launched AI-powered learning management system',
        'Established digital skills training programs for 5,000+ students'
      ],
      impact: {
        students: '25,000+',
        partnerships: '100+',
        innovations: 'Hybrid Learning Model'
      }
    },
    {
      year: 2022,
      icon: Rocket,
      title: 'Innovation Ecosystems & Entrepreneurship',
      institution: 'Leading University',
      highlights: [
        'Launched Student Startup Incubation Program with ₹50 Cr funding',
        'Established Industry 4.0 Center in partnership with leading corporates',
        'Created 30+ live industry projects for experiential learning'
      ],
      impact: {
        students: '35,000+',
        partnerships: '180+',
        innovations: '45 Startups Launched'
      }
    },
    {
      year: 2024,
      icon: Globe,
      title: 'Global Collaboration & Research Excellence',
      institution: 'Leading University',
      highlights: [
        'Signed MoUs with 12 international universities for research collaboration',
        'Launched interdisciplinary research programs in AI, sustainability, and healthcare',
        'Achieved top-tier ranking in national institutional quality frameworks'
      ],
      impact: {
        students: '50,000+',
        partnerships: '220+',
        innovations: '100+ Patents Filed'
      }
    },
    {
      year: 2026,
      icon: Award,
      title: 'Vision 2035 & Legacy Building',
      institution: 'Leading University',
      highlights: [
        'Unveiled Vision 2035 roadmap for next-generation higher education',
        'Established Center for Future of Work and Learning',
        'Recognized as National Leader in Industry-Academia Integration'
      ],
      impact: {
        students: '60,000+',
        partnerships: '250+',
        innovations: 'Future-Ready Curriculum'
      }
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: 'white'
          }}>
            Interactive Career Timeline
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Navigate through key milestones that define transformative leadership
          </p>
        </div>

        {/* Year selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {timelineData.map((item) => (
            <button
              key={item.year}
              onClick={() => setActiveYear(item.year)}
              className={`px-6 py-3 rounded-xl transition-all font-bold ${
                activeYear === item.year
                  ? 'bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] scale-110 shadow-lg shadow-amber-500/25'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {item.year}
            </button>
          ))}
        </div>

        {/* Timeline content */}
        {timelineData.map((item) => (
          activeYear === item.year && (
            <div key={item.year} className="max-w-6xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 lg:p-12 border border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Left: Icon and Title */}
                  <div className="lg:col-span-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#f9c53c] to-white rounded-2xl mb-6 shadow-md">
                      <item.icon className="text-[var(--midnight-navy)]" size={36} />
                    </div>

                    <h3 className="mb-2 text-white" style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                      lineHeight: '1.2'
                    }}>
                      {item.title}
                    </h3>

                    <p className="text-[#f9c53c] font-semibold mb-8">
                      {item.institution}
                    </p>

                    <div className="space-y-4">
                      {item.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <ChevronRight className="text-[#f9c53c] flex-shrink-0 mt-1" size={20} />
                          <p className="text-white/80 leading-relaxed">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Impact Stats */}
                  <div className="space-y-6">
                    <h4 className="text-white mb-4">Impact Metrics</h4>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-[#f9c53c] mb-2 font-bold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                        {item.impact.students}
                      </div>
                      <div className="text-white/70">Students Impacted</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-[#f9c53c] mb-2 font-bold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                        {item.impact.partnerships}
                      </div>
                      <div className="text-white/70">Industry Partnerships</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <div className="text-[#f9c53c] mb-2 font-bold" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                        {item.impact.innovations}
                      </div>
                      <div className="text-white/70">Key Innovation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </section>
  );
}
