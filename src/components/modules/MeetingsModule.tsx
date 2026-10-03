'use client';

import { useState, useEffect } from 'react';
import FadeIn from '@/components/shared/FadeIn';
import { X, ZoomIn, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import type { MeetingsBlockData, MeetingItem } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';

// ─── CSS-native animations (no motion/react overhead) ──────────────────────
const meetingsKeyframes = `
  @keyframes meetings-grid-float {
    0%, 100% { opacity: 0.02; transform: translateY(0); }
    50%       { opacity: 0.05; transform: translateY(4px); }
  }
  .meetings-grid-float {
    animation: meetings-grid-float 15s ease-in-out infinite;
  }
  
  @keyframes meetings-fade-in {
    from { opacity: 0; filter: blur(3px); }
    to   { opacity: 1; filter: blur(0px); }
  }
  .meetings-fade-in {
    animation: meetings-fade-in 0.4s ease-out forwards;
  }

  @keyframes meetings-slide-left {
    from { opacity: 0; filter: blur(3px); transform: translateX(10px); }
    to   { opacity: 1; filter: blur(0px); transform: translateX(0); }
  }
  .meetings-slide-left {
    animation: meetings-slide-left 0.3s ease-out forwards;
  }

  @keyframes meetings-slide-right {
    from { opacity: 0; filter: blur(3px); transform: translateX(-10px); }
    to   { opacity: 1; filter: blur(0px); transform: translateX(0); }
  }
  .meetings-slide-right {
    animation: meetings-slide-right 0.3s ease-out forwards;
  }

  @keyframes lightbox-backdrop-fade {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(12px); }
  }
  .lightbox-backdrop-fade {
    animation: lightbox-backdrop-fade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes lightbox-content-scale {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .lightbox-content-scale {
    animation: lightbox-content-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

// Utility to shorten long dignitary roles dynamically
export function shortenRole(role: string | undefined): string {
  if (!role) return '';
  
  // 1. Remove honorifics
  let s = role.replace(/Hon('|’)ble\s+/gi, '');
  
  // 2. Map exact known extremely long roles to short & complete versions
  const exactMaps: Record<string, string> = {
    "union minister of health and family welfare (former), government of india": "Former Union Health Minister",
    "union minister of railways, information & broadcasting, and electronics & information technology, government of india": "Union Minister of Railways, I&B, & IT",
    "union minister of railways, information & broadcasting, and electronics & information technology, govt. of india": "Union Minister of Railways, I&B, & IT",
    "minister of road transport and highways, government of india": "Union Minister of Road Transport & Highways",
    "minister of state for skill development and entrepreneurship, government of india": "Union MoS for Skill Development & Entrepreneurship",
    "minister of state, ministry of consumer affairs, food and public distribution, government of india": "Union MoS, Consumer Affairs & Food",
    "cabinet minister of health, higher & technical education, govt. of gujarat": "Health & Education Minister, Gujarat",
    "cabinet minister of industries, civil aviation, and rural development, govt. of gujarat": "Industries & Aviation Minister, Gujarat",
    "minister of state for tribal development, primary, secondary and old-age education, govt. of gujarat": "MoS for Education & Tribal Dev, Gujarat",
    "minister of social justice and empowerment, primary, secondary and adult education, govt. of gujarat": "Social Justice & Education Minister, Gujarat",
    "member of the lok sabha (mp), india": "MP, Lok Sabha",
    "member of rajya sabha (mp), india": "MP, Rajya Sabha",
    "president, rashtriya swayamsevak sangh (rss)": "President, RSS",
    "chief minister, government of maharashtra": "Chief Minister, Maharashtra",
    "chief minister, government of madhya pradesh": "Chief Minister, Madhya Pradesh",
    "former chief minister of gujarat state": "Former Chief Minister, Gujarat"
  };

  const lower = s.trim().toLowerCase();
  for (const [key, val] of Object.entries(exactMaps)) {
    if (lower === key || lower.includes(key)) {
      return val;
    }
  }

  // 3. Fallback generic shortening rules if not in map
  s = s.replace(/Government of India/gi, 'Govt. of India');
  s = s.replace(/Government of Gujarat/gi, 'Govt. of Gujarat');
  s = s.replace(/and/gi, '&');
  s = s.replace(/,\s*India/gi, '');
  
  return s.trim();
}

interface MeetingsModuleProps {
  id?: string;
  data: MeetingsBlockData;
}

export default function MeetingsModule({ id, data }: MeetingsModuleProps) {
  const sectionLabel = data.sectionLabel || 'VIP ENGAGEMENTS';
  const headline = data.headline || 'Articulating Thought Leadership Vision';
  const subheadline = data.subheadline || '';
  const items = data.items || [];
  const variant = data.variant || 'columns-accordion';

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Filter items by category (always show all items, categories disabled)
  const filteredItems = items.filter(item => !item.hidden);

  // Centralized Autoplay Timer (Pauses on mouse hover, resumes on mouse leave, 3.5s interval)
  useEffect(() => {
    if (isAutoplayPaused || filteredItems.length <= 1) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % filteredItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoplayPaused, filteredItems.length]);

  // Keyboard Navigation Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Lightbox navigation
      if (lightboxIdx !== null) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setLightboxIdx((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setLightboxIdx((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setLightboxIdx(null);
        }
        return;
      }

      // Main slider/accordion navigation (only when component is hovered or focused)
      if (!isHovered && !isFocused) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (
          variant === 'interactive-deck' ||
          variant === 'glass-tabs' ||
          variant === 'panoramic-slider' ||
          variant === 'split-slider' ||
          variant === 'split-slider-reverse' ||
          variant === 'fading-cards' ||
          variant === 'deck-3d'
        ) {
          setSliderIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (variant === 'columns-accordion') {
          setHoveredIdx((prev) => {
            const nextIdx = prev !== null ? prev - 1 : filteredItems.length - 1;
            return (nextIdx + filteredItems.length) % filteredItems.length;
          });
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (
          variant === 'interactive-deck' ||
          variant === 'glass-tabs' ||
          variant === 'panoramic-slider' ||
          variant === 'split-slider' ||
          variant === 'split-slider-reverse' ||
          variant === 'fading-cards' ||
          variant === 'deck-3d'
        ) {
          setSliderIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (variant === 'columns-accordion') {
          setHoveredIdx((prev) => {
            const nextIdx = prev !== null ? prev + 1 : 0;
            return nextIdx % filteredItems.length;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIdx, isHovered, isFocused, filteredItems.length, variant]);


  if (items.length === 0) return null;

  // Colors for background glows depending on layout/interactions
  const ambientGlows = [
    'rgba(14,165,233,0.05)',  // PM Modi 2018 (cyan)
    'rgba(212,163,89,0.05)',   // Amit Shah 2025 (gold)
    'rgba(79,70,229,0.05)',    // PM Modi 2022 (royal blue)
    'rgba(139,92,246,0.05)',   // Global Dialogues (purple)
  ];
  const activeGlowColor =
    variant === 'columns-accordion' && hoveredIdx !== null
      ? ambientGlows[hoveredIdx % ambientGlows.length]
      : ambientGlows[sliderIndex % ambientGlows.length];

  return (
    <section
      id={id}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsAutoplayPaused(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsAutoplayPaused(false);
      }}
      className="relative overflow-hidden w-full pt-10 pb-16 lg:pt-12 lg:pb-24 text-[var(--foreground)] bg-gradient-to-b from-[var(--background)] via-white to-[var(--background)]/95 font-sans focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--royal-blue)]/20"
    >
      <style dangerouslySetInnerHTML={{ __html: meetingsKeyframes }} />
      {/* Innovative Background Design Elements (Extremely subtle and animated with seamless edge fading) */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 120px, black calc(100% - 120px), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 120px, black calc(100% - 120px), transparent)'
        }}
      >
        {/* Subtle, slowly animated dotted print grid overlay */}
        <div
          className="absolute inset-0 meetings-grid-float"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--royal-blue) 0.8px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Tiny, soft ambient watercolor lights */}
        <div className="absolute -top-[10%] -left-[10%] w-[35%] h-[35%] rounded-full bg-[var(--royal-blue)]/2.5 blur-[100px] dark:bg-[var(--royal-blue)]/6" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-[var(--champagne-gold)]/2.5 blur-[100px] dark:bg-[var(--champagne-gold)]/6" />
        
        {/* Faint side vertical guidelines framing the content columns */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--royal-blue)]/2 to-transparent hidden lg:block" />
        <div className="absolute right-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--royal-blue)]/2 to-transparent hidden lg:block" />
      </div>

      {/* Background Soft Spotlight Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(14,165,233,0.03),transparent_60%)] pointer-events-none select-none" />
      <div
        className="absolute inset-0 pointer-events-none select-none transition-all duration-[600ms]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeGlowColor}, transparent 65%)`,
        }}
      />

      <div className="relative z-10 section-container">
        <div className="w-full flex flex-col">
          {/* Section Header - Styled to exactly match CardGridModule */}
          <div className="text-center flex flex-col items-center justify-center mb-10 max-w-3xl mx-auto">
            {sectionLabel && (
              <FadeIn
                variant="up"
                delay={0}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 bg-[var(--royal-blue)]/10"
              >
                <Users className="text-[var(--royal-blue)]" size={18} />
                <span className="text-[var(--royal-blue)] font-medium text-sm">{sectionLabel}</span>
              </FadeIn>
            )}

            <FadeIn
              variant="up"
              delay={60}
              as="h2"
              className="mb-3 font-semibold text-center"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--midnight-navy)',
                lineHeight: '1.2'
              }}
            >
              {headline}
            </FadeIn>

            {subheadline && (
              <FadeIn
                variant="up"
                delay={120}
                as="p"
                className="text-center text-[var(--midnight-navy)]/70 max-w-2xl mx-auto leading-relaxed"
                style={{ fontSize: '1.125rem' }}
              >
                {subheadline}
              </FadeIn>
            )}
          </div>


          {/* Render layout variant */}
          <FadeIn 
            variant="up" 
            delay={180}
            className="w-full"
          >
            {variant === 'columns-accordion' && (
              <ColumnsAccordionLayout
                items={filteredItems}
                hoveredIdx={hoveredIdx}
                setHoveredIdx={setHoveredIdx}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'interactive-deck' && (
              <InteractiveDeckLayout
                items={filteredItems}
                activeIndex={sliderIndex}
                setActiveIndex={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'editorial-mosaic' && (
              <EditorialMosaicLayout
                items={filteredItems}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'glass-tabs' && (
              <GlassTabsLayout
                items={filteredItems}
                activeTab={sliderIndex}
                setActiveTab={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'panoramic-slider' && (
              <PanoramicSliderLayout
                items={filteredItems}
                slideIndex={sliderIndex}
                setSlideIndex={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'split-slider' && (
              <SplitSliderLayout
                items={filteredItems}
                slideIndex={sliderIndex}
                setSlideIndex={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'split-slider-reverse' && (
              <SplitSliderReverseLayout
                items={filteredItems}
                slideIndex={sliderIndex}
                setSlideIndex={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'masonry-log' && (
              <MasonryLogLayout
                items={filteredItems}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'fading-cards' && (
              <FadingCardsLayout
                items={filteredItems}
                activeIndex={sliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'deck-3d' && (
              <Deck3DLayout
                items={filteredItems}
                activeIndex={sliderIndex}
                setActiveIndex={setSliderIndex}
                setLightboxIdx={setLightboxIdx}
              />
            )}

            {variant === 'masonry-overlay' && (
              <MasonryOverlayLayout
                items={filteredItems}
                setLightboxIdx={setLightboxIdx}
              />
            )}
          </FadeIn>
        </div>
      </div>

      {/* Lightbox details modal */}
      {lightboxIdx !== null && filteredItems[lightboxIdx] && (
        <LightboxModal
          item={filteredItems[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents for the Premium Layouts (No Hover Scale + Autoplay Timer Driven)
// ─────────────────────────────────────────────────────────────────────────────

interface LayoutProps {
  items: MeetingItem[];
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
  setLightboxIdx: (idx: number | null) => void;
}

interface EditorialProps {
  items: MeetingItem[];
  setLightboxIdx: (idx: number | null) => void;
}

// 1. Columns Accordion Layout (No Hover Scale, Snappy GPU Transitions)
function ColumnsAccordionLayout({ items, hoveredIdx, setHoveredIdx, setLightboxIdx }: LayoutProps) {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden lg:flex flex-row gap-4 h-[580px] w-full mt-2 select-none">
        {items.map((item, idx) => {
          const isExpanded = hoveredIdx === idx;
          const flexVal = hoveredIdx === null ? 'flex-grow' : isExpanded ? 'flex-[3]' : 'flex-[0.5]';

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setLightboxIdx(idx)}
              style={{
                willChange: 'flex-grow',
                transition: 'flex-grow 500ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer bg-slate-900 border border-[var(--border)]/10 shadow-lg group ${flexVal}`}
            >
              {item.imageUrl && (
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.dignitary}
                  className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ease-out ${
                    isExpanded || hoveredIdx === null ? 'grayscale-0' : 'grayscale brightness-75'
                  }`}
                />
              )}
              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

              {/* Glassmorphic Panel content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--champagne-gold)] font-semibold uppercase tracking-wider mb-1">
                  <span>{item.date}</span>
                  {item.dignitaryRole && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="truncate max-w-[130px]">{shortenRole(item.dignitaryRole)}</span>
                    </>
                  )}
                </div>

                <h4 className="text-white font-serif font-bold text-lg md:text-xl leading-tight tracking-tight">
                  {item.dignitary}
                </h4>

                {/* Expandable Dialogue detail text */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)] ${
                    isExpanded ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-xs text-slate-300 font-light leading-relaxed font-sans line-clamp-3">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet Fallback grid */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setLightboxIdx(idx)}
            className="relative h-[280px] rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-[var(--border)]/10 shadow-md group"
          >
            {item.imageUrl && (
              <OptimizedImage
                src={item.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ease-out"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
              <span className="text-[9px] font-mono text-[var(--champagne-gold)] uppercase tracking-wider block mb-1">
                {item.date} {item.dignitaryRole ? `• ${shortenRole(item.dignitaryRole)}` : ''}
              </span>
              <h4 className="text-base font-serif font-semibold text-white">
                {item.dignitary}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Interactive Card Deck Layout (Synchronized with Autoplay Index)
interface InteractiveDeckProps {
  items: MeetingItem[];
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
  setLightboxIdx: (idx: number | null) => void;
}

function InteractiveDeckLayout({ items, activeIndex, setActiveIndex, setLightboxIdx }: InteractiveDeckProps) {
  const activeItem = items[activeIndex] || items[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-2 select-none">
      {/* Featured Left Panel (7/12) */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div
          onClick={() => setLightboxIdx(activeIndex)}
          className="relative h-[300px] sm:h-[380px] lg:h-[460px] w-full rounded-2xl overflow-hidden cursor-pointer border border-[var(--border)]/40 bg-slate-100 shadow-lg group"
        >
            <img
              key={activeIndex}
              src={activeItem.imageUrl}
              alt={activeItem.dignitary}
              className="absolute inset-0 w-full h-full object-cover object-top meetings-fade-in"
              style={{ willChange: 'filter, opacity' }}
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <div className="absolute top-4 left-4 bg-[var(--midnight-navy)]/80 text-white text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm z-20">
            {activeItem.date}
          </div>
        </div>

        {/* Info panel below image */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--gold-text)] uppercase tracking-wider">
            {shortenRole(activeItem.dignitaryRole) || 'VIP Dialogue'}
          </div>
          <h4 className="text-xl md:text-2xl font-serif font-bold text-[var(--midnight-navy)] tracking-tight">
            {activeItem.dignitary}
          </h4>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-sans font-light">
            {activeItem.title}
          </p>
        </div>
      </div>

      {/* Selector Right Panel (5/12) */}
      <div className="lg:col-span-5 flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-2">
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                isActive
                  ? 'bg-white shadow border-[var(--champagne-gold)]/40 bg-gradient-to-r from-white via-[var(--background)]/10 to-white'
                  : 'bg-white/50 border-[var(--border)]/40 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200/60 flex-shrink-0 bg-slate-100">
                <OptimizedImage
                  src={item.imageUrl}
                  alt=""
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isActive ? 'grayscale-0' : 'grayscale'
                  }`}
                />
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--gold-text)] font-bold tracking-wider">
                    {item.date}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 truncate max-w-[120px]">
                    {shortenRole(item.dignitaryRole)}
                  </span>
                </div>
                <h5 className={`text-sm font-serif font-bold leading-tight truncate mt-0.5 ${
                  isActive ? 'text-[var(--royal-blue)]' : 'text-[var(--midnight-navy)]'
                }`}>
                  {item.dignitary}
                </h5>
                <p className="text-[11px] text-slate-400 truncate leading-normal">
                  {item.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3. Asymmetric Editorial Mosaic Layout (Clean staggered grid, completely static)
function EditorialMosaicLayout({ items, setLightboxIdx }: EditorialProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mt-2 select-none">
      {items.map((item, idx) => {
        const isStaggered = idx % 2 === 1;
        return (
          <div
            key={idx}
            onClick={() => setLightboxIdx(idx)}
            className={`flex flex-col justify-between bg-white/70 backdrop-blur-sm border border-[var(--border)]/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-[var(--champagne-gold)]/30 h-full ${
              isStaggered ? 'md:translate-y-6' : ''
            }`}
          >
            <div>
              {/* Image box */}
              <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-200/50 bg-slate-50 relative">
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.dignitary}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                />
                <span className="absolute top-3 right-3 bg-white/95 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm text-[9px] font-mono text-[var(--midnight-navy)] font-bold">
                  {item.date}
                </span>
              </div>

              {/* Title & Tagline details */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-serif font-light text-[var(--gold-text)]/50 italic leading-none">
                    0{idx + 1}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-[var(--gold-text)] block min-h-[1.25rem] line-clamp-1">
                    {shortenRole(item.dignitaryRole) || 'Special Consult'}
                  </span>
                </div>

                <h4 className="text-lg font-serif font-bold text-[var(--midnight-navy)] leading-tight line-clamp-1 min-h-[1.75rem]">
                  {item.dignitary}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans font-light line-clamp-2 min-h-[2.5rem]">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. Glass Tabs Layout (Vertical Dignitary menu driven by Central Autoplay index)
interface GlassTabsProps {
  items: MeetingItem[];
  activeTab: number;
  setActiveTab: (idx: number) => void;
  setLightboxIdx: (idx: number | null) => void;
}

function GlassTabsLayout({ items, activeTab, setActiveTab, setLightboxIdx }: GlassTabsProps) {
  const activeItem = items[activeTab] || items[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 select-none items-stretch">
      {/* Tabs list on the left (4/12) */}
      <div className="lg:col-span-4 flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-2">
        {items.map((item, idx) => {
          const isActive = idx === activeTab;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 ${
                isActive
                  ? 'bg-white/80 border-[var(--champagne-gold)]/50 shadow-md backdrop-blur-md font-semibold text-[var(--royal-blue)]'
                  : 'bg-white/30 border-transparent hover:bg-white/50 text-[var(--midnight-navy)]/80 hover:text-[var(--midnight-navy)]'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-wider block">
                  {item.date}
                </span>
                <span className="font-serif text-sm block truncate mt-0.5">
                  {item.dignitary}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${
                  isActive ? 'text-[var(--royal-blue)] translate-x-1' : 'text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Screen panel on the right (8/12) */}
      <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm border border-[var(--border)]/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 shadow-sm items-center">
        {activeItem.imageUrl && (
          <div
            onClick={() => setLightboxIdx(activeTab)}
            className="w-full md:w-2/5 aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 cursor-pointer flex-shrink-0 relative group"
          >
            <img
              key={activeTab}
              src={activeItem.imageUrl}
              alt=""
              className="w-full h-full object-cover object-top meetings-fade-in"
              style={{ willChange: 'filter, opacity' }}
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="text-white w-5 h-5" />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between h-full py-1">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-wider bg-[#8C6514]/10 px-2 py-0.5 rounded-full">
                {activeItem.date}
              </span>
              {activeItem.dignitaryRole && (
                <span className="text-[9px] font-sans text-slate-400 uppercase tracking-widest font-semibold">
                  {shortenRole(activeItem.dignitaryRole)}
                </span>
              )}
            </div>

            <h4 className="text-xl md:text-2xl font-serif font-bold text-[var(--midnight-navy)] tracking-tight leading-tight">
              {activeItem.dignitary}
            </h4>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-sans font-light">
              {activeItem.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Panoramic Banner Slider Layout (Wide horizontal layout banner centered with thumbs)
interface PanoramicProps {
  items: MeetingItem[];
  slideIndex: number;
  setSlideIndex: (idx: number) => void;
  setLightboxIdx: (idx: number | null) => void;
}

function PanoramicSliderLayout({ items, slideIndex, setSlideIndex, setLightboxIdx }: PanoramicProps) {
  const activeItem = items[slideIndex] || items[0];
  const n = items.length;

  return (
    <div className="relative w-full flex flex-col items-center select-none mt-2">
      {/* Main landscape slide card - capped max-w for a premium, compact fit - increased height */}
      <div
        onClick={() => setLightboxIdx(slideIndex)}
        className="w-full max-w-[860px] mx-auto h-[230px] sm:h-[350px] lg:h-[460px] rounded-2xl overflow-hidden border border-[var(--border)]/40 bg-slate-900 shadow-xl cursor-pointer relative group"
      >
        {/* Seamless concurrent crossfade with GPU acceleration */}
        <img
          key={slideIndex}
          src={activeItem.imageUrl}
          alt={activeItem.dignitary}
          className="absolute inset-0 w-full h-full object-cover object-top meetings-fade-in"
          style={{ willChange: 'opacity' }}
        />
        {/* Slightly stronger gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

        {/* Content details overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-20 text-white flex flex-col justify-end">
          <span className="text-[9px] font-mono text-[var(--champagne-gold)] uppercase tracking-wider block mb-1">
            {activeItem.date} {activeItem.dignitaryRole ? `• ${shortenRole(activeItem.dignitaryRole)}` : ''}
          </span>
          <h4 className="text-lg md:text-xl font-serif font-bold text-white tracking-tight leading-tight">
            {activeItem.dignitary}
          </h4>
          <p className="text-[11px] md:text-xs text-slate-200 mt-1 max-w-xl leading-relaxed font-sans font-light line-clamp-2">
            {activeItem.title}
          </p>
        </div>

        {/* Side navigation arrows - glassmorphism design */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex - 1 + n) % n);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white shadow z-20 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/15 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex + 1) % n);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white shadow z-20 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/15 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Miniature slide indicators (thumbnails) - styled with scale/active/hover transitions - hidden on mobile/tablet */}
      <div className="hidden md:flex gap-2.5 justify-center items-center mt-4 z-20 flex-wrap max-w-full px-4">
        {items.map((item, idx) => {
          const isActive = idx === slideIndex;
          
          // Show only 5 thumbnails centered around the active slide
          let diff = idx - slideIndex;
          while (diff > n / 2) diff -= n;
          while (diff <= -n / 2) diff += n;
          if (Math.abs(diff) > 2) return null;

          return (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`w-14 h-10 rounded-lg overflow-hidden border transition-all duration-300 ease-out cursor-pointer ${
                isActive ? 'border-[var(--royal-blue)] ring-2 ring-[var(--royal-blue)]/25 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <OptimizedImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

      {/* Lightweight dot indicators for mobile - extremely performant, no images */}
      <div className="flex md:hidden gap-2 justify-center items-center mt-4 z-20">
        {items.map((_, idx) => {
          // Limit to 7 dots centered around active slide on mobile
          let diff = idx - slideIndex;
          while (diff > n / 2) diff -= n;
          while (diff <= -n / 2) diff += n;
          if (Math.abs(diff) > 3) return null;

          const isActive = idx === slideIndex;
          return (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? 'bg-[var(--royal-blue)] w-3' : 'bg-slate-300/80 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// 6. 60/40 Split Slider Layout (60% Left Slider with Golden Divider + 40% Right Details)
interface SplitSliderProps {
  items: MeetingItem[];
  slideIndex: number;
  setSlideIndex: (idx: number) => void;
  setLightboxIdx: (idx: number | null) => void;
}

function SplitSliderLayout({ items, slideIndex, setSlideIndex, setLightboxIdx }: SplitSliderProps) {
  const activeItem = items[slideIndex] || items[0];
  const n = items.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 items-stretch bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg mt-2 select-none min-h-[420px] lg:min-h-[500px]">
      {/* Left side (60% width - lg:col-span-6): Image Slider with golden right border */}
      <div className="lg:col-span-6 relative aspect-video lg:aspect-auto h-[320px] lg:h-full bg-slate-900 border-b lg:border-b-0 lg:border-r border-[var(--champagne-gold)]/30 group">
        <img
          key={slideIndex}
          src={activeItem.imageUrl}
          alt={activeItem.dignitary}
          className="absolute inset-0 w-full h-full object-cover object-top grayscale-0 cursor-pointer meetings-fade-in"
          style={{ willChange: 'filter, opacity' }}
          onClick={() => setLightboxIdx(slideIndex)}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Floating Zoom Hint overlay on hover */}
        <div 
          onClick={() => setLightboxIdx(slideIndex)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20 shadow-lg">
            <ZoomIn className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Overlay Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex - 1 + n) % n);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white shadow z-20 transition-all border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex + 1) % n);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white shadow z-20 transition-all border border-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Slider dots indicators in the corner */}
        <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSlideIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === slideIndex ? 'bg-[var(--champagne-gold)] scale-110 w-4' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right side (40% width - lg:col-span-4): Content details */}
      <div className="lg:col-span-4 flex flex-col justify-between p-8 lg:p-10 bg-white">
        <div
          key={slideIndex}
          className="flex-1 flex flex-col justify-between h-full meetings-slide-left"
          style={{ willChange: 'filter, opacity' }}
        >
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-[0.25em] block">
              {activeItem.date} • MEETINGS
            </span>
            
            <h3 className="text-xl lg:text-2xl font-serif font-bold text-[var(--midnight-navy)] leading-tight tracking-tight">
              {activeItem.dignitary}
            </h3>
            
            {activeItem.dignitaryRole && (
              <p className="text-xs lg:text-sm font-sans font-medium text-[var(--royal-blue)] uppercase tracking-wider mt-1">
                {shortenRole(activeItem.dignitaryRole)}
              </p>
            )}
            
            <p className="text-xs lg:text-sm text-[var(--muted-foreground)] leading-relaxed font-sans font-light pt-2">
              {activeItem.title}
            </p>
          </div>

          {/* Bottom Citation Line with Gold Divider matching mockup */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100">
            <div className="w-0.5 h-6 bg-[var(--champagne-gold)]" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold italic">
              A Legacy of Transformation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. 60/40 Split Slider Reverse Layout (40% Left Details + 60% Right Slider with Left Divider)
function SplitSliderReverseLayout({ items, slideIndex, setSlideIndex, setLightboxIdx }: SplitSliderProps) {
  const activeItem = items[slideIndex] || items[0];
  const n = items.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 items-stretch bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg mt-2 select-none min-h-[420px] lg:min-h-[500px]">
      {/* Left side (40% width - lg:col-span-4): Content details */}
      <div className="lg:col-span-4 flex flex-col justify-between p-8 lg:p-10 bg-white order-2 lg:order-1">
        <div
          key={slideIndex}
          className="flex-1 flex flex-col justify-between h-full meetings-slide-right"
          style={{ willChange: 'filter, opacity' }}
        >
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-[0.25em] block">
              {activeItem.date} • MEETINGS
            </span>
            
            <h3 className="text-xl lg:text-2xl font-serif font-bold text-[var(--midnight-navy)] leading-tight tracking-tight">
              {activeItem.dignitary}
            </h3>
            
            {activeItem.dignitaryRole && (
              <p className="text-xs lg:text-sm font-sans font-medium text-[var(--royal-blue)] uppercase tracking-wider mt-1">
                {shortenRole(activeItem.dignitaryRole)}
              </p>
            )}
            
            <p className="text-xs lg:text-sm text-[var(--muted-foreground)] leading-relaxed font-sans font-light pt-2">
              {activeItem.title}
            </p>
          </div>

          {/* Bottom Citation Line with Gold Divider */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100">
            <div className="w-0.5 h-6 bg-[var(--champagne-gold)]" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold italic">
              A Legacy of Transformation
            </span>
          </div>
        </div>
      </div>

      {/* Right side (60% width - lg:col-span-6): Image Slider with golden left border */}
      <div className="lg:col-span-6 relative aspect-video lg:aspect-auto h-[320px] lg:h-full bg-slate-900 border-b lg:border-b-0 lg:border-l border-[var(--champagne-gold)]/30 group order-1 lg:order-2">
        <img
          key={slideIndex}
          src={activeItem.imageUrl}
          alt={activeItem.dignitary}
          className="absolute inset-0 w-full h-full object-cover object-top grayscale-0 cursor-pointer meetings-fade-in"
          style={{ willChange: 'filter, opacity' }}
          onClick={() => setLightboxIdx(slideIndex)}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Floating Zoom Hint overlay on hover */}
        <div 
          onClick={() => setLightboxIdx(slideIndex)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20 shadow-lg">
            <ZoomIn className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Overlay Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex - 1 + n) % n);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white shadow z-20 transition-all border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSlideIndex((slideIndex + 1) % n);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 text-white shadow z-20 transition-all border border-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Slider dots indicators in the corner */}
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSlideIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === slideIndex ? 'bg-[var(--champagne-gold)] scale-110 w-4' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 8. Asymmetric Magazine Masonry Layout (Clean staggered card grid board)
function MasonryLogLayout({ items, setLightboxIdx }: EditorialProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2 select-none items-stretch">
      {items.map((item, idx) => {
        // Distribute widths: make the 3rd item span 2 columns on larger screens to give a masonry feel
        const isDoubleWidth = idx === 2;
        
        return (
          <div
            key={idx}
            onClick={() => setLightboxIdx(idx)}
            className={`flex flex-col justify-between bg-white border border-[var(--border)]/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-[var(--champagne-gold)]/45 h-full ${
              isDoubleWidth ? 'md:col-span-2' : 'col-span-1'
            }`}
          >
            <div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200/50">
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.dignitary}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-white/10">
                  {item.date}
                </span>
              </div>

              <div className="mt-4 space-y-1.5">
                <span className="text-[9px] font-mono text-[var(--gold-text)] uppercase tracking-wider font-bold block min-h-[1.25rem] line-clamp-1">
                  {shortenRole(item.dignitaryRole) || 'VIP Dialogue'}
                </span>
                <h4 className="text-base font-serif font-bold text-[var(--midnight-navy)] leading-tight group-hover:text-[var(--royal-blue)] transition-colors line-clamp-1 min-h-[1.5rem]">
                  {item.dignitary}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans font-light line-clamp-2 min-h-[2.5rem]">
                  {item.title}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--gold-text)]/60 italic font-serif">
                0{idx + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 9. Fading Stacked Cards Layout (Overlapping card deck cycling automatically)
interface FadingCardsProps {
  items: MeetingItem[];
  activeIndex: number;
  setLightboxIdx: (idx: number | null) => void;
}

function FadingCardsLayout({ items, activeIndex, setLightboxIdx }: FadingCardsProps) {
  const n = items.length;

  return (
    <div className="relative w-full max-w-[640px] mx-auto h-[440px] flex items-center justify-center select-none mt-2">
      {items.map((item, idx) => {
        // Calculate offset in stack
        let offset = idx - activeIndex;
        while (offset < 0) offset += n;

        // Performance Optimization: Only mount visible cards in DOM (active + next 2 stacked behind it)
        const isVisible = offset < 3;
        if (!isVisible) return null;

        const isActive = offset === 0;

        return (
          <div
            key={idx}
            style={{
              transformOrigin: 'top center',
              willChange: 'transform, opacity',
              pointerEvents: isActive ? 'auto' : 'none',
              transform: `translateY(${isVisible ? offset * 18 : 36}px) scale(${1 - (isVisible ? offset * 0.05 : 0.15)})`,
              zIndex: isVisible ? 30 - offset : 10,
              opacity: isActive ? 1 : isVisible ? 0.6 - offset * 0.2 : 0,
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onClick={() => {
              if (isActive) setLightboxIdx(idx);
            }}
            className={`absolute w-full h-[380px] rounded-2xl overflow-hidden border bg-white shadow-xl cursor-pointer p-5 flex flex-col justify-between transition-colors duration-300 ${
              isActive ? 'border-[var(--champagne-gold)]/40 shadow-[0_15px_35px_rgba(0,0,0,0.06)]' : 'border-slate-200'
            }`}
          >
            {/* Card Content split */}
            <div className="flex gap-4 items-stretch h-[220px]">
              <div className="w-1/2 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/50 flex-shrink-0 relative">
                <OptimizedImage
                  src={item.imageUrl}
                  alt=""
                  className="w-full h-full object-cover object-top grayscale-0"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-white/10">
                  {item.date}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-wider block min-h-[1.1rem] line-clamp-2">
                    {shortenRole(item.dignitaryRole) || 'Special Dialogue'}
                  </span>
                  <h4 className="text-base font-serif font-bold text-[var(--midnight-navy)] leading-tight line-clamp-3 min-h-[3.25rem]">
                    {item.dignitary}
                  </h4>
                </div>
              </div>
            </div>

            {/* Bottom dialogue section */}
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-sans font-light line-clamp-2 min-h-[2.5rem]">
                "{item.title}"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox Dialog Box Component (Universal modal sync)
// ─────────────────────────────────────────────────────────────────────────────

interface LightboxProps {
  item: MeetingItem;
  onClose: () => void;
}

function LightboxModal({ item, onClose }: LightboxProps) {
  return (
    <div style={{ willChange: 'filter, opacity' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md lightbox-backdrop-fade"
      onClick={onClose}
    >
      <div style={{ willChange: 'filter, opacity' }}
        className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full border border-[var(--champagne-gold)]/20 shadow-2xl relative lightbox-content-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/45 text-white rounded-full hover:bg-black/65 transition-colors z-10 cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lightbox Image */}
        {item.imageUrl && (
          <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
            <OptimizedImage
              src={item.imageUrl}
              alt={item.dignitary}
              className="w-full h-full object-cover object-top"
            />
            {item.dignitaryRole && (
              <div className="absolute top-4 left-4 bg-[var(--midnight-navy)]/80 text-white text-[10px] font-mono font-bold tracking-wider uppercase px-3.5 py-2 rounded-full backdrop-blur-sm border border-white/10 shadow-md">
                {shortenRole(item.dignitaryRole)}
              </div>
            )}
          </div>
        )}

        {/* Text details */}
        <div className="p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--royal-blue)] tracking-wider uppercase font-mono">
            {item.date || 'Meeting Date'}
          </div>
          <h3 className="text-xl md:text-2xl font-serif font-medium text-[var(--midnight-navy)] tracking-tight leading-snug">
            {item.dignitary}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-sans font-light">
            {item.title}
          </p>
        </div>
      </div>
    </div>
  );
}

// 10. 3D Card Swap Stack Layout (Active center card, 2 cards behind left/right)
function Deck3DLayout({ items, activeIndex, setActiveIndex, setLightboxIdx }: InteractiveDeckProps) {
  const n = items.length;
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((activeIndex - 1 + n) % n);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((activeIndex + 1) % n);
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none mt-2">
      {/* 3D Container with perspective */}
      <div 
        className="relative w-full flex items-center justify-center h-[365px] sm:h-[410px] md:h-[450px]"
        style={{ perspective: 1200 }}
      >
        {items.map((item, idx) => {
          // Calculate shortest circular difference
          let diff = idx - activeIndex;
          while (diff > n / 2) diff -= n;
          while (diff <= -n / 2) diff += n;

          // Performance Optimization: Only mount visible cards in DOM (active card + left/right peeks)
          // Keep 2 peeks mounted on both mobile & desktop to prevent cards popping in/out of existence at the edges.
          const maxPeeks = 2;
          const isVisible = Math.abs(diff) <= maxPeeks;
          const isActive = diff === 0;

          if (!isVisible) return null;

          // Responsive dynamic translations to prevent squishing/excessive overlap on mobile
          const getTranslateX = () => {
            if (windowWidth < 480) return diff * 110;
            if (windowWidth < 640) return diff * 130;
            if (windowWidth < 768) return diff * 165;
            if (Math.abs(diff) === 1) return diff * 225; // First depth shift (225px)
            if (Math.abs(diff) === 2) return diff * 205; // Second depth shift (410px total)
            return diff * 260; // Off-screen buffer
          };

          const translateX = getTranslateX();
          const rotateY = diff * (isMobile ? -8 : -11); // Subtle 3D angular rotation
          const scale = isActive 
            ? 1 
            : Math.abs(diff) === 1 
              ? (isMobile ? 0.82 : 0.85) 
              : Math.abs(diff) === 2 
                ? (isMobile ? 0.68 : 0.72) 
                : 0.6;
          
          // Animate opacity: fully visible for active and immediate peeks. 
          // Off-screen card (diff === 2) is hidden on mobile (fade to 0) and translucent on desktop (0.4).
          const opacity = isActive || Math.abs(diff) === 1 
            ? 1 
            : isMobile 
              ? 0 
              : 0.4;

          const zIndex = 30 - Math.abs(diff) * 10;

          return (
            <div
              key={idx}
              style={{
                willChange: 'transform, opacity',
                pointerEvents: isActive || Math.abs(diff) === 1 ? 'auto' : 'none',
                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                zIndex: zIndex,
                opacity: opacity,
                transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              onClick={() => {
                if (isActive) {
                  setLightboxIdx(idx);
                } else if (isVisible) {
                  setActiveIndex(idx);
                }
              }}
              className={`absolute w-[230px] sm:w-[280px] md:w-[360px] h-[315px] sm:h-[350px] md:h-[390px] rounded-2xl overflow-hidden border bg-white shadow-xl cursor-pointer p-4 flex flex-col justify-between transition-colors duration-300 ${
                isActive 
                  ? 'border-[var(--champagne-gold)]/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-[var(--champagne-gold)]/80' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Image and Metadata */}
              <div className="flex flex-col gap-2.5">
                {item.imageUrl && (
                  <div className="w-full aspect-[16/11] rounded-xl overflow-hidden bg-slate-50 border border-slate-200/50 flex-shrink-0 relative">
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.dignitary}
                      className={`w-full h-full object-cover object-top transition-all duration-500 ${
                        isActive ? 'grayscale-0' : 'grayscale brightness-90'
                      }`}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[8px] sm:text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-white/10 shadow-sm">
                      {item.date}
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[var(--gold-text)] font-bold uppercase tracking-wider block min-h-[1.1rem] line-clamp-2">
                      {shortenRole(item.dignitaryRole) || 'Special Dialogue'}
                    </span>
                    <h4 className="text-sm sm:text-base font-serif font-bold text-[var(--midnight-navy)] leading-tight line-clamp-2 min-h-[1.75rem]">
                      {item.dignitary}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Bottom Tagline citation */}
              <div className="border-t border-slate-100 pt-2.5 mt-auto">
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] leading-relaxed font-sans font-light line-clamp-2 min-h-[2.5rem]">
                  "{item.title}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Slide Controls & Indicators */}
      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={handlePrev}
          className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[var(--midnight-navy)] shadow-sm transition-all hover:scale-105 active:scale-95"
          title="Previous Card"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Responsive dots: If total items > 8 and on mobile, render a premium fractional text counter e.g. "12 / 23" to prevent screen overflow and clutter */}
        {n > 8 && isMobile ? (
          <span className="text-xs font-mono text-slate-500 font-semibold tracking-widest uppercase">
            {activeIndex + 1} / {n}
          </span>
        ) : (
          <div className="flex gap-2">
            {items.map((_, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive ? 'bg-[var(--champagne-gold)] scale-110 w-4' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
        )}

        <button
          onClick={handleNext}
          className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[var(--midnight-navy)] shadow-sm transition-all hover:scale-105 active:scale-95"
          title="Next Card"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 11. Asymmetric Masonry Overlay Layout (Staggered columns with dark text overlays on bottom)
function MasonryOverlayLayout({ items, setLightboxIdx }: EditorialProps) {
  const [numCols, setNumCols] = useState(3);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setNumCols(1);
      } else if (window.innerWidth < 1024) {
        setNumCols(2);
      } else {
        setNumCols(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCard = (item: MeetingItem, originalIdx: number) => (
    <div
      key={originalIdx}
      onClick={() => setLightboxIdx(originalIdx)}
      className="relative rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-[var(--border)]/10 shadow-md group w-full"
    >
      {item.imageUrl && (
        <OptimizedImage
          src={item.imageUrl}
          alt={item.dignitary}
          className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-105 z-0"
        />
      )}
      
      {/* Gradient overlay from bottom dark to top transparent - visible all the time */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Content overlay on the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white flex flex-col justify-end">
        <span className="text-[9px] font-mono text-[var(--champagne-gold)] uppercase tracking-wider block mb-1">
          {item.date} {item.dignitaryRole ? `• ${shortenRole(item.dignitaryRole)}` : ''}
        </span>
        <h4 className="text-base font-serif font-bold text-white tracking-tight leading-tight group-hover:text-[var(--champagne-gold)] transition-colors">
          {item.dignitary}
        </h4>
        <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed font-sans font-light line-clamp-3">
          "{item.title}"
        </p>
      </div>
    </div>
  );

  // Fallback for SSR/non-mounted state using CSS Columns to prevent layout shift
  if (!isMounted) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 w-full select-none mt-2">
        {items.map((item, idx) => (
          <div key={idx} className="break-inside-avoid mb-6 w-full">
            {renderCard(item, idx)}
          </div>
        ))}
      </div>
    );
  }

  // Distribute items into columns round-robin to preserve correct reading order flow (Pinterest style)
  const cols: MeetingItem[][] = Array.from({ length: numCols }, () => []);
  const colOriginalIndices: number[][] = Array.from({ length: numCols }, () => []);

  items.forEach((item, idx) => {
    const colIdx = idx % numCols;
    cols[colIdx].push(item);
    colOriginalIndices[colIdx].push(idx);
  });

  return (
    <div className={`grid gap-6 w-full select-none mt-2 ${
      numCols === 1 ? 'grid-cols-1' : numCols === 2 ? 'grid-cols-2' : 'grid-cols-3'
    }`}>
      {cols.map((colItems, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-6 w-full">
          {colItems.map((item, idx) => {
            const originalIdx = colOriginalIndices[colIdx][idx];
            return renderCard(item, originalIdx);
          })}
        </div>
      ))}
    </div>
  );
}
