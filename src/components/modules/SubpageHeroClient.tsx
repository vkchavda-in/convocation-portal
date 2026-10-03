'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HeroBlockData } from '@/types/cms';

// ─── CSS-native hero animations (no JS required) ────────────────────────────
const heroKeyframes = `
  @keyframes hero-fade-up {
    from { opacity: 0; transform: translateY(18px); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }
  @keyframes hero-fade-scale {
    from { opacity: 0; transform: scale(0.97);  filter: blur(3px); }
    to   { opacity: 1; transform: scale(1);     filter: blur(0);   }
  }
  @keyframes hero-scroll-dot {
    0%, 100% { transform: translateY(0);   opacity: 1;   }
    50%       { transform: translateY(6px); opacity: 0.4; }
  }
  .hero-fade-up {
    animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .hero-fade-scale {
    animation: hero-fade-scale 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
  }
  .hero-scroll-dot {
    animation: hero-scroll-dot 1.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-fade-up, .hero-fade-scale, .hero-scroll-dot,
    .sg-float, .sg-dash, .sg-glow, .sg-spin, .sg-orbit1, .sg-orbit2, .sg-orbit3,
    .ami-float, .ami-laser, .ami-pulse, .ami-flicker, .ami-scan {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const AdditiveManufacturingIllustration = () => (
  <svg
    viewBox="0 0 500 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[420px] h-auto select-none"
    aria-hidden="true"
  >
    <defs>
      <style>{`
        @keyframes ami-float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50%       { transform: translateY(-12px) translateX(6px); }
        }
        @keyframes ami-laser {
          0%, 100% { opacity: 0.2; stroke-width: 1.5; }
          50%       { opacity: 1.0; stroke-width: 3.5; }
        }
        @keyframes ami-pulse {
          0%, 100% { opacity: 0.3; r: 3; }
          50%       { opacity: 0.95; r: 5.5; }
        }
        @keyframes ami-flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 0.9; }
          20%, 24%, 55% { opacity: 0.45; }
        }
        @keyframes ami-scan {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -120; }
        }
        .ami-float { animation: ami-float 6s ease-in-out infinite; }
        .ami-laser { animation: ami-laser 0.4s ease-in-out infinite; }
        .ami-pulse { animation: ami-pulse 2s ease-in-out infinite; }
        .ami-flicker { animation: ami-flicker 5s ease-in-out infinite; }
        .ami-scan { stroke-dasharray: 8 4; animation: ami-scan 4s linear infinite; }
      `}</style>
      
      <radialGradient id="ami-laser-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#15B1D8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1556B2" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="ami-base-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1556B2" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#1556B2" stopOpacity="0" />
      </radialGradient>
      
      <linearGradient id="ami-nozzle-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      
      <filter id="ami-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1556B2" floodOpacity="0.08" />
      </filter>
    </defs>

    <ellipse cx="250" cy="280" rx="180" ry="45" fill="url(#ami-base-glow)" />

    <g opacity="0.3">
      <path d="M250 160 L410 240 L250 320 L90 240 Z" stroke="#1556B2" strokeWidth="1.5" />
      
      <path d="M130 220 L290 140" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M170 200 L330 120" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M210 180 L370 100" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M250 160 L410 80" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      
      <path d="M370 220 L210 140" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M330 200 L170 120" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M290 180 L130 120" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M250 160 L90  240" stroke="#1556B2" strokeWidth="0.5" strokeDasharray="3 3" />
      
      <line x1="90" y1="240" x2="250" y2="320" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="122" y1="224" x2="282" y2="304" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="154" y1="208" x2="314" y2="288" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="186" y1="192" x2="346" y2="272" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="218" y1="176" x2="378" y2="256" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="250" y1="160" x2="410" y2="240" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      
      <line x1="410" y1="240" x2="250" y2="320" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="378" y1="224" x2="218" y2="304" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="346" y1="208" x2="186" y2="288" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="314" y1="192" x2="154" y2="272" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="282" y1="176" x2="122" y2="256" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
      <line x1="250" y1="160" x2="90" y2="240" stroke="#1556B2" strokeWidth="0.5" opacity="0.4" />
    </g>

    <g opacity="0.4" className="font-mono text-[9px] font-bold" fill="#1556B2">
      <path d="M90 240 L50 220" stroke="#1556B2" strokeWidth="1" strokeDasharray="2 2" />
      <text x="38" y="218" textAnchor="middle">X</text>
      <path d="M410 240 L450 220" stroke="#1556B2" strokeWidth="1" strokeDasharray="2 2" />
      <text x="460" y="218" textAnchor="middle">Y</text>
      <path d="M250 160 L250 110" stroke="#1556B2" strokeWidth="1" strokeDasharray="2 2" />
      <text x="250" y="102" textAnchor="middle">Z</text>
    </g>

    <path d="M190 250 L250 220 L310 250 L250 280 Z" stroke="#1556B2" strokeWidth="1" opacity="0.25" />
    <path d="M200 240 L250 215 L300 240 L250 265 Z" stroke="#1556B2" strokeWidth="1.2" opacity="0.4" />
    <path d="M210 230 L250 210 L290 230 L250 250 Z" stroke="#1556B2" strokeWidth="1.5" opacity="0.65" />
    <path d="M220 220 L250 205 L280 220 L250 235 Z" stroke="#15B1D8" strokeWidth="1.8" className="ami-scan" />

    <circle cx="260" cy="210" r="4" fill="#15B1D8" className="ami-laser" />
    <circle cx="260" cy="210" r="12" fill="url(#ami-laser-glow)" className="ami-pulse" />

    <line x1="280" y1="130" x2="260" y2="210" stroke="#15B1D8" strokeWidth="2" strokeLinecap="round" className="ami-laser" />
    <polygon points="278,130 282,130 261,210 259,210" fill="#15B1D8" opacity="0.3" className="ami-laser" />

    <g className="ami-float" filter="url(#ami-shadow)">
      <rect x="255" y="80" width="50" height="40" rx="4" fill="url(#ami-nozzle-grad)" stroke="#94a3b8" strokeWidth="1" />
      <rect x="265" y="86" width="30" height="28" rx="2" fill="#334155" />
      <line x1="270" y1="92" x2="290" y2="92" stroke="#475569" strokeWidth="2" />
      <line x1="270" y1="98" x2="290" y2="98" stroke="#475569" strokeWidth="2" />
      <line x1="270" y1="104" x2="290" y2="104" stroke="#475569" strokeWidth="2" />
      <polygon points="275,120 285,120 282,130 278,130" fill="#d97706" />
      <path d="M280 80 C280 40 330 30 360 45" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M290 80 C290 50 340 40 370 55" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 1" fill="none" strokeLinecap="round" />
    </g>

    <g transform="translate(325, 60)" className="ami-flicker">
      <rect x="0" y="0" width="125" height="78" rx="8" fill="white" fillOpacity="0.8" stroke="#e2e8f0" strokeWidth="1" />
      <circle cx="11" cy="11" r="3" fill="#10b981" />
      <text x="18" y="14" fontSize="7" fontWeight="bold" fill="#334155" fontFamily="monospace">SYSTEM ONLINE</text>
      <text x="8" y="30" fontSize="7" fill="#64748b" fontFamily="monospace">LAYER: 142/500</text>
      <text x="8" y="42" fontSize="7" fill="#64748b" fontFamily="monospace">SPEED: 240 MM/S</text>
      <text x="8" y="54" fontSize="7" fill="#64748b" fontFamily="monospace">TEMP:  210 C</text>
      <text x="8" y="66" fontSize="7" fill="#1556B2" fontFamily="monospace" fontWeight="bold">MATL:  TI-6AL-4V</text>
      <path d="M85 30 L95 24 L102 34 L112 18 L118 26" stroke="#15B1D8" strokeWidth="1" fill="none" />
      <circle cx="118" cy="26" r="1.5" fill="#15B1D8" />
    </g>

    <g transform="translate(45, 120)" className="ami-float" style={{ animationDelay: '1.5s' }}>
      <rect x="0" y="0" width="84" height="42" rx="8" fill="white" fillOpacity="0.8" stroke="#e2e8f0" strokeWidth="1" />
      <text x="8" y="16" fontSize="7" fontWeight="bold" fill="#1556B2" fontFamily="monospace">COORDINATES</text>
      <text x="8" y="28" fontSize="8" fontWeight="bold" fill="#334155" fontFamily="monospace">X: 25.42</text>
      <text x="46" y="28" fontSize="8" fontWeight="bold" fill="#334155" fontFamily="monospace">Y: 88.10</text>
      <text x="8" y="37" fontSize="8" fontWeight="bold" fill="#334155" fontFamily="monospace">Z: 14.20</text>
      <circle cx="74" cy="14" r="2" fill="#15B1D8" className="ami-pulse" />
    </g>

    <circle cx="280" cy="230" r="1.5" fill="#15B1D8" opacity="0.6" className="ami-pulse" />
    <circle cx="240" cy="180" r="2"   fill="#1556B2" opacity="0.3" className="ami-pulse" style={{ animationDelay: '0.8s' }} />
    <circle cx="340" cy="220" r="1.2" fill="#15B1D8" opacity="0.4" className="ami-pulse" style={{ animationDelay: '1.2s' }} />
  </svg>
);

export default function SubpageHeroClient({ id, data }: { id?: string; data: HeroBlockData }) {
  const pathname = usePathname();
  const {
    title,
    subtitle,
    description,
    primaryCTA,
    secondaryCTA,
    variant,
    subpageHeight = 'medium',
    subpageAlign = 'left',
    lightBgStyle = 'grid-dots',
    lightGradientPos = 'none',
    portrait
  } = data;

  const resolvedVariant = variant || 'subpage-dark';
  const isLight = resolvedVariant === 'subpage-light';
  const isShortSubtitle = subtitle && subtitle.length < 35;
  const height = subpageHeight || 'medium';
  const align = subpageAlign || 'left';
  const isCenter = align === 'center';
  
  // Choose height and padding classes
  let heightClass = 'min-h-[360px] pt-12 pb-20 md:pt-16 md:pb-28';
  if (height === 'short') {
    heightClass = 'min-h-[220px] pt-8 pb-12 md:pt-10 md:pb-18';
  } else if (height === 'full') {
    heightClass = 'min-h-[calc(100vh-116px)] pt-16 pb-24 md:pt-20 md:pb-32';
  }

  const bgImage = data.bgImage;

  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...pathParts.map((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/');
      const label = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    })
  ];

  const renderBreadcrumbs = (centered = false, darkTheme = false) => {
    if (breadcrumbs.length <= 1) return null;
    return (
      <nav aria-label="breadcrumb" className={`mt-8 select-none w-full ${centered ? 'flex justify-center' : 'flex justify-start'}`}>
        <ol className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold font-sans">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={item.href} className="inline-flex items-center">
                {index > 0 && <span className={`mx-2 font-normal select-none ${darkTheme ? 'text-white/30' : 'text-slate-350'}`}>/</span>}
                {isLast ? (
                  <span className={darkTheme ? 'text-[var(--gold)] font-bold' : 'text-[var(--royal-blue)] font-bold'}>{item.label}</span>
                ) : (
                  <Link 
                    href={item.href} 
                    className={darkTheme ? 'text-white/50 hover:text-[var(--gold)] transition-colors' : 'text-slate-400 hover:text-[var(--royal-blue)] transition-colors'}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: heroKeyframes }} />
    <section 
      id={id} 
      className={`relative overflow-hidden flex items-center border-b ${
        isLight 
          ? 'text-slate-800 border-slate-200/50' 
          : 'text-white border-slate-200/10'
      } ${!isLight ? 'min-h-[340px] md:min-h-[420px] pt-16 pb-12' : heightClass}`}
      style={{
        background: isLight 
          ? (lightBgStyle === 'slate-tint' ? '#f8fafc' : '#ffffff')
          : (bgImage ? '#090d16' : 'linear-gradient(135deg, var(--abyss) 0%, var(--navy) 60%, var(--slate-blue) 100%)')
      }}
    >
      {/* Background Image & Overlay (Dark mode subpage only) */}
      {!isLight && bgImage && (
        <>
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {(() => {
              const isLocalImage = (bgImage.startsWith('/uploads/') || bgImage.startsWith('/assets/images/')) &&
                /\.(png|jpg|jpeg|webp)$/i.test(bgImage);
              if (!isLocalImage) {
                return (
                  <img
                    src={bgImage}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-center opacity-20"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                );
              }
              const lastDotIdx = bgImage.lastIndexOf('.');
              const basePath = bgImage.slice(0, lastDotIdx);
              return (
                <picture className="absolute inset-0 w-full h-full">
                  <source srcSet={`${basePath}-mobile.avif`} media="(max-width: 640px)" type="image/avif" />
                  <source srcSet={`${basePath}-tablet.avif`} media="(max-width: 1024px)" type="image/avif" />
                  <source srcSet={`${basePath}-desktop.avif`} type="image/avif" />
                  <source srcSet={`${basePath}.webp`} type="image/webp" />
                  <img
                    src={bgImage}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-center opacity-20"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              );
            })()}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent pointer-events-none" />
        </>
      )}

      {/* Delicate technical grid & dot matrix background layers (Light mode only) */}
      {isLight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 98%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 98%)'
            }}
          >
            {/* Engineering Grid Pattern */}
            {(lightBgStyle === 'grid-dots' || lightBgStyle === 'grid' || lightBgStyle === 'slate-tint') && (
              <div 
                className="absolute inset-0 bg-[linear-gradient(to_right,rgba(21,86,178,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(21,86,178,0.035)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" 
              />
            )}
            {/* Coordinate Dot Matrix Pattern */}
            {(lightBgStyle === 'grid-dots' || lightBgStyle === 'dots' || lightBgStyle === 'slate-tint') && (
              <div 
                className="absolute inset-0 bg-[radial-gradient(rgba(21,86,178,0.05)_1.5px,transparent_1.5px)] bg-[size:1.75rem_1.75rem]" 
              />
            )}
          </div>

          {/* Corner Spotlight Gradients */}
          {(lightGradientPos === 'top-right' || lightGradientPos === 'both') && (
            <div 
              className="absolute top-0 right-0 w-[600px] h-full pointer-events-none select-none bg-[radial-gradient(ellipse_at_100%_0%,rgba(21,86,178,0.18)_0%,rgba(21,177,216,0.05)_50%,transparent_80%)]"
            />
          )}
          {(lightGradientPos === 'top-left' || lightGradientPos === 'both') && (
            <div 
              className="absolute top-0 left-0 w-[600px] h-full pointer-events-none select-none bg-[radial-gradient(ellipse_at_0%_0%,rgba(21,86,178,0.18)_0%,rgba(21,177,216,0.05)_50%,transparent_80%)]"
            />
          )}
        </div>
      )}

      {/* Floating lights when there is no background image (Dark mode subpage only) */}
      {!isLight && !bgImage && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-br from-[var(--navy)]/20 to-[var(--gold)]/20 rounded-full blur-[100px] opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.25]" />
        </div>
      )}

      {isLight && !isCenter ? (
        <div className="section-container relative z-10 w-full animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="col-span-12 lg:col-span-7 flex flex-col items-start text-left">
              <div className="hero-fade-up flex flex-col items-start text-left w-full">
                {subtitle && (
                  <div 
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase font-sans border mb-5 shadow-sm bg-[var(--royal-blue)]/5 text-[var(--royal-blue)] border-[var(--royal-blue)]/10"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--royal-blue)] animate-pulse" />
                    <span>{subtitle}</span>
                  </div>
                )}

                <h1 
                  className="mb-5 font-bold tracking-tight text-slate-655 w-full" 
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                    lineHeight: '1.15',
                    letterSpacing: '-0.015em'
                  }}
                >
                  {title}
                </h1>

                {description && (
                  <p className="leading-relaxed text-slate-655 max-w-2xl text-xs sm:text-sm md:text-base mb-6 border-l-2 border-[var(--royal-blue)]/20 pl-4">
                    {description}
                  </p>
                )}

                {(primaryCTA || secondaryCTA) && (
                  <div className="flex flex-row flex-wrap gap-3 pt-2 w-full justify-start items-center">
                    {primaryCTA && (
                      <Link
                        href={primaryCTA.url}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs sm:text-sm tracking-wide w-auto text-center bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] shadow-lg shadow-amber-500/25"
                      >
                        <span>{primaryCTA.label}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    {secondaryCTA && (
                      <Link
                        href={secondaryCTA.url}
                        className="inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl border border-slate-200/60 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm tracking-wide w-auto text-center"
                      >
                        <span>{secondaryCTA.label}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="hero-fade-scale col-span-12 lg:col-span-5 flex items-center justify-center relative mt-6 lg:mt-0">
              {portrait?.imageUrl ? (
                <div className="relative shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
                  {/* Offset backing shadow box */}
                  <div className="absolute inset-0 border border-[var(--secondary)] translate-x-2 translate-y-2 rounded-xl pointer-events-none" />
                  
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200/60 shadow-md">
                    <img
                      src={portrait.imageUrl}
                      alt={portrait.imageAlt || title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              ) : (
                <AdditiveManufacturingIllustration />
              )}
            </div>
          </div>
          {renderBreadcrumbs(false, false)}
        </div>
      ) : (
        <div className="section-container relative z-10 w-full">
          {!isLight && portrait?.imageUrl ? (
            /* Redesigned subpage-dark layout with portrait grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
              {/* Left Content */}
              <div className="col-span-12 lg:col-span-8 flex flex-col items-start text-left hero-fade-up">
                {subtitle && (
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans border mb-4 shadow-sm bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                    <span>{subtitle}</span>
                  </div>
                )}

                <h1 
                  className="mb-4 font-bold tracking-tight text-white font-serif leading-tight animate-fadeIn" 
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  }}
                >
                  {title}
                </h1>

                {description && (
                  <p className="leading-relaxed text-white/70 max-w-2xl text-xs sm:text-sm md:text-base mb-6 border-l-2 border-[var(--gold)]/35 pl-4">
                    {description}
                  </p>
                )}

                {/* Gold accent line */}
                <div className="w-16 h-0.5 bg-[var(--gold)] mt-4 mb-6" />

                {(primaryCTA || secondaryCTA) && (
                  <div className="flex flex-row flex-wrap gap-3 pt-2 w-full justify-start items-center">
                    {primaryCTA && (
                      <Link
                        href={primaryCTA.url}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                      >
                        <span>{primaryCTA.label}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    {secondaryCTA && (
                      <Link
                        href={secondaryCTA.url}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm tracking-wide bg-white/10 backdrop-blur-sm text-white border-white/15 hover:bg-white/20"
                      >
                        <span>{secondaryCTA.label}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column — Portrait Image */}
              <div className="col-span-12 lg:col-span-4 flex items-center justify-center lg:justify-end hero-fade-scale mt-6 lg:mt-0">
                <div className="relative shrink-0 w-full max-w-[280px] h-[280px] md:h-[340px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-white/10">
                  <img
                    src={portrait.imageUrl}
                    alt={portrait.imageAlt || title}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            /* Standard subpage-dark or subpage-light without portrait */
            <div className={`max-w-3xl ${isCenter ? 'mx-auto' : ''}`}>
              <div className={`hero-fade-up flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
                {subtitle && isShortSubtitle && (
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans border mb-4 shadow-sm"
                    style={{
                      background: isLight ? 'rgba(21, 86, 178, 0.08)' : 'rgba(249, 197, 60, 0.15)',
                      color: isLight ? 'var(--royal-blue)' : '#f9c53c',
                      borderColor: isLight ? 'rgba(21, 86, 178, 0.15)' : 'rgba(249, 197, 60, 0.25)'
                    }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-[var(--royal-blue)]' : 'bg-[#f9c53c]'}`} />
                    <span>{subtitle}</span>
                  </div>
                )}

                {subtitle && !isShortSubtitle && (
                  <div className={`flex items-start gap-2 mb-4 max-w-3xl ${isCenter ? 'justify-center' : ''}`}>
                    {!isCenter && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 animate-pulse ${
                        isLight ? 'bg-[var(--royal-blue)]' : 'bg-[#f9c53c]'
                      }`} />
                    )}
                    <span className={`font-semibold text-xs sm:text-sm tracking-wide leading-relaxed ${
                      isLight ? 'text-[var(--royal-blue)]' : 'text-[#f9c53c]'
                    }`}>
                      {subtitle}
                    </span>
                  </div>
                )}

                <h1 
                  className={`mb-4 font-bold tracking-tight ${isLight ? 'text-slate-655' : 'text-white'}`} 
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                    lineHeight: '1.15',
                  }}
                >
                  {title}
                </h1>

                {description && (
                  <p className={`leading-relaxed max-w-2xl text-xs sm:text-sm md:text-base mb-6 ${
                    isLight ? 'text-slate-655' : 'text-white/70'
                  }`}>
                    {description}
                  </p>
                )}

                {(primaryCTA || secondaryCTA) && (
                  <div className={`flex flex-row flex-wrap gap-3 pt-2 w-full items-center ${isCenter ? 'justify-center' : 'justify-start'}`}>
                    {primaryCTA && (
                      <Link
                        href={primaryCTA.url}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xs sm:text-sm tracking-wide w-auto text-center bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                      >
                        <span>{primaryCTA.label}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    {secondaryCTA && (
                      <Link
                        href={secondaryCTA.url}
                        className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm tracking-wide w-auto text-center ${
                          isLight 
                            ? 'bg-slate-150 hover:bg-slate-200 text-slate-800 border-slate-200/60' 
                            : 'bg-white/10 backdrop-blur-sm text-white border-white/15 hover:bg-white/20'
                        }`}
                      >
                        <span>{secondaryCTA.label}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Render breadcrumbs at the bottom */}
          {renderBreadcrumbs(isCenter, !isLight)}
        </div>
      )}

      {(height === 'medium' || height === 'full') && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-85 transition-opacity select-none">
          <span className={`text-[9px] uppercase tracking-widest font-bold ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
            Scroll
          </span>
          <div className={`w-4 h-7 border rounded-full flex justify-center p-0.5 ${isLight ? 'border-slate-300' : 'border-white/20'}`}>
            <div className={`hero-scroll-dot w-0.5 h-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-white/70'}`} />
          </div>
        </div>
      )}
    </section>
    </>
  );
}
