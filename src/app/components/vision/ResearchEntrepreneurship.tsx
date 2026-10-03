import { Microscope, Rocket } from 'lucide-react';

export default function ResearchEntrepreneurship() {
  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl p-12 text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Microscope className="text-[#f9c53c]" size={28} />
            </div>
            <h3 className="mb-4" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
              Research Excellence
            </h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Fostering a culture of inquiry where faculty and students pursue cutting-edge research with real-world impact.
            </p>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                Funded research grants and fellowships
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                Interdisciplinary research centers
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#f9c53c] rounded-full mt-2 mr-3 flex-shrink-0" />
                Publication incentives and support
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#e9a800] via-[#f9c53c] to-[#f59e0b] rounded-xl p-12 text-[#060f24] shadow-xl shadow-amber-500/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#060f24]/10 backdrop-blur-sm rounded-full mb-6">
              <Rocket className="text-[#060f24]" size={28} />
            </div>
            <h3 className="mb-4 text-[#060f24]" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
              Entrepreneurship
            </h3>
            <p className="text-[#060f24]/90 mb-6 leading-relaxed">
              Empowering students to transform ideas into ventures through structured incubation and mentorship.
            </p>
            <ul className="space-y-3 text-[#060f24]/90">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#060f24] rounded-full mt-2 mr-3 flex-shrink-0" />
                Seed funding and angel networks
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#060f24] rounded-full mt-2 mr-3 flex-shrink-0" />
                Startup bootcamps and pitch competitions
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#060f24] rounded-full mt-2 mr-3 flex-shrink-0" />
                Corporate mentorship programs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
