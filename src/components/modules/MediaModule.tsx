'use client';

import { useState, useEffect } from 'react';
import { Play, Mic, Newspaper, FileText, Download, Search } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import { MediaBlockData, VideoItem, InterviewItem, NewsItem, ResourceItem } from '@/types/cms';

interface MediaModuleProps {
  id?: string;
  data: MediaBlockData;
  settings?: {
    displayType?: 'videos' | 'interviews' | 'news' | 'resources';
  };
}

export default function MediaModule({ id, data, settings }: MediaModuleProps) {
  const { title, subtitle, videos, interviews, news, resources } = data;
  const displayType = settings?.displayType || 'videos';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setVisibleCount(4);
  }, [displayType]);

  const renderVideos = (items: VideoItem[]) => (
    <section className="cv-auto py-12 bg-[var(--warm-white)] text-[var(--midnight-navy)]">
      <div className="section-container">
        <FadeIn variant="up" delay={0} className="text-center">
          <h2 className="mb-12 text-center" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)'
          }}>
            {title || 'Featured Videos'}
          </h2>
          {subtitle && <p className="text-center text-[var(--midnight-navy)]/70 mb-8">{subtitle}</p>}
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((video, index) => (
            <FadeIn
              key={index}
              variant="up"
              delay={Math.min(index * 60, 300)}
              className="bg-white rounded-lg overflow-hidden border border-[var(--royal-blue)]/30 hover:border-[var(--champagne-gold)] hover:shadow-2xl hover:-translate-y-1.5 transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-white ml-2" fill="white" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 font-semibold text-lg text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                <p className="text-[var(--midnight-navy)]/60 mb-3 text-sm">{video.event}</p>
                <div className="flex items-center justify-between text-[var(--midnight-navy)]/50 text-sm">
                  <span>{video.duration}</span>
                  <span>{video.views}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );

  const renderInterviews = (items: InterviewItem[]) => {
    const categories = ['All', ...Array.from(new Set(items.map(item => item.type).filter(Boolean)))];

    const filteredItems = items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.outlet && item.outlet.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const paginatedItems = filteredItems.slice(0, visibleCount);

    return (
      <section className="cv-auto py-12 bg-[var(--warm-white)] text-[var(--midnight-navy)]">
        <div className="section-container">
          <FadeIn variant="up" delay={0} className="text-center">
            <h2 className="mb-4 text-center font-semibold" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)',
              lineHeight: '1.2'
            }}>
              {title || 'Interviews & Papers'}
            </h2>
            {subtitle && <p className="text-center text-[var(--midnight-navy)]/70 mb-8">{subtitle}</p>}
          </FadeIn>

          {/* Search and Category Filters */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search research registry..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(4);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--royal-blue)]/15 focus:border-[#f9c53c] focus:outline-none bg-white text-[var(--midnight-navy)] text-sm shadow-sm transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setVisibleCount(4);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#06152B] shadow-md shadow-amber-500/20'
                      : 'bg-white border border-slate-200 text-[var(--midnight-navy)]/80 hover:border-[#f9c53c] hover:bg-[#f9c53c]/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {paginatedItems.length === 0 ? (
            <div className="text-center text-[var(--midnight-navy)]/50 py-12 text-sm">
              No publications found matching search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {paginatedItems.map((interview, index) => (
                <FadeIn
                  key={index}
                  variant="up"
                  delay={Math.min(index * 60, 300)}
                  className="bg-white rounded-xl p-5 border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="text-[#f9c53c]" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#8C6514] font-bold mb-0.5 text-xs">{interview.type}</div>
                      <h3 className="mb-2 font-semibold text-base text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors leading-snug line-clamp-2">
                        {interview.title}
                      </h3>
                      <p className="text-[var(--midnight-navy)]/65 text-xs mb-0.5 line-clamp-1">{interview.outlet}</p>
                      <p className="text-[var(--midnight-navy)]/50 text-[10px]">{interview.date}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {filteredItems.length > visibleCount && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 4, filteredItems.length))}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] bg-white hover:bg-[#f9c53c]/10 font-bold text-sm transition-all hover:scale-105 active:scale-95 text-[var(--midnight-navy)] shadow-sm"
              >
                <span>Load More Papers ({filteredItems.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderNews = (items: NewsItem[]) => {
    const filteredItems = items.filter(item => {
      const matchesSearch = 
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    const paginatedItems = filteredItems.slice(0, visibleCount);

    return (
      <section className="cv-auto py-12 bg-[var(--warm-white)] text-[var(--midnight-navy)]">
        <div className="section-container">
          <FadeIn variant="up" delay={0} className="text-center">
            <h2 className="mb-4 text-center font-semibold" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)',
              lineHeight: '1.2'
            }}>
              {title || 'Events Coverage'}
            </h2>
            {subtitle && <p className="text-center text-[var(--midnight-navy)]/70 mb-8">{subtitle}</p>}
          </FadeIn>

          {/* Search Bar */}
          <div className="mb-10 relative max-w-4xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search events coverage..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(4);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--royal-blue)]/15 focus:border-[#f9c53c] focus:outline-none bg-white text-[var(--midnight-navy)] text-sm shadow-sm transition-all"
            />
          </div>

          {paginatedItems.length === 0 ? (
            <div className="text-center text-[var(--midnight-navy)]/50 py-12 text-sm">
              No events found matching search filters.
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {paginatedItems.map((item, index) => (
                <FadeIn
                  key={index}
                  variant="up"
                  delay={Math.min(index * 60, 300)}
                  className="bg-white rounded-xl p-5 border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center">
                        <Newspaper className="text-[#f9c53c]" size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-2 font-semibold text-base text-[var(--midnight-navy)] group-hover:text-[var(--royal-blue)] transition-colors leading-snug">
                        {item.headline}
                      </h3>
                      <div className="flex items-center gap-4 text-[var(--midnight-navy)]/60 text-xs">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {filteredItems.length > visibleCount && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 4, filteredItems.length))}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] bg-white hover:bg-[#f9c53c]/10 font-bold text-sm transition-all hover:scale-105 active:scale-95 text-[var(--midnight-navy)] shadow-sm"
              >
                <span>Load More Events ({filteredItems.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderResources = (items: ResourceItem[]) => {
    const categories = ['All', ...Array.from(new Set(items.map(item => item.type).filter(Boolean)))];

    const filteredItems = items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.size && item.size.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const paginatedItems = filteredItems.slice(0, visibleCount);

    return (
      <section className="cv-auto py-12 bg-[var(--warm-white)] text-[var(--midnight-navy)]">
        <div className="section-container">
          <FadeIn variant="up" delay={0} className="text-center">
            <h2 className="mb-4 text-center font-semibold" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)',
              lineHeight: '1.2'
            }}>
              {title || 'Resources & Downloads'}
            </h2>
            {subtitle && <p className="text-center text-[var(--midnight-navy)]/70 mb-8">{subtitle}</p>}
          </FadeIn>

          {/* Search and Category Filters */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(4);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--royal-blue)]/15 focus:border-[#f9c53c] focus:outline-none bg-white text-[var(--midnight-navy)] text-sm shadow-sm transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setVisibleCount(4);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#06152B] shadow-md shadow-amber-500/20'
                      : 'bg-white border border-slate-200 text-[var(--midnight-navy)]/80 hover:border-[#f9c53c] hover:bg-[#f9c53c]/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {paginatedItems.length === 0 ? (
            <div className="text-center text-[var(--midnight-navy)]/50 py-12 text-sm">
              No resources found matching search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {paginatedItems.map((resource, index) => (
                <FadeIn
                  key={index}
                  variant="up"
                  delay={Math.min(index * 60, 300)}
                  className="bg-white rounded-xl p-5 border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="text-[#f9c53c]" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[var(--midnight-navy)] font-semibold text-base group-hover:text-[var(--royal-blue)] transition-colors mb-1 leading-snug line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-[var(--midnight-navy)]/50 text-xs">{resource.type} • {resource.size}</p>
                    </div>
                  </div>
                  <Download className="text-[var(--royal-blue)] group-hover:text-[#f9c53c] transition-colors flex-shrink-0 ml-4" size={20} />
                </FadeIn>
              ))}
            </div>
          )}

          {filteredItems.length > visibleCount && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 4, filteredItems.length))}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border border-[var(--royal-blue)]/15 hover:border-[#f9c53c] bg-white hover:bg-[#f9c53c]/10 font-bold text-sm transition-all hover:scale-105 active:scale-95 text-[var(--midnight-navy)] shadow-sm"
              >
                <span>Load More Papers ({filteredItems.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  const singleMediaUrl = (data as any)?.mediaUrl || (data as any)?.imageUrl;
  if (singleMediaUrl) {
    return (
      <section id={id} className="py-16 md:py-24 bg-[var(--cream,#F7F9FC)] text-[var(--ink,#002147)]">
        <div className="section-container max-w-5xl mx-auto">
          {title && (
            <FadeIn variant="up" delay={0} className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-bold font-serif mb-4" style={{ color: 'var(--ink)' }}>
                {title}
              </h2>
              {subtitle && <p className="text-sm md:text-base text-[var(--slate-text)] max-w-2xl mx-auto">{subtitle}</p>}
            </FadeIn>
          )}
          <FadeIn variant="up" delay={100} className="bg-white rounded-2xl overflow-hidden border border-[var(--fog)] shadow-xl p-4 md:p-6">
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={singleMediaUrl}
                alt={title || 'Media Display'}
                className="w-full h-auto max-h-[700px] object-contain mx-auto"
              />
            </div>
            {(data as any).description && (
              <p className="mt-4 text-center text-xs md:text-sm text-[var(--slate-text)] leading-relaxed">
                {(data as any).description}
              </p>
            )}
          </FadeIn>
        </div>
      </section>
    );
  }

  return (
    <div id={id}>
      {displayType === 'videos' && videos && renderVideos(videos.filter(v => !v.hidden))}
      {displayType === 'interviews' && interviews && renderInterviews(interviews.filter(i => !i.hidden))}
      {displayType === 'news' && news && renderNews(news.filter(n => !n.hidden))}
      {displayType === 'resources' && resources && renderResources(resources.filter(r => !r.hidden))}
    </div>
  );
}
