'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { GalleryBlockData } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';
import FadeIn from '@/components/shared/FadeIn';

interface GalleryModuleProps {
  id?: string;
  data: GalleryBlockData;
}

const GalleryMarquee = ({ images, onImageClick }: { images: any[], onImageClick: (idx: number) => void }) => {
  // Split images into two distinct sets for dual-row multi-directional flow
  const { row1Images, row2Images } = useMemo(() => {
    if (!images || images.length === 0) return { row1Images: [], row2Images: [] };
    const mid = Math.ceil(images.length / 2);
    const r1 = images.slice(0, mid);
    const r2 = images.slice(mid).length > 0 ? images.slice(mid) : r1;

    const makeSeamlessRow = (arr: any[]) => {
      let base = [...arr];
      while (base.length < 8) {
        base = [...base, ...arr];
      }
      return [...base, ...base];
    };

    return {
      row1Images: makeSeamlessRow(r1),
      row2Images: makeSeamlessRow(r2),
    };
  }, [images]);

  const renderCard = (image: any, index: number, isRow2 = false) => {
    const originalIndex = images.findIndex((img) => img.id === image.id || (img.url && img.url === image.url));
    const clickIdx = originalIndex >= 0 ? originalIndex : 0;
    const imgSrc = image.url || image.imageUrl || image.src;

    return (
      <div
        key={`${image.id || index}-${isRow2 ? 'r2' : 'r1'}-${index}`}
        onClick={() => onImageClick(clickIdx)}
        className="relative w-72 sm:w-80 h-48 sm:h-52 rounded-2xl overflow-hidden border border-slate-200/60 hover:border-[#f9c53c] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group shrink-0 bg-slate-900"
      >
        {imgSrc ? (
          <OptimizedImage
            src={imgSrc}
            alt={image.title || 'Gallery item'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A2540] to-slate-900 flex items-center justify-center">
            <ImageIcon size={32} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <span className="text-[10px] uppercase tracking-wider text-[#f9c53c] font-bold mb-1">
            {(image.category || 'ceremony').replace('_', ' ')}
          </span>
          <h4 className="text-white text-xs font-semibold truncate">
            {image.title}
          </h4>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden py-4 select-none space-y-5">
      <style>{`
        @keyframes gallery-marquee-forward {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes gallery-marquee-reverse {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        .animate-gallery-marquee-1 {
          display: flex;
          width: max-content;
          animation: gallery-marquee-forward 95s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .animate-gallery-marquee-2 {
          display: flex;
          width: max-content;
          animation: gallery-marquee-reverse 105s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .animate-gallery-marquee-1:hover,
        .animate-gallery-marquee-2:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Edge Blur Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

      {/* Row 1: Right-to-Left (Forward) */}
      <div className="animate-gallery-marquee-1 gap-5 flex">
        {row1Images.map((image, index) => renderCard(image, index, false))}
      </div>

      {/* Row 2: Left-to-Right (Reverse — Opposite Direction!) */}
      <div className="animate-gallery-marquee-2 gap-5 flex">
        {row2Images.map((image, index) => renderCard(image, index, true))}
      </div>
    </div>
  );
};

export default function GalleryModule({ id, data }: GalleryModuleProps) {
  const { title, subtitle, categories, images, variant = 'grid' } = data;
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset pagination when category changes
  useEffect(() => {
    setVisibleCount(12);
    setActiveImageIndex(null);
  }, [activeCategory]);

  const visibleImages = useMemo(() => (images || []).filter(img => !img.hidden), [images]);

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return visibleImages;
    return visibleImages.filter(img => img.category === activeCategory);
  }, [activeCategory, visibleImages]);

  const displayedImages = useMemo(() => filteredImages.slice(0, visibleCount), [filteredImages, visibleCount]);
  const activeImage = activeImageIndex !== null ? filteredImages[activeImageIndex] : null;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeImageIndex === null || filteredImages.length === 0) return;
    setActiveImageIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length));
  }, [activeImageIndex, filteredImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeImageIndex === null || filteredImages.length === 0) return;
    setActiveImageIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredImages.length));
  }, [activeImageIndex, filteredImages.length]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeImageIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setActiveImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, handlePrev, handleNext]);

  const getAspectClass = (aspect: string) => {
    switch (aspect) {
      case 'tall':
        return 'aspect-[3/4]';
      case 'wide':
        return 'aspect-[16/9]';
      default:
        return 'aspect-square';
    }
  };

  const isSlider = variant === 'slider';

  return (
    <section id={id} className="cv-auto py-20 bg-[var(--warm-white)] text-[var(--midnight-navy)] overflow-hidden">
      {/* Lightbox modal keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalContentSlideIn {
          from { transform: scale(0.96) translateY(12px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-fade {
          animation: modalFadeIn 0.25s ease-out forwards;
        }
        .animate-modal-content {
          animation: modalContentSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className="section-container">
        {title && (
          <FadeIn variant="up" delay={0} className="text-center mb-12">
            <h2 className="mb-4" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--midnight-navy)'
            }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--midnight-navy)]/70 max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}

        {/* Category Filters with Rich Golden Gradient Active State */}
        {!isSlider && categories && categories.length > 0 && (
          <FadeIn
            variant="up"
            delay={100}
            className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 mb-12"
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 sm:px-6 py-2.5 rounded-full transition-all duration-300 font-bold text-xs uppercase tracking-wider cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#06152B] border-transparent shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-white text-[var(--midnight-navy)]/80 border-slate-200 hover:border-[#f9c53c] hover:bg-[#f9c53c]/10 hover:text-[var(--midnight-navy)]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </FadeIn>
        )}

        {/* Dynamic Variant Render */}
        {!mounted ? (
          /* SSR/pre-mount: CSS columns visually matches masonry — zero layout shift on hydration */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {displayedImages.map((image) => {
              const imgSrc = image.url || image.imageUrl || image.src;
              return (
                <div
                  key={image.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 mb-6 break-inside-avoid"
                >
                  <div className={`${getAspectClass(image.aspect)} bg-slate-900 flex items-center justify-center relative overflow-hidden`}>
                    {imgSrc ? (
                      <OptimizedImage
                        src={imgSrc}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon size={40} className="text-white/20" />
                    )}
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#8C6514] font-bold">
                        {(image.category || 'ceremony').replace('_', ' ')}
                      </span>
                      {image.page && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Page {image.page}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[var(--midnight-navy)] font-semibold text-sm leading-snug line-clamp-2">
                      {image.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isSlider ? (
          /* Smooth Infinite Sliding Gallery */
          <GalleryMarquee 
            images={filteredImages} 
            onImageClick={(idx) => setActiveImageIndex(idx)} 
          />
        ) : (
          /* Premium Masonry Grid */
          <>
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3 }}>
              <Masonry gutter="1.5rem">
                {displayedImages.map((image, index) => {
                  const imgSrc = image.url || image.imageUrl || image.src;
                  return (
                    <FadeIn
                      key={image.id || index}
                      variant="up"
                      delay={Math.min((index % 12) * 40, 350)}
                    >
                      <div
                        onClick={() => {
                          const targetIdx = filteredImages.findIndex(img => img.id === image.id);
                          setActiveImageIndex(targetIdx >= 0 ? targetIdx : index);
                        }}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 hover:border-[#f9c53c] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                      >
                        <div className={`${getAspectClass(image.aspect)} bg-slate-900 flex items-center justify-center relative overflow-hidden`}>
                          {imgSrc ? (
                            <OptimizedImage
                              src={imgSrc}
                              alt={image.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon size={40} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl font-semibold text-xs border border-[#f9c53c]/40 shadow-lg group-hover:scale-105 transition-transform">
                              View Photo
                            </span>
                          </div>
                        </div>
                        <div className="p-5 bg-white border-t border-slate-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#8C6514] font-bold">
                              {(image.category || 'ceremony').replace('_', ' ')}
                            </span>
                            {image.page && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Page {image.page}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[var(--midnight-navy)] font-semibold text-sm group-hover:text-[#0A2540] transition-colors leading-snug line-clamp-2">
                            {image.title}
                          </h3>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </Masonry>
            </ResponsiveMasonry>

            {/* Pagination Controls */}
            {filteredImages.length > 0 && (
              <div className="mt-16 text-center flex flex-col items-center gap-4">
                <p className="text-sm text-[var(--midnight-navy)]/60">
                  Showing <span className="font-semibold text-[var(--midnight-navy)]">{displayedImages.length}</span> of{' '}
                  <span className="font-semibold text-[var(--midnight-navy)]">{filteredImages.length}</span> items
                </p>
                {/* Sleek Golden Progress Bar */}
                <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (displayedImages.length / filteredImages.length) * 100)}%` }}
                  />
                </div>
                {visibleCount < filteredImages.length && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#06152B] font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer text-sm"
                  >
                    Load More Images
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          PREMIUM LIGHTBOX MODAL (Direct body portal — unaffected by parent scroll or CSS transforms)
          ══════════════════════════════════════════════════════════════════════════ */}
      {mounted && activeImage && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 select-none animate-modal-fade"
          onClick={() => setActiveImageIndex(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Top-Right Screen Close Button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[1000000] p-2.5 rounded-full bg-black/70 hover:bg-[#f9c53c] hover:text-[#06152B] border border-white/20 text-white backdrop-blur-md transition-all shadow-2xl cursor-pointer hover:scale-105"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Left Arrow Button (Desktop / Tablet) */}
          {filteredImages.length > 1 && (
            <button
              onClick={handlePrev}
              className="fixed left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-[1000000] w-12 h-12 rounded-full bg-black/75 hover:bg-[#f9c53c] hover:text-[#06152B] border border-white/20 text-white backdrop-blur-md hidden sm:flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {/* Lightbox Content Container */}
          <div
            className="relative z-10 w-full max-w-5xl h-[88vh] max-h-[820px] bg-[#071120] rounded-2xl overflow-hidden border border-[#f9c53c]/30 shadow-2xl flex flex-col md:flex-row animate-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Image Frame (Left Column) */}
            <div className="flex-1 bg-[#030712] flex flex-col items-center justify-center relative min-h-0 overflow-hidden">
              <div className="w-full h-full p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-0 overflow-hidden">
                {(activeImage.url || activeImage.imageUrl || activeImage.src) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeImage.url || activeImage.imageUrl || activeImage.src}
                    src={activeImage.url || activeImage.imageUrl || activeImage.src}
                    alt={activeImage.title || 'Convocation Photo'}
                    className="max-w-full max-h-full object-contain rounded-lg drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
                  />
                ) : (
                  <div className="relative w-full max-w-[340px] aspect-square flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
                    <ImageIcon size={64} className="text-[#f9c53c] opacity-60 mb-3" />
                    <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">
                      Photo Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Quick Navigation Bar */}
              {filteredImages.length > 1 && (
                <div className="w-full flex md:hidden items-center justify-between gap-3 px-4 py-3 bg-[#060e1d] border-t border-white/10 shrink-0">
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-2 rounded-lg bg-white/10 active:bg-[#f9c53c] active:text-[#06152B] border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-[11px] text-white/60 font-semibold whitespace-nowrap">
                    {(activeImageIndex ?? 0) + 1} / {filteredImages.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-2 rounded-lg bg-white/10 active:bg-[#f9c53c] active:text-[#06152B] border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Caption & Details Side Panel (Right Column) */}
            <div className="w-full md:w-[360px] lg:w-[390px] bg-[#0A1628] border-t md:border-t-0 md:border-l border-white/10 p-5 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto shrink-0 max-h-[35vh] md:max-h-full">
              
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#f9c53c]/15 text-[#f9c53c] border border-[#f9c53c]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {(activeImage.category || 'ceremony').replace('_', ' ')}
                  </span>
                  
                  {/* Close Button on Desktop Sidebar */}
                  <button
                    onClick={() => setActiveImageIndex(null)}
                    className="p-1.5 rounded-full bg-white/5 text-white/70 hover:bg-[#f9c53c] hover:text-[#06152B] transition-colors hidden md:block cursor-pointer"
                    aria-label="Close details"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Caption / Title */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 leading-snug">
                  {activeImage.title}
                </h3>

                {/* Golden Divider */}
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#e9a800] to-[#f9c53c] mb-4" />

                {/* Detailed Description */}
                {activeImage.description && (
                  <div className="mb-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold flex items-center gap-1.5">
                      <FileText size={12} className="text-[#f9c53c]" />
                      Context Details
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      {activeImage.description}
                    </p>
                  </div>
                )}

                {/* Source Page Info */}
                {activeImage.page && (
                  <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                    <BookOpen size={16} className="text-[#f9c53c] shrink-0" />
                    <div>
                      <span className="text-[10px] text-white/40 block leading-none mb-0.5">Source Publication</span>
                      <span className="font-semibold text-white">Page {activeImage.page} of Coffee Table Book</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Pagination Info */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <span>
                  Photo <strong className="text-[#f9c53c]">{(activeImageIndex ?? 0) + 1}</strong> of <strong className="text-white">{filteredImages.length}</strong>
                </span>
                <span className="hidden md:inline text-[10px] text-white/40">
                  ← → keys to browse
                </span>
              </div>

            </div>
          </div>

          {/* Right Arrow Button (Desktop / Tablet) */}
          {filteredImages.length > 1 && (
            <button
              onClick={handleNext}
              className="fixed right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-[1000000] w-12 h-12 rounded-full bg-black/75 hover:bg-[#f9c53c] hover:text-[#06152B] border border-white/20 text-white backdrop-blur-md hidden sm:flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>,
        document.body
      )}
    </section>
  );
}

