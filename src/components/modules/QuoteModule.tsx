'use client';

import { useEffect, useRef, useState } from 'react';
import { QuoteBlockData } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface QuoteModuleProps {
  id?: string;
  data: QuoteBlockData;
}

// Crisp geometric flat-topped double-quote icon
const CleanQuoteIcon = ({ className }: { className?: string }) => (
  <svg
    width="36"
    height="28"
    viewBox="0 0 36 28"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M0 14C0 6.268 6.268 0 14 0v5.6C9.366 5.6 5.6 9.366 5.6 14h8.4v14H0V14zm22 0c0-7.732 6.268-14 14-14v5.6c-4.634 0-8.4 3.766-8.4 8.4h8.4v14H22V14z" />
  </svg>
);

export default function QuoteModule({ id, data }: QuoteModuleProps) {
  const quoteText = data.quote || '';
  const quoteAuthor = data.author || '';
  const quoteRole = data.citation || '';
  const quoteCategory = data.category || '';
  
  // Resolve image and signature paths
  const quoteImage = data.image || data.imageUrl || data.portraitUrl || '';
  const quoteSignature = data.signature || data.signaturePath || '';
  
  // Layout and orientation options
  const layoutVariant = data.layout || 'editorial';
  const imagePos = data.imagePosition || 'right'; // 'left' or 'right'
  const isImageLeft = imagePos === 'left';
  const fontStyle = data.fontStyle || 'serif';
  const isSans = fontStyle === 'sans';
  const bgTheme = data.backgroundTheme || 'parchment';

  // Sizing
  const imageSize = data.imageSize || 'medium';
  let imageMaxHeightClass = 'max-h-[360px] sm:max-h-[380px] lg:max-h-[400px]';
  if (imageSize === 'small') imageMaxHeightClass = 'max-h-[280px] sm:max-h-[300px]';
  else if (imageSize === 'large') imageMaxHeightClass = 'max-h-[380px] sm:max-h-[400px] lg:max-h-[420px]';
  else if (imageSize === 'xl' || imageSize === 'xxl') imageMaxHeightClass = 'max-h-[420px] sm:max-h-[440px]';

  // Background styling
  let bgClass = 'bg-[var(--parchment,#FEFCF8)]';
  if (bgTheme === 'cream') bgClass = 'bg-[var(--cream,#F8FAFC)]';
  else if (bgTheme === 'white') bgClass = 'bg-white';

  // IntersectionObserver for gentle entrance transition
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 1. SIMPLE CENTERED LAYOUT (No portrait image)
  if (layoutVariant === 'simple' || !quoteImage) {
    return (
      <section
        id={id}
        ref={sectionRef}
        className={`relative w-full py-16 md:py-20 ${bgClass} border-y border-[var(--fog,#DDE4EE)] transition-opacity duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="section-container max-w-4xl mx-auto text-center px-4 sm:px-6">
          {quoteCategory && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#f9c53c]/15 text-[#8C6514] border border-[#f9c53c]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9c53c]" />
                {quoteCategory}
              </span>
            </div>
          )}

          <CleanQuoteIcon className="w-10 h-8 text-[#f9c53c] mx-auto mb-6 opacity-90" />

          <blockquote
            className={`w-full mb-8 text-2xl sm:text-3xl lg:text-[32px] leading-[1.35] text-[var(--ink,#0D1B2E)] ${
              isSans ? 'font-sans' : 'font-serif'
            } font-medium tracking-tight`}
          >
            {quoteText}
          </blockquote>

          <div className="w-16 h-0.5 bg-[#f9c53c] mx-auto my-6 rounded-full" />

          <div className="flex flex-col items-center">
            {quoteAuthor && (
              <cite className="block not-italic text-lg sm:text-xl font-bold font-serif text-[var(--navy,#0B2545)]">
                {quoteAuthor}
              </cite>
            )}
            {quoteRole && (
              <span className="block text-sm text-[var(--slate-text,#4A5568)] font-medium mt-1">
                {quoteRole}
              </span>
            )}
            {quoteSignature && (
              quoteSignature.startsWith('M') ? (
                <svg width="200" height="60" viewBox="0 0 180 65" fill="none" className="mt-3 text-[#f9c53c] opacity-95">
                  <path d={quoteSignature} stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <img
                  src={quoteSignature}
                  alt={quoteAuthor ? `${quoteAuthor} Signature` : 'Signature'}
                  className="h-12 md:h-14 max-w-[200px] object-contain mt-3 select-none pointer-events-none"
                />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. CLEAN EDITORIAL / TWO-COLUMN LAYOUT (Compact Portrait on Left or Right)
  return (
    <section
      id={id}
      ref={sectionRef}
      className={`
        relative overflow-hidden
        w-full
        py-16 md:py-20
        ${bgClass}
        border-y border-[var(--fog,#DDE4EE)]
        transition-all duration-700 ease-out
      `}
    >
      <div className="section-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Portrait Column (Compact Width) */}
          <div
            className={`
              col-span-1 lg:col-span-4
              ${isImageLeft ? 'lg:order-1 flex justify-center lg:justify-start' : 'lg:order-2 flex justify-center lg:justify-end'}
              items-center
              transition-all duration-700 delay-100 ease-out
              ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
            `}
          >
            <div className="relative w-full max-w-[270px] sm:max-w-[300px] lg:max-w-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100/70 to-white/90 border border-slate-200/80 shadow-sm shadow-slate-900/5 p-2 sm:p-2.5">
              <div className={`relative w-full ${imageMaxHeightClass} aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center`}>
                <OptimizedImage
                  src={quoteImage}
                  alt={quoteAuthor ? `${quoteAuthor} Portrait` : 'Portrait'}
                  className="w-full h-full object-cover object-center hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
              </div>
            </div>
          </div>

          {/* Quote Text Column */}
          <div
            className={`
              col-span-1 lg:col-span-8
              ${isImageLeft ? 'lg:order-2' : 'lg:order-1'}
              flex flex-col items-start text-left
              transition-all duration-700 delay-200 ease-out
              ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
            `}
          >
            {/* Category / Role Label */}
            {quoteCategory && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#f9c53c]/15 text-[#8C6514] border border-[#f9c53c]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f9c53c]" />
                  {quoteCategory}
                </span>
              </div>
            )}

            {/* Quote Icon */}
            <div className="mb-4 text-[#f9c53c] opacity-95">
              <CleanQuoteIcon className="w-9 h-7 sm:w-11 sm:h-8" />
            </div>

            {/* Quote Text */}
            <blockquote
              className={`
                w-full mb-5
                text-xl sm:text-2xl lg:text-[26px] xl:text-[28px]
                ${isSans ? 'font-sans' : 'font-serif'}
                font-medium leading-[1.4]
                text-[var(--ink,#0D1B2E)]
                tracking-tight
              `}
              style={{ whiteSpace: 'pre-line' }}
            >
              {quoteText}
            </blockquote>

            {/* Gold Divider */}
            <div className="w-14 h-0.5 bg-[#f9c53c] my-3.5 rounded-full" />

            {/* Author, Title & Signature */}
            <div className="flex flex-col items-start w-full">
              {quoteAuthor && (
                <cite className="block not-italic text-lg sm:text-xl font-bold font-serif text-[var(--navy,#0B2545)] whitespace-pre-line leading-snug">
                  {quoteAuthor}
                </cite>
              )}
              {quoteRole && (
                <span className="block text-sm text-[var(--slate-text,#4A5568)] font-medium mt-1 whitespace-pre-line leading-relaxed">
                  {quoteRole}
                </span>
              )}
              {quoteSignature && (
                <div className="mt-3">
                  {quoteSignature.startsWith('M') ? (
                    <svg width="200" height="60" viewBox="0 0 180 65" fill="none" className="text-[#f9c53c] opacity-95">
                      <path d={quoteSignature} stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <img
                      src={quoteSignature}
                      alt={quoteAuthor ? `${quoteAuthor} Signature` : 'Signature'}
                      className="h-12 md:h-14 max-w-[200px] object-contain select-none pointer-events-none"
                    />
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
