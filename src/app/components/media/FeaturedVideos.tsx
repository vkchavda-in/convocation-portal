import { Play } from 'lucide-react';

export default function FeaturedVideos() {
  const videos = [
    {
      title: 'Keynote: Future of Higher Education in India',
      event: 'FICCI National Education Summit 2026',
      duration: '45 min',
      views: '12K views'
    },
    {
      title: 'Panel Discussion: Industry-Academia Integration',
      event: 'NASSCOM EdTech Forum',
      duration: '1hr 10min',
      views: '8K views'
    },
    {
      title: 'Convocation Address: Embracing Change & Innovation',
      event: 'Annual Convocation 2026',
      duration: '30 min',
      views: '25K views'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <h2 className="mb-12 text-center" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--midnight-navy)'
        }}>
          Featured Videos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={index}
              className="bg-[var(--warm-white)] rounded-xl overflow-hidden border border-[var(--midnight-navy)]/10 hover:border-[#f9c53c] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-white ml-2" fill="white" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-[var(--midnight-navy)]/60 mb-3">{video.event}</p>
                <div className="flex items-center justify-between text-[var(--midnight-navy)]/50">
                  <span>{video.duration}</span>
                  <span>{video.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
