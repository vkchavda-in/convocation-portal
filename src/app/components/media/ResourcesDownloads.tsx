import { Download, FileText } from 'lucide-react';

export default function ResourcesDownloads() {
  const resources = [
    { title: 'Vision 2035 Strategic Plan', type: 'PDF', size: '2.4 MB' },
    { title: 'Annual Report 2025-26', type: 'PDF', size: '5.1 MB' },
    { title: 'Research & Innovation Policy Framework', type: 'PDF', size: '1.8 MB' },
    { title: 'Industry Partnership Guidelines', type: 'PDF', size: '1.2 MB' }
  ];

  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <h2 className="mb-12 text-center" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--midnight-navy)'
        }}>
          Resources & Downloads
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center">
                  <FileText className="text-[#f9c53c]" size={20} />
                </div>
                <div>
                  <h3 className="text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-[var(--midnight-navy)]/50">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <Download className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors" size={20} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
