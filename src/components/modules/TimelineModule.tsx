'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Icon from '@/components/shared/Icon';
import { TimelineBlockData } from '@/types/cms';
import FadeIn from '@/components/shared/FadeIn';

interface TimelineModuleProps {
  id?: string;
  data: TimelineBlockData;
}

export default function TimelineModule({ id, data }: TimelineModuleProps) {
  const { title, subtitle, category, categoryIcon, style = 'vertical', items } = data;
  const visibleItems = (items || []).filter(item => !item.hidden);

  // State for the interactive style timeline
  const defaultYear = visibleItems.length > 0 ? visibleItems[0].year : '';
  const [activeYear, setActiveYear] = useState<string | number>(defaultYear);

  if (style === 'interactive') {
    // Render the light-themed interactive timeline with year tabs and side impact statistics
    const activeItem = visibleItems.find((item) => item.year === activeYear) || visibleItems[0];

    return (
      <section
        id={id}
        className="cv-auto py-16 bg-[var(--parchment,#FEFCF8)] text-[var(--ink,#0D1B2E)] relative overflow-hidden border-t border-[var(--fog)]"
      >
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, var(--gold) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="section-container relative z-10">
          <FadeIn className="text-center mb-12">
            {category && (
              <div className="inline-flex items-center space-x-2 bg-[#f9c53c]/15 px-4 py-2 rounded-full mb-6 border border-[#f9c53c]/30">
                {categoryIcon && <Icon name={categoryIcon} className="text-[#8C6514]" size={18} />}
                <span className="text-[#8C6514] font-bold text-xs tracking-wider uppercase">{category}</span>
              </div>
            )}

            <h2
              className="mb-4 font-serif font-bold text-[var(--ink)]"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--slate-text)] max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
                {subtitle}
              </p>
            )}
          </FadeIn>

          {/* Year Tabs Selector */}
          <FadeIn delay={100} className="flex flex-wrap justify-center gap-4 mb-12">
            {visibleItems.map((item) => (
              <button
                key={item.year}
                onClick={() => setActiveYear(item.year)}
                className={`px-6 py-3 rounded-xl transition-all font-sans font-bold text-xs uppercase tracking-widest ${
                  activeYear === item.year
                    ? 'bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] scale-105 shadow-md shadow-amber-500/20'
                    : 'bg-white border border-[var(--fog)] text-[var(--slate-text)] hover:bg-[var(--mist)] hover:text-[var(--navy)]'
                }`}
              >
                {item.year}
              </button>
            ))}
          </FadeIn>

          {/* Timeline Details Display */}
          {activeItem && (
            <div key={String(activeYear)} className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-8 lg:p-12 border border-[var(--fog)] hover:border-[#f9c53c]/40 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Left content: Highlights list */}
                  <div className="lg:col-span-2">
                    {activeItem.icon && (
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f9c53c]/15 border border-[#f9c53c]/30 rounded-2xl mb-6">
                        <Icon name={activeItem.icon} className="text-[var(--navy)]" size={36} />
                      </div>
                    )}

                    <h3
                      className="mb-2 text-[var(--ink)] font-serif font-bold"
                      style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        lineHeight: '1.2',
                      }}
                    >
                      {activeItem.title}
                    </h3>

                    {activeItem.institution && (
                      <p className="text-[#8C6514] mb-8 font-semibold">
                        {activeItem.institution}
                      </p>
                    )}

                    {activeItem.highlights && activeItem.highlights.length > 0 && (
                      <div className="space-y-4">
                        {activeItem.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <ChevronRight className="text-[#f9c53c] flex-shrink-0 mt-1" size={20} />
                            <p className="text-[var(--slate-text)] leading-relaxed">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right content: Side statistics box */}
                  {activeItem.impact && activeItem.impact.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="text-[var(--ink)] mb-4 font-bold text-lg">Impact Metrics</h4>
                      {activeItem.impact.map((metric, idx) => (
                        <div key={idx} className="bg-[var(--cream)]/40 rounded-lg p-6 border border-[var(--fog)]/50 hover:border-[var(--gold)] transition-all">
                          <div
                            className="text-[var(--navy)] mb-2 font-bold"
                            style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}
                          >
                            {metric.value}
                          </div>
                          <div className="text-[var(--slate-text)] text-sm">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Render vertical timeline style (used in Career Milestones)
  return (
    <section id={id} className="cv-auto py-12 bg-[var(--parchment)] text-[var(--ink)]">
      <div className="section-container">
        <FadeIn className="text-center mb-16">
          {category && (
            <div className="inline-flex items-center space-x-2 bg-[#f9c53c]/15 px-4 py-2 rounded-full mb-6 border border-[#f9c53c]/30">
              {categoryIcon && <Icon name={categoryIcon} className="text-[#8C6514]" size={18} />}
              <span className="text-[#8C6514] font-bold text-sm tracking-wide">{category}</span>
            </div>
          )}

          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--ink)',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[var(--slate-text)] max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
              {subtitle}
            </p>
          )}
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline left-edge line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f9c53c] to-[var(--slate-blue)] hidden md:block" />

            <div className="space-y-8">
              {visibleItems.map((item, index) => (
                <FadeIn
                  key={index}
                  delay={Math.min(index * 60, 300)}
                  className="relative flex gap-8 group"
                >
                  {/* Year marker — compact circle */}
                  <div className="flex-shrink-0 flex flex-col items-center" style={{ width: '3rem' }}>
                    <div className="w-12 h-12 rounded-full bg-[var(--navy)] text-white font-bold text-xs flex items-center justify-center ring-4 ring-[var(--parchment)] shadow-sm z-10 relative group-hover:ring-[#f9c53c]/40 transition-all duration-300">
                      {item.year}
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white border border-[var(--fog)] rounded-xl p-5 hover:border-[#f9c53c]/40 hover:shadow-[0_4px_20px_rgba(11,37,69,0.07)] transition-all duration-300">
                      <h3 className="text-[var(--ink)] font-semibold mb-1" style={{ fontSize: '1.125rem' }}>
                        {item.title}
                      </h3>
                      {item.institution && (
                        <p className="text-[#8C6514] text-sm mb-2 font-semibold">
                          {item.institution}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[var(--slate-text)] text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
