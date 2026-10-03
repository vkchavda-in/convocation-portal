'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Icon from '@/components/shared/Icon';
import FadeIn from '@/components/shared/FadeIn';
import { ResearchTabsBlockData } from '@/types/cms';

interface ResearchTabsModuleProps {
  id?: string;
  data: ResearchTabsBlockData;
  settings?: {
    theme?: 'light' | 'dark';
  };
}

export default function ResearchTabsModule({ id, data, settings }: ResearchTabsModuleProps) {
  const { title, subtitle, domains = [] } = data;
  const isDark = settings?.theme === 'dark';

  const [activeTabId, setActiveTabId] = useState<string>(domains[0]?.id || '');
  const activeDomain = domains.find((d) => d.id === activeTabId) || domains[0];

  if (domains.length === 0) return null;

  return (
    <section
      id={id}
      className={`py-24 relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[var(--dark-surface)] to-[var(--midnight-navy)] text-white'
          : 'bg-white text-[var(--midnight-navy)]'
      }`}
    >
      {/* Self-contained fade-in style for tab content changes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tab-fade-in {
          animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className="section-container relative z-10">
        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <FadeIn
            variant="up"
            delay={0}
            className="text-center flex flex-col items-center justify-center mb-16 max-w-3xl mx-auto"
          >
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${
              isDark ? 'bg-white/20' : 'bg-[var(--royal-blue)]/10'
            }`}>
              <Icon name="FlaskConical" className={isDark ? 'text-white' : 'text-[var(--royal-blue)]'} size={18} />
              <span className={isDark ? 'text-white/90' : 'text-[var(--royal-blue)] font-medium'}>Research Work</span>
            </div>
            {title && (
              <h2
                className="mb-3 font-semibold text-center"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: isDark ? '#ffffff' : 'var(--midnight-navy)',
                  lineHeight: '1.2'
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-center ${isDark ? 'text-white/80' : 'text-[var(--midnight-navy)]/70'}`} style={{ fontSize: '1.125rem' }}>
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}

        {/* Tab Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Tab Buttons Rail (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {domains.map((domain) => {
              const isActive = activeTabId === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setActiveTabId(domain.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all duration-300 relative group overflow-hidden border ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--royal-blue)] to-[var(--secondary)] text-white border-transparent shadow-sm'
                      : 'bg-[#F6F8FB] dark:bg-slate-900/40 text-[var(--midnight-navy)] dark:text-white border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      isActive ? 'bg-white/20' : 'bg-[var(--royal-blue)]/5'
                    }`}
                  >
                    <Icon
                      name={domain.icon || 'FlaskConical'}
                      className={isActive ? 'text-white' : 'text-[var(--royal-blue)]'}
                      size={18}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-[var(--midnight-navy)] dark:text-white'
                      }`}
                    >
                      {domain.title}
                    </div>
                    <div
                      className={`text-xs mt-0.5 transition-colors duration-300 ${
                        isActive ? 'text-white/85' : 'text-slate-550 dark:text-slate-400'
                      }`}
                    >
                      {domain.areas?.length || 0} Research Areas
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Active Tab Content (8 cols) */}
          <div className="lg:col-span-8">
            {activeDomain && (
              <div
                key={activeDomain.id}
                className="animate-tab-fade-in"
              >
                {/* Category Title */}
                <div className="text-xs font-semibold tracking-widest uppercase mb-3 text-[var(--secondary)]">
                  {activeDomain.title}
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: isDark ? '#fff' : 'var(--midnight-navy)' }}>
                  Research Areas
                </h3>
                {activeDomain.description && (
                  <p className={`mb-8 leading-relaxed text-sm ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
                    {activeDomain.description}
                  </p>
                )}

                {/* Areas Cards Stack */}
                <div className="space-y-5">
                  {(activeDomain.areas || []).map((area, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F6F8FB] dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white shadow-sm bg-gradient-to-r from-[var(--royal-blue)] to-[var(--secondary)]"
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-1.5 text-[var(--midnight-navy)] dark:text-white">
                            {area.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {area.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
