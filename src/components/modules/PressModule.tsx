'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Newspaper } from 'lucide-react';
import type { PressBlockData, PressItem } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';
import FadeIn from '@/components/shared/FadeIn';

interface PressModuleProps {
  id?: string;
  data: PressBlockData;
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({
  items,
  startIdx,
  onClose,
}: {
  items: PressItem[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const item = items[idx];
  const N = items.length;

  const prev = useCallback(() => setIdx(i => (i - 1 + N) % N), [N]);
  const next = useCallback(() => setIdx(i => (i + 1) % N), [N]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if ((window as any).lenis) {
      (window as any).lenis.stop();
    }
    return () => { 
      document.body.style.overflow = ''; 
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-modal-fade"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicking content doesn't close */}
      <div
        key={idx}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0d0d0d] rounded-lg overflow-hidden shadow-2xl animate-modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {item.category && (
              <p className="font-sans text-[10px] italic text-white/50 mb-0.5">{item.category}</p>
            )}
            {item.headline && (
              <p className="font-serif font-bold text-white text-sm sm:text-base leading-snug truncate">
                {item.headline}
              </p>
            )}
            {item.subheadline && (
              <p className="font-sans text-[11px] text-white/50 truncate">{item.subheadline}</p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            {item.publication && (
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#f9c53c] hidden sm:block">
                {item.publication}{item.date ? ` · ${item.date}` : ''}
              </span>
            )}
            {/* Counter */}
            <span className="font-sans text-[10px] text-white/40">
              {String(idx + 1).padStart(2,'0')}/{String(N).padStart(2,'0')}
            </span>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
              aria-label="Close"
            >✕</button>
          </div>
        </div>

        {/* Image — fills remaining height, scrollable if very tall */}
        <div className="flex-1 overflow-auto flex items-start justify-center bg-black/40 min-h-0">
          <OptimizedImage
            src={item.imageUrl}
            alt={item.headline || item.publication || 'Press spread'}
            className="w-full h-auto object-contain"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={prev}
            className="flex items-center gap-1 font-sans text-[11px] text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {/* Dot strip */}
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${
                  i === idx
                    ? 'w-4 h-1.5 bg-[#f9c53c]'
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex items-center gap-1 font-sans text-[11px] text-white/60 hover:text-white transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ label, headline, sub }: { label?: string; headline?: string; sub?: string }) {
  if (!label && !headline && !sub) return null;
  return (
    <div className="text-center flex flex-col items-center justify-center mb-10 max-w-3xl mx-auto">
      {label && (
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 bg-[var(--royal-blue)]/10">
          <Newspaper className="text-[var(--royal-blue)]" size={18} />
          <span className="text-[var(--royal-blue)] font-medium text-sm">{label}</span>
        </div>
      )}
      {headline && (
        <h2
          className="mb-3 font-semibold text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)',
            lineHeight: '1.2'
          }}
        >
          {headline}
        </h2>
      )}
      {sub && (
        <p className="text-center text-[var(--midnight-navy)]/70 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: '1.125rem' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Feature title above spread ─────────────────────────────────────────────
function FeatureTitle({ item }: { item: PressItem }) {
  return (
    <div className="mb-3 animate-tab-fade-in">
      {item.category && (
        <p className="font-sans text-[11px] text-[var(--muted-foreground)] italic mb-0.5">{item.category}</p>
      )}
      {item.headline && (
        <h3 className="font-serif font-bold text-[var(--foreground)] text-lg sm:text-xl leading-tight">{item.headline}</h3>
      )}
      {item.subheadline && (
        <p className="font-sans text-[var(--muted-foreground)] text-xs sm:text-sm leading-snug">{item.subheadline}</p>
      )}
    </div>
  );
}

// ── Spread card — click opens lightbox ────────────────────────────────────
function SpreadCard({
  item,
  className = '',
  imgStyle,
  onOpen,
  zoomEnabled = true,
}: {
  item: PressItem;
  className?: string;
  imgStyle?: React.CSSProperties;
  onOpen?: () => void;
  zoomEnabled?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/5 backdrop-blur-sm shadow-sm
        group transition-all duration-500 ease-out
        hover:shadow-[0_12px_30px_rgba(200,158,76,0.12)] hover:border-[#f9c53c]/40 hover:-translate-y-1
        ${zoomEnabled ? 'cursor-zoom-in' : ''} ${className}`}
      onClick={zoomEnabled ? onOpen : undefined}
      title={zoomEnabled ? 'Click to read full spread' : undefined}
    >
      <div className="relative w-full h-full overflow-hidden bg-black/10">
        <OptimizedImage
          src={item.imageUrl}
          alt={item.headline || item.publication || 'Press'}
          className="w-full h-full object-cover object-top scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
          style={imgStyle}
          loading="lazy"
        />
        {/* Soft elegant gradient mask overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-500" />
      </div>

      {/* Hover hint */}
      {zoomEnabled && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 scale-90 group-hover:scale-100 transition-transform duration-300">
            <span className="font-sans text-[10px] font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f9c53c] animate-pulse" />
              Read Spread
            </span>
          </div>
        </div>
      )}

      {/* Publication Badge */}
      {item.publication && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/5 shadow-md">
          <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-[#f9c53c]">
            {item.publication}
          </span>
        </div>
      )}

      {/* Date badge */}
      {item.date && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/5 text-[9px] text-white/80 font-medium">
          {item.date}
        </div>
      )}
    </div>
  );
}

export default function PressModule({ id, data }: PressModuleProps) {
  const variant = data.variant || 'features';
  const zoomEnabled = data.enableZoom !== false; // default true
  const items = (data.items || []).filter(item => !item.hidden);

  const initialShown = variant === 'magazine-grid' || variant === 'newspaper-row' ? 6 : 4;
  const [shown, setShown] = useState(initialShown);
  const [deckIdx, setDeckIdx] = useState(0);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Sync shown count if variant changes (CMS preview support)
  useEffect(() => {
    setShown(initialShown);
  }, [variant, initialShown]);

  const [isHovered, setIsHovered] = useState(false);

  // Auto-play / auto-rotation with hover-pause
  useEffect(() => {
    if (!items.length || isHovered) return;

    const isSlider = ['deck', 'layered-deck', 'featured-carousel', 'editorial'].includes(variant);
    if (!isSlider) return;

    const intervalTime = 6000; // 6 seconds auto-rotation
    const timer = setInterval(() => {
      if (variant === 'deck' || variant === 'layered-deck') {
        setDeckIdx(prev => (prev + 1) % items.length);
      } else if (variant === 'featured-carousel' || variant === 'editorial') {
        setFeaturedIdx(prev => (prev + 1) % items.length);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [items.length, variant, isHovered]);

  const openLightbox = (i: number) => setLightboxIdx(i);
  const closeLightbox = () => setLightboxIdx(null);

  // ─── MARQUEE ──────────────────────────────────────────────────────────────
  const renderMarquee = () => {
    if (!items.length) return null;

    const fill = (arr: PressItem[]) => {
      const out = [...arr];
      while (out.length < 10) out.push(...arr);
      return [...out, ...out];
    };
    const row1 = fill(items);
    const row2 = fill([...items].reverse());
    const W = 260, H = 168, G = 14;

    return (
      <>
        <style>{`
          @keyframes pm-l { from { transform:translateX(0); }    to { transform:translateX(-50%); } }
          @keyframes pm-r { from { transform:translateX(-50%); } to { transform:translateX(0); } }
          .pm-r1:hover > div, .pm-r2:hover > div { animation-play-state:paused !important; }
        `}</style>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

          {/* Row 1 ← */}
          <div className="pm-r1 overflow-hidden mb-[14px]">
            <div className="flex" style={{ gap: G, width: 'max-content', animation: 'pm-l 120s linear infinite' }}>
              {row1.map((item, i) => {
                const realIdx = i % items.length;
                return (
                  <SpreadCard
                    key={i} item={item}
                    className="rounded-xl flex-shrink-0"
                    imgStyle={{ width: W, height: H, objectFit: 'cover' }}
                    zoomEnabled={zoomEnabled}
                    onOpen={() => openLightbox(realIdx)}
                  />
                );
              })}
            </div>
          </div>

          {/* Row 2 → */}
          <div className="pm-r2 overflow-hidden">
            <div className="flex" style={{ gap: G, width: 'max-content', animation: 'pm-r 90s linear infinite' }}>
              {row2.map((item, i) => {
                const realIdx = (items.length - 1) - (i % items.length);
                return (
                  <SpreadCard
                    key={i} item={item}
                    className="rounded-xl flex-shrink-0"
                    imgStyle={{ width: W, height: H, objectFit: 'cover' }}
                    zoomEnabled={zoomEnabled}
                    onOpen={() => openLightbox(realIdx)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ─── FEATURES ──────────────────────────────────────────────────────────────
  const renderFeatures = () => {
    if (!items.length) return null;
    const visible = items.slice(0, shown);
    const hasMore = items.length > shown;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          {visible.map((item, i) => (
            <FadeIn
              key={i}
              variant="up"
              delay={(i % 2) * 100}
            >
              <FeatureTitle item={item} />
              <div className="w-8 h-[1.5px] bg-[#f9c53c]/60 mb-3" />
              <SpreadCard
                item={item}
                className="rounded-xl w-full"
                imgStyle={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: 'top' }}
                zoomEnabled={zoomEnabled}
                onOpen={() => openLightbox(i)}
              />
            </FadeIn>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          {hasMore && (
            <button
              onClick={() => setShown(s => s + 4)}
              className="font-sans text-[11px] font-semibold uppercase tracking-widest
                px-5 py-2.5 border border-[#f9c53c]/50 text-[var(--foreground)]
                hover:bg-[#f9c53c]/8 hover:border-[#f9c53c]
                transition-all duration-300 rounded-lg shadow-sm"
            >
              Show More ({items.length - shown} remaining)
            </button>
          )}
          {shown > 4 && (
            <button onClick={() => setShown(4)}
              className="font-sans text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors font-medium">
              Collapse ↑
            </button>
          )}
        </div>
        <p className="text-center font-sans text-[10px] text-[var(--muted-foreground)]/40 mt-3 tracking-wider">
          {items.length} PRESS FEATURES · CLICK ANY IMAGE TO READ
        </p>
      </div>
    );
  };

  // ─── DECK ──────────────────────────────────────────────────────────────────
  const renderDeck = () => {
    if (!items.length) return null;
    const N = items.length;
    const item = items[deckIdx];

    return (
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        <div className="flex-1 w-full max-w-[380px] text-left flex flex-col justify-between h-[360px] flex-shrink-0">
          {/* Page Number Rail (Top) */}
          <div className="w-full flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-sans text-[10px] font-bold text-[#8C6514] tracking-widest">
                {String(deckIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
              </span>
              <div className="flex-1 h-px bg-[var(--border)]">
                <div className="h-full bg-gradient-to-r from-[#e9a800] to-[#f9c53c] transition-all duration-500"
                  style={{ width: `${((deckIdx + 1) / N) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Text Content (Middle) */}
          <div className="flex-1 min-h-0 relative flex flex-col justify-center my-3">
            <div key={deckIdx} className="animate-tab-fade-in">
              <FeatureTitle item={item} />
              {item.publication && (
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C6514] mt-2">
                  {item.publication}
                  {item.date && <span className="text-[var(--muted-foreground)] ml-2 font-normal normal-case tracking-normal">· {item.date}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Buttons & Thumbnails (Bottom - fixed position) */}
          <div className="w-full flex-shrink-0">
            <div className="flex gap-4">
              <button onClick={() => setDeckIdx((deckIdx - 1 + N) % N)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.03] backdrop-blur-sm border border-[var(--border)] hover:border-[#f9c53c] hover:bg-[#f9c53c]/10 transition-all duration-300 text-[var(--foreground)] active:scale-95">
                <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              <button onClick={() => setDeckIdx((deckIdx + 1) % N)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.03] backdrop-blur-sm border border-[var(--border)] hover:border-[#f9c53c] hover:bg-[#f9c53c]/10 transition-all duration-300 text-[var(--foreground)] active:scale-95">
                <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
              </button>
              {zoomEnabled && (
                <button onClick={() => openLightbox(deckIdx)}
                  className="px-5 h-11 flex items-center rounded-full border border-[#f9c53c]/50 hover:bg-[#f9c53c]/10 transition-all font-sans text-[10px] font-bold tracking-widest uppercase text-[#8C6514]">
                  Read
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {items.map((it, i) => (
                <button key={i} onClick={() => setDeckIdx(i)}
                  className={`w-12 h-8 overflow-hidden rounded border-2 transition-all flex-shrink-0 ${
                    i === deckIdx ? 'border-[#f9c53c] scale-110' : 'border-[var(--border)] opacity-40 hover:opacity-70'
                  }`}>
                  <OptimizedImage src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div key={deckIdx} className="flex-1 w-full max-w-[800px] animate-tab-fade-in">
          <SpreadCard item={item} className="rounded-xl w-full"
            imgStyle={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: 'top' }}
            zoomEnabled={zoomEnabled}
            onOpen={() => openLightbox(deckIdx)} />
        </div>
      </div>
    );
  };

  // ─── EDITORIAL ─────────────────────────────────────────────────────────────
  const renderEditorial = () => {
    if (!items.length) return null;
    const featured = items[featuredIdx];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-0 border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)]/5 backdrop-blur-md shadow-lg"
        style={{ minHeight: 400 }}>
        <div className="flex flex-col border-r border-[var(--border)]">
          <div className="p-6 border-b border-[var(--border)] bg-black/5">
            <div key={featuredIdx} className="animate-tab-fade-in">
              <FeatureTitle item={featured} />
              {featured.publication && (
                <span className="inline-block mt-2 font-sans text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1 bg-[#f9c53c]/15 text-[#8C6514] border border-[#f9c53c]/30 rounded">
                  {featured.publication}{featured.date ? ` · ${featured.date}` : ''}
                </span>
              )}
            </div>
          </div>

          <div key={`img-${featuredIdx}`} className="flex-1 animate-tab-fade-in">
            <SpreadCard item={featured} className="h-full w-full rounded-none border-0"
              imgStyle={{ width: '100%', height: '100%', minHeight: 300, objectFit: 'cover', objectPosition: 'top' }}
              zoomEnabled={zoomEnabled}
              onOpen={() => openLightbox(featuredIdx)} />
          </div>
        </div>

        <div className="overflow-y-auto bg-[var(--background)]/35" style={{ maxHeight: 520 }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => setFeaturedIdx(i)}
              className={`relative w-full overflow-hidden border-b border-[var(--border)] last:border-0 block text-left transition-all p-3 ${
                i === featuredIdx ? 'bg-[#f9c53c]/10' : 'hover:bg-white/[0.03]'
              }`}>
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all ${i === featuredIdx ? 'bg-[#f9c53c]' : 'bg-transparent'}`} />
              <div className="flex gap-3">
                <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded border border-[var(--border)] relative flex items-center justify-center bg-black/10">
                  <OptimizedImage src={item.imageUrl} alt="" className="max-w-full max-h-full object-contain p-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  {item.category && <p className="font-sans text-[8px] italic text-[var(--muted-foreground)] truncate">{item.category}</p>}
                  {item.headline && <p className="font-serif font-semibold text-[var(--foreground)] text-[10px] leading-tight line-clamp-2 mt-0.5">{item.headline}</p>}
                  {item.publication && <p className="font-sans text-[8px] font-bold uppercase tracking-wider text-[#8C6514] mt-0.5 truncate">{item.publication}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ─── MAGAZINE GRID ─────────────────────────────────────────────────────────
  const renderMagazineGrid = () => {
    if (!items.length) return null;
    const visible = items.slice(0, shown);
    const hasMore = items.length > shown;

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((item, i) => (
            <FadeIn
              key={i}
              variant="up"
              delay={Math.min((i % 3) * 80, 300)}
            >
              <div
                className="group relative flex flex-col bg-[var(--card)]/5 backdrop-blur-sm border border-[var(--border)] hover:border-[#f9c53c]/30 rounded-2xl p-4 transition-all duration-500 shadow-sm hover:shadow-[0_15px_40px_rgba(200,158,76,0.08)] cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                {/* Image Container with contain-fit */}
                <div className="aspect-[4/3] w-full bg-black/20 rounded-xl overflow-hidden relative border border-[var(--border)] flex items-center justify-center">
                  <OptimizedImage
                    src={item.imageUrl}
                    alt={item.headline || item.publication}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-1"
                  />
                  
                  {/* Hover Accent */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="font-sans text-[10px] font-semibold text-white tracking-[0.2em] uppercase bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f9c53c] animate-ping" />
                      Read Feature
                    </span>
                  </div>
                </div>

                {/* Text Area */}
                <div className="mt-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {item.publication && (
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C6514]">
                          {item.publication}
                        </span>
                      )}
                      {item.date && (
                        <span className="font-sans text-[9px] text-[var(--muted-foreground)]">
                          · {item.date}
                        </span>
                      )}
                    </div>
                    {item.headline && (
                      <h3 className="font-serif font-bold text-[var(--foreground)] text-base group-hover:text-[var(--royal-blue)] transition-colors leading-snug line-clamp-2 mb-1">
                        {item.headline}
                      </h3>
                    )}
                    {item.subheadline && (
                      <p className="font-sans text-[var(--muted-foreground)] text-xs line-clamp-2 leading-relaxed">
                        {item.subheadline}
                      </p>
                    )}
                  </div>
                  {item.category && (
                    <span className="inline-block mt-4 text-[9px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]/65 bg-[var(--border)]/30 px-2.5 py-1 rounded w-max">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {hasMore && (
            <button
              onClick={() => setShown(s => s + 6)}
              className="font-sans text-[11px] font-semibold uppercase tracking-widest
                px-6 py-3 border border-[#f9c53c]/40 text-[var(--foreground)] bg-white/[0.02]
                hover:bg-[#f9c53c]/8 hover:border-[#f9c53c]
                transition-all duration-300 rounded-lg shadow-sm"
            >
              Show More ({items.length - shown} remaining)
            </button>
          )}
          {shown > 6 && (
            <button onClick={() => setShown(6)}
              className="font-sans text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors font-medium">
              Collapse ↑
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── NEWSPAPER ROW ─────────────────────────────────────────────────────────
  const renderNewspaperRow = () => {
    if (!items.length) return null;
    const visible = items.slice(0, shown);
    const hasMore = items.length > shown;

    return (
      <div className="space-y-6">
        <div className="border-t border-[var(--border)]">
          {visible.map((item, i) => (
            <FadeIn
              key={i}
              variant="up"
              delay={Math.min(i * 50, 200)}
            >
              <div
                className="group border-b border-[var(--border)] py-6 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-gradient-to-r hover:from-[var(--royal-blue)]/5 hover:to-transparent hover:border-l-[3px] hover:border-l-[#f9c53c] transition-all duration-300 cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                {/* Left Column: Publication Details */}
                <div className="w-full md:w-48 flex-shrink-0">
                  <p className="font-serif font-bold text-xl text-[var(--foreground)] group-hover:text-[var(--royal-blue)] transition-colors">
                    {item.publication}
                  </p>
                  {item.date && (
                    <p className="font-sans text-xs text-[var(--muted-foreground)] mt-0.5">
                      {item.date}
                    </p>
                  )}
                  {item.category && (
                    <span className="inline-block mt-2 font-sans text-[9px] font-bold uppercase tracking-wider text-[#8C6514]">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Middle Column: Headline details */}
                <div className="flex-1 min-w-0">
                  {item.headline && (
                    <h3 className="font-serif font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--royal-blue)] transition-colors leading-snug">
                      {item.headline}
                    </h3>
                  )}
                  {item.subheadline && (
                    <p className="font-sans text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed max-w-2xl">
                      {item.subheadline}
                    </p>
                  )}
                </div>

                {/* Right Column: Mini Thumbnail Preview */}
                <div className="flex-shrink-0 flex items-center gap-4 self-end md:self-auto">
                  <div className="w-20 h-14 bg-black/10 rounded overflow-hidden border border-[var(--border)] group-hover:border-[#f9c53c]/40 transition-colors shadow-sm relative flex items-center justify-center">
                    <OptimizedImage
                      src={item.imageUrl}
                      alt=""
                      className="max-w-full max-h-full object-contain p-0.5 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white">🔍</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-[var(--border)] group-hover:border-[#f9c53c] flex items-center justify-center text-[var(--foreground)] transition-colors group-hover:scale-105">
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-[var(--foreground)]" />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {hasMore && (
            <button
              onClick={() => setShown(s => s + 6)}
              className="font-sans text-[11px] font-semibold uppercase tracking-widest
                px-5 py-2.5 border border-[#f9c53c]/40 text-[var(--foreground)]
                hover:bg-[#f9c53c]/8 hover:border-[#f9c53c]
                transition-all duration-300 rounded"
            >
              Show More ({items.length - shown} remaining)
            </button>
          )}
          {shown > 6 && (
            <button onClick={() => setShown(6)}
              className="font-sans text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors font-semibold">
              Collapse ↑
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── FEATURED CAROUSEL ─────────────────────────────────────────────────────
  const renderFeaturedCarousel = () => {
    if (!items.length) return null;
    const N = items.length;
    const item = items[featuredIdx];

    const prev = () => setFeaturedIdx(i => (i - 1 + N) % N);
    const next = () => setFeaturedIdx(i => (i + 1) % N);

    return (
      <div className="space-y-8 flex flex-col items-center">
        {/* Slider Frame */}
        <div className="relative w-full overflow-hidden py-4 flex items-center justify-center min-h-[360px]">
          {/* Faded background image of current active slide */}
          <div className="absolute inset-0 z-0 opacity-5 blur-2xl pointer-events-none scale-110">
            <OptimizedImage src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 flex items-center justify-center w-full max-w-5xl gap-4 sm:gap-8">
            {/* Prev Side Card (Visible on larger screens) */}
            <div 
              className="hidden md:block w-1/4 aspect-[16/10] bg-black/40 border border-white/5 opacity-30 blur-[1px] scale-85 rounded-xl overflow-hidden cursor-pointer select-none"
              onClick={prev}
            >
              <OptimizedImage src={items[(featuredIdx - 1 + N) % N].imageUrl} alt="" className="w-full h-full object-cover object-top" />
            </div>

            {/* Active Card */}
            <div key={featuredIdx} className="w-full md:w-1/2 flex flex-col items-center animate-tab-fade-in">
              <SpreadCard
                item={item}
                className="w-full aspect-[16/10] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
                imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                zoomEnabled={zoomEnabled}
                onOpen={() => openLightbox(featuredIdx)}
              />
            </div>

            {/* Next Side Card (Visible on larger screens) */}
            <div 
              className="hidden md:block w-1/4 aspect-[16/10] bg-black/40 border border-white/5 opacity-30 blur-[1px] scale-85 rounded-xl overflow-hidden cursor-pointer select-none"
              onClick={next}
            >
              <OptimizedImage src={items[(featuredIdx + 1) % N].imageUrl} alt="" className="w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* Navigation overlay controls on mobile/small screens */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-20">
            <button
              onClick={prev}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all pointer-events-auto text-white active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all pointer-events-auto text-white active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Under-slider Text details */}
        <div className="max-w-2xl text-center px-4">
          <div key={featuredIdx} className="flex flex-col items-center animate-tab-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C6514]">
                {item.publication}
              </span>
              {item.date && (
                <span className="font-sans text-[10px] text-[var(--muted-foreground)]">
                  · {item.date}
                </span>
              )}
              {item.category && (
                <span className="px-2 py-0.5 rounded bg-[var(--border)]/40 font-sans text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  {item.category}
                </span>
              )}
            </div>

            {item.headline && (
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--foreground)] leading-tight tracking-tight mb-2">
                {item.headline}
              </h3>
            )}
            {item.subheadline && (
              <p className="font-sans text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
                {item.subheadline}
              </p>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setFeaturedIdx(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === featuredIdx
                    ? 'w-6 h-2 bg-gradient-to-r from-[#e9a800] to-[#f9c53c]'
                    : 'w-2 h-2 bg-[var(--border)] hover:bg-[#f9c53c]/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── LAYERED DECK ──────────────────────────────────────────────────────────
  const renderLayeredDeck = () => {
    if (!items.length) return null;
    const N = items.length;
    const activeItem = items[deckIdx];

    const next = () => setDeckIdx(i => (i + 1) % N);
    const prev = () => setDeckIdx(i => (i - 1 + N) % N);

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 py-6">
        {/* Stack Box */}
        <div className="relative w-full max-w-[440px] aspect-[16/11] flex items-center justify-center h-[300px]">
          {items.map((item, idx) => {
            const diff = (idx - deckIdx + N) % N;
            if (diff >= 3) return null;

            const zIndex = 30 - diff;
            const scale = 1 - diff * 0.05;
            const translateY = diff * 10;
            const translateX = diff === 0 ? 0 : diff === 1 ? 8 : -8;
            const rotate = diff === 0 ? 0 : diff === 1 ? 3 : -3;

            return (
              <div
                key={idx}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px) translateX(${translateX}px) rotate(${rotate}deg)`,
                  zIndex,
                  opacity: diff >= 3 ? 0 : 1 - diff * 0.35,
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute w-full h-full cursor-pointer select-none origin-bottom"
                onClick={diff === 0 ? () => openLightbox(idx) : next}
              >
                <div className="w-full h-full rounded-2xl shadow-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/10 backdrop-blur-sm relative">
                  <OptimizedImage
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover object-top"
                  />
                  {diff > 0 && (
                    <div className="absolute inset-0 bg-black/45 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Text Control Box */}
        <div className="flex-1 w-full max-w-[420px] text-left flex flex-col justify-between h-[300px] flex-shrink-0">
          {/* Page Number Rail (Top) */}
          <div className="w-full flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[10px] font-bold text-[#8C6514] tracking-widest uppercase">
                Page {String(deckIdx + 1).padStart(2, '0')} of {String(N).padStart(2, '0')}
              </span>
              <div className="flex-1 h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#e9a800] to-[#f9c53c] transition-all duration-300"
                  style={{ width: `${((deckIdx + 1) / N) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Text Content Container (Middle) */}
          <div className="flex-1 min-h-0 relative flex flex-col justify-center my-4">
            <div key={deckIdx} className="space-y-2.5 animate-tab-fade-in">
              <div className="flex flex-wrap items-center gap-2">
                {activeItem.publication && (
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C6514]">
                    {activeItem.publication}
                  </span>
                )}
                {activeItem.date && (
                  <span className="font-sans text-[10px] text-[var(--muted-foreground)]">
                    · {activeItem.date}
                  </span>
                )}
              </div>
              {activeItem.headline && (
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--foreground)] leading-snug">
                  {activeItem.headline}
                </h3>
              )}
              {activeItem.subheadline && (
                <p className="font-sans text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                  {activeItem.subheadline}
                </p>
              )}
            </div>
          </div>

          {/* Buttons (Bottom - fixed position) */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={prev}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[#f9c53c] text-[var(--foreground)] bg-white/[0.02] hover:bg-[#f9c53c]/10 transition-all duration-300 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[#f9c53c] text-[var(--foreground)] bg-white/[0.02] hover:bg-[#f9c53c]/10 transition-all duration-300 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            {zoomEnabled && (
              <button
                onClick={() => openLightbox(deckIdx)}
                className="px-5 h-11 flex items-center rounded-full border border-[#f9c53c] hover:bg-[#f9c53c]/10 transition-all duration-300 font-sans text-[10px] font-bold tracking-widest uppercase text-[#8C6514]"
              >
                <Maximize2 className="w-3.5 h-3.5 mr-2 text-[#8C6514]" />
                Open Spread
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Section shell ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Lightbox — portal-like, rendered at top level */}
      {lightboxIdx !== null && (
        <Lightbox
          items={items}
          startIdx={lightboxIdx}
          onClose={closeLightbox}
        />
      )}

      <section
        id={id}
        className="cv-auto relative w-full bg-[var(--background)] pt-10 pb-20 lg:pt-12 lg:pb-24 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Self-contained keyframe styles for transitions & animated background */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes tabFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-tab-fade-in {
            animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalContentSlideIn {
            from { transform: scale(0.96) translateY(15px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
          .animate-modal-fade {
            animation: modalFadeIn 0.25s ease-out forwards;
          }
          .animate-modal-content {
            animation: modalContentSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes gridPulse {
            0%, 100% { opacity: 0.02; transform: translateY(0); }
            50% { opacity: 0.05; transform: translateY(4px); }
          }
          .animate-grid-pulse {
            animation: gridPulse 15s ease-in-out infinite;
          }
        `}} />

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
            className="absolute inset-0 animate-grid-pulse"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, var(--royal-blue) 0.8px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
          
          {/* Tiny, soft ambient watercolor lights */}
          <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-[var(--royal-blue)]/2.5 blur-[100px] dark:bg-[var(--royal-blue)]/6" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[35%] h-[35%] rounded-full bg-[#f9c53c]/2.5 blur-[100px] dark:bg-[#f9c53c]/6" />
          
          {/* Faint side vertical guidelines framing the content columns */}
          <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--royal-blue)]/2 to-transparent hidden lg:block" />
          <div className="absolute right-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--royal-blue)]/2 to-transparent hidden lg:block" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,158,76,0.04),transparent_65%)] pointer-events-none" />
        <div className="relative z-10 section-container">
          <SectionHeader label={data.sectionLabel} headline={data.headline} sub={data.subheadline} />
          {variant === 'marquee'           && renderMarquee()}
          {variant === 'features'          && renderFeatures()}
          {variant === 'deck'              && renderDeck()}
          {variant === 'editorial'         && renderEditorial()}
          {variant === 'magazine-grid'     && renderMagazineGrid()}
          {variant === 'newspaper-row'     && renderNewspaperRow()}
          {variant === 'featured-carousel' && renderFeaturedCarousel()}
          {variant === 'layered-deck'      && renderLayeredDeck()}
          {items.length === 0 && (
            <div className="text-center py-16 text-[var(--muted-foreground)] font-sans text-sm border border-dashed border-[var(--border)] rounded">
              Add press items in the CMS editor to see them here.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
