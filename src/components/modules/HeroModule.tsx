"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Sparkles,
  Award,
  Download,
  FileText,
  Shield,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { HeroBlockData } from '@/types/cms';
import SubpageHeroClient from './SubpageHeroClient';

// ─── CSS-native animations inspired by MarinTimeGames ───────────────────────
const heroKeyframes = `
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50% { opacity: 0.85; transform: scale(1.06); }
  }
  @keyframes hero-fade-up {
    from { opacity: 0; transform: translateY(18px); filter: blur(3px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }
  @keyframes hero-bounce {
    0%, 100% { transform: translateY(0);   opacity: 0.8; }
    50%       { transform: translateY(6px); opacity: 0.4; }
  }
  .animate-pulse-glow {
    animation: pulse-glow 6s ease-in-out infinite;
  }
  .hero-bounce {
    animation: hero-bounce 1.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-pulse-glow, .hero-bounce {
      animation: none !important;
      transition: none !important;
    }
  }
`;

interface HeroModuleProps {
  id?: string;
  data: HeroBlockData;
}

export default function HeroModule({ id, data }: HeroModuleProps) {
  const {
    title = '19th Convocation.',
    subtitle = 'January 8, 2026 • 4:30 PM onwards',
    description = "India's premier academic milestone celebrating the perseverance, scholarly excellence, and future triumphs of our graduating cohort across diploma, undergraduate, postgraduate, and doctoral disciplines.",
    primaryCTA = { label: 'Download Invitation & Schedule', url: '/19th-convocation-3' },
    secondaryCTA = { label: 'Schedules & Protocols', url: '/convocation-schedule' },
    variant,
    layoutVariant,
  } = data;

  // ── Render dedicated Subpage Hero for all subpages ────────────────────────
  if (data.isSubpage || variant === 'subpage-light' || variant === 'subpage-dark') {
    return <SubpageHeroClient id={id} data={data} />;
  }

  // ── Cinematic hero scale (Dynamic Responsive Scaling) ──────────────────────
  // Recalculated dynamically accounting for the Topbar (40px) + Navbar (80px) = 120px!
  const heroSceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const H = 900;
    const update = () => {
      const el = heroSceneRef.current;
      if (!el) return;
      const headerOffset = window.innerWidth >= 768 ? 120 : 80;
      const availHeight = Math.max(window.innerHeight - headerOffset, 450);
      const scaleW = (window.innerWidth - 64) / 1480;
      const scaleH = (availHeight / H) * 1.04;
      const scale = Math.max(0.55, Math.min(1.15, Math.min(scaleW, scaleH)));
      el.style.setProperty('--hero-scale', scale.toFixed(6));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // ── Background image rotation ─────────────────────────────────────────────
  const defaultBgImages = [
    '/uploads/convocation-08-158a3767.jpg',
    '/uploads/convocation-14-158a9227.jpg',
    '/uploads/convocation-12-158a9209.jpg',
    '/uploads/convocation-21-mhdv5790.jpg',
    '/uploads/convocation-01-0u3a0768.jpg'
  ];
  const bgImages = (data as any).bgImages || (data.bgImage ? [data.bgImage] : defaultBgImages);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (bgImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bgImages.length);
      }, 5500);
      return () => clearInterval(interval);
    }
  }, [bgImages.length]);

  const activeVariant = useMemo(() => {
    if (variant === 'subpage-light' || layoutVariant === 'white-hero') {
      return 'white-hero';
    }
    if (layoutVariant === 'slider') {
      return 'slider';
    }
    return 'maritime-cinematic';
  }, [layoutVariant, variant]);

  // ══════════════════════════════════════════════════════════════════════════
  // KEPT VARIANT: WHITE HERO (Spotlight Light Mode)
  // ══════════════════════════════════════════════════════════════════════════
  if (activeVariant === 'white-hero') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: heroKeyframes }} />
        <section
          id={id}
          className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100dvh-120px)] min-h-[calc(100dvh-120px)] overflow-hidden flex items-center justify-center bg-white text-[#06152B] select-none"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,21,43,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,21,43,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div className="section-container relative z-10 w-full py-10 flex flex-col justify-center">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f9c53c]/15 border border-[#f9c53c]/40 text-xs font-bold uppercase tracking-[0.2em] text-[#8C6514]">
                <Sparkles size={14} className="text-[#f9c53c]" />
                <span>Official Convocation Portal</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#06152B] leading-[1.08] tracking-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="font-bold text-sm sm:text-base uppercase tracking-[0.18em] text-[#8C6514]">
                  {subtitle}
                </p>
              )}

              {description && (
                <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-2xl border-l-2 border-[#f9c53c] pl-4">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                {primaryCTA && (
                  <Link
                    href={primaryCTA.url}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] hover:brightness-105 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                  >
                    <span>{primaryCTA.label}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                {secondaryCTA && (
                  <Link
                    href={secondaryCTA.url}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#06152B] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                  >
                    <span>{secondaryCTA.label}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right-Side Image on White Hero Variant (Origin at bottom of hero, right spaced) */}
          <div className="hidden lg:flex absolute right-4 lg:right-8 xl:right-12 bottom-0 z-20 pointer-events-none h-[82%] max-w-[44%] xl:max-w-[46%] items-end justify-end">
            <img
              src={(data as any).rightImage || (data as any).studentImage || '/uploads/hero-student-right.png'}
              alt="Convocation"
              className="h-full w-auto max-w-full object-contain object-bottom-right drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
            />
          </div>
        </section>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // KEPT VARIANT: CLASSIC SLIDER
  // ══════════════════════════════════════════════════════════════════════════
  if (activeVariant === 'slider') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: heroKeyframes }} />
        <section
          id={id}
          className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100dvh-120px)] min-h-[calc(100dvh-120px)] overflow-hidden flex items-center justify-center bg-[#060f24] text-white select-none"
        >
          {/* Background slides */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {bgImages.map((imgUrl: string, idx: number) => {
              const isActive = idx === currentSlide;
              const isPrev = idx === (currentSlide - 1 + bgImages.length) % bgImages.length;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform ${
                    isActive ? 'translate-x-0 opacity-100 z-10' : isPrev ? '-translate-x-full opacity-0 z-0' : 'translate-x-full opacity-0 z-0'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Convocation Slide ${idx + 1}`}
                    className="w-full h-full object-cover object-center brightness-[0.84] contrast-[1.05]"
                  />
                </div>
              );
            })}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060f24]/78 via-[#060f24]/42 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060f24]/72 via-transparent to-[#060f24]/30 z-10" />
          </div>

          <div className="section-container relative z-20 w-full py-10 flex flex-col justify-center">
            <div className="max-w-2xl lg:max-w-3xl space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg border border-[#f9c53c]/40 bg-[#f9c53c] text-[#060f24]">
                <span className="w-2 h-2 rounded-full bg-[#060f24] animate-pulse" />
                8 January 2026 • GUNI 19th Convocation
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="font-bold text-sm sm:text-base uppercase tracking-[0.2em] text-[#f9c53c]">
                  {subtitle}
                </p>
              )}

              {description && (
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {primaryCTA && (
                  <Link
                    href={primaryCTA.url}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] hover:brightness-105 shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                  >
                    <span>{primaryCTA.label}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                {secondaryCTA && (
                  <Link
                    href={secondaryCTA.url}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold tracking-wide text-white border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    <span>{secondaryCTA.label}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right-Side Image on Slider Variant (Origin at bottom of hero, right spaced) */}
          <div className="hidden lg:flex absolute right-4 lg:right-8 xl:right-12 bottom-0 z-20 pointer-events-none h-[82%] max-w-[44%] xl:max-w-[46%] items-end justify-end">
            <img
              src={(data as any).rightImage || (data as any).studentImage || '/uploads/hero-student-right.png'}
              alt="Convocation"
              className="h-full w-auto max-w-full object-contain object-bottom-right drop-shadow-[0_25px_45px_rgba(0,0,0,0.75)]"
            />
          </div>
        </section>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FLAGSHIP VARIANT: MARINTIMEGAMES CINEMATIC (NO RIGHT SIDE, HEIGHT-CORRECTED)
  // Height strictly accounts for Topbar (40px) + Navbar (80px) = 120px!
  // No right column clutter — grand panoramic view of the convocation dais!
  // ══════════════════════════════════════════════════════════════════════════
  // Cinematic variant dynamic data
  const universityName = data.universityName || 'Ganpat University';
  const badgeText = data.badgeText || '19TH CONVOCATION • 2026';
  const titleLine1 = title || '19th Convocation.';
  const titleLine2 = data.titleHighlight || (subtitle && subtitle.length < 30 ? subtitle : 'Academic Triumph.');
  const motto = data.tagline || 'विद्यया विन्दतेऽमृतम् • Excellence Through Knowledge & Service';
  const studentImg = data.studentImage || data.rightImage || '/uploads/hero-student-right.png';
  const pills = data.infoPills || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroKeyframes }} />
      <section
        id={id}
        className="
          relative overflow-hidden
          w-full
          h-[calc(100vh-80px)] md:h-[calc(100dvh-120px)]
          min-h-[calc(100dvh-120px)]
          text-white
          bg-[#060f24]
          select-none
        "
      >
        {/* Background Visual Slideshow & Gradient Overlays */}
        <div
          className="
            absolute inset-0 z-0 overflow-hidden
            pointer-events-none
          "
          aria-hidden="true"
        >
          {bgImages.map((imgUrl: string, idx: number) => {
            const isActive = idx === currentSlide;
            const isPrev = idx === (currentSlide - 1 + bgImages.length) % bgImages.length;
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform ${
                  isActive ? 'translate-x-0 opacity-100' : isPrev ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Convocation Background ${idx + 1}`}
                  className="w-full h-full object-cover object-center brightness-[0.84] contrast-[1.05]"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}

          {/* Contrast tint gradients — lighter opacity for better background image visibility */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f24]/78 via-[#060f24]/42 to-[#060f24]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060f24]/72 via-transparent to-[#060f24]/25" />

          {/* Ambient Glowing Radial Lights */}
          <div
            className="
              absolute top-1/4 left-1/4
              w-[600px] h-[400px]
              bg-blue-600/15
              rounded-full
              blur-3xl animate-pulse-glow
            "
          />
          <div
            className="
              absolute bottom-1/4 right-1/3
              w-[500px] h-[500px]
              bg-amber-400/12
              rounded-full
              blur-3xl animate-pulse-glow
            "
            style={{ animationDelay: '2s' }}
          />
        </div>

        {/* ══ CINEMATIC SCENE (md+) ══════════════════════════════════════════
            Dynamically scaled canvas (1720×900 reference).
            Zero-layout-shift instant CSS scaling + ResizeObserver sync!
            ════════════════════════════════════════════════════════════════ */}
        <div
          ref={heroSceneRef}
          className="hidden md:block transition-all duration-200"
          style={{
            position: 'absolute',
            width: '1720px',
            height: '900px',
            top: '50%',
            left: 'var(--container-padding)',
            transform: 'translate(0, -50%) scale(var(--hero-scale, min(1.15, max(0.55, min(calc((100vw - 64px) / 1480), calc((100vh - 120px) / 900 * 1.04))))))',
            transformOrigin: 'left center',
            pointerEvents: 'none',
          }}
        >
          {/* ── EXPANSIVE CONTENT CONTAINER (width: 1260px, left: 0) ── */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '1260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              pointerEvents: 'auto',
              zIndex: 20,
            }}
          >
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.95)' }}>
                {universityName}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 900, padding: '5px 16px', borderRadius: '10px', backgroundColor: '#f9c53c', color: '#060f24', letterSpacing: '0.12em', boxShadow: '0 4px 14px rgba(249,197,60,0.3)' }}>
                {badgeText}
              </span>
            </div>

            {/* H1 — Monumental Two-Line Display Typography */}
            <h1 style={{ fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
              <span style={{ display: 'block', fontSize: '94px', lineHeight: 1.02, color: 'white', whiteSpace: 'nowrap' }}>
                {titleLine1}
              </span>
              {titleLine2 && (
                <span style={{
                  display: 'inline-block', fontSize: '94px', lineHeight: 1.04,
                  marginTop: '2px', paddingBottom: '8px',
                  background: 'linear-gradient(90deg, #fde68a, #f9c53c, #fbbf24)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}>
                  {titleLine2}
                </span>
              )}
            </h1>

            {/* University Sanskrit Motto */}
            {motto && (
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#f9c53c', letterSpacing: '0.05em', margin: '8px 0 22px' }}>
                {motto}
              </p>
            )}

            {/* Description */}
            <p style={{ fontSize: '21px', color: 'rgba(220,230,245,0.95)', lineHeight: 1.68, margin: '0 0 32px', maxWidth: '1080px', fontWeight: 300 }}>
              {description}
            </p>

            {/* Frosted Glass Meta Pills */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '16px', color: 'white', fontWeight: 600 }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#f9c53c', flexShrink: 0 }} />
                <span>{pills.date || 'January 8, 2026 • 4:30 PM Onwards'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '16px', color: 'white', fontWeight: 600 }}>
                <MapPin style={{ width: '20px', height: '20px', color: '#f9c53c', flexShrink: 0 }} />
                <span>{pills.venue || 'Ganpat Vidyanagar, Mehsana-Gandhinagar Highway'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '16px', color: 'white', fontWeight: 600 }}>
                <GraduationCap style={{ width: '20px', height: '20px', color: '#f9c53c', flexShrink: 0 }} />
                <span>{pills.classSize || 'Class of 2026 • 4,250+ Graduating Scholars'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '16px', color: 'white', fontWeight: 600 }}>
                <Award style={{ width: '20px', height: '20px', color: '#f9c53c', flexShrink: 0 }} />
                <span>{pills.chiefGuest || 'Chief Guest: Dr. Pradyuman Vaja • Guest of Honour: Dr. V. Narayanan'}</span>
              </div>
            </div>

            {/* Hero CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <Link
                href={primaryCTA.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 42px',
                  fontSize: '18px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #e9a800, #f9c53c, #f59e0b)',
                  color: '#060f24',
                  border: 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(249, 197, 60, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <FileText style={{ width: '22px', height: '22px', color: '#060f24' }} />
                {primaryCTA.label}
                <Download style={{ width: '20px', height: '20px', opacity: 0.85 }} />
              </Link>

              <Link
                href={secondaryCTA.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 40px',
                  fontSize: '18px',
                  borderRadius: '16px',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {secondaryCTA.label}
                <Trophy style={{ width: '22px', height: '22px', color: '#f9c53c' }} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── FLAGSHIP RIGHT-MOST HERO IMAGE (Origin at bottom-right, right spaced, heads aligned with title) ── */}
        <div
          className="
            hidden md:flex absolute right-4 lg:right-8 xl:right-12 bottom-0 z-10 pointer-events-none
            items-end justify-end
            h-[80%] max-w-[42%] lg:max-w-[45%] xl:max-w-[48%]
            overflow-visible
          "
        >
          <img
            src={studentImg}
            alt="Convocation Celebration"
            className="
              h-full w-auto max-w-full
              object-contain object-bottom-right
              drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)]
            "
          />
        </div>

        {/* ══ MOBILE FALLBACK (< md) — Optically Centered Content & Centered Characters ═══════ */}
        <div
          className="
            md:hidden relative z-10 flex flex-col justify-start
            h-full min-h-[calc(100dvh-80px)]
            px-5 sm:px-8 pt-24 sm:pt-28 pb-4 overflow-hidden
          "
        >
          {/* Mobile Centered Bottom Hero Characters - Positioned Lower to Bleed Off Bottom */}
          <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-0 flex items-end justify-center w-full max-w-[360px] sm:max-w-[440px] h-[46%] sm:h-[50%] overflow-visible">
            <img
              src={studentImg}
              alt="Convocation Students"
              className="w-auto h-full max-h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-all"
            />
          </div>

          {/* Centered / Balanced Text Content */}
          <div className="flex flex-col justify-start relative z-10">
            {/* Top Line with Clean Stacked Line Break */}
            <div className="flex flex-col items-start mb-2.5 gap-1.5">
              <span className="text-xs text-white/90 font-extrabold uppercase tracking-[0.18em]">
                {universityName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#060f24] font-black bg-[#f9c53c] rounded-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#060f24] animate-pulse" />
                {badgeText}
              </span>
            </div>

            <h1 className="mb-1.5 font-black text-white tracking-tight">
              <span className="block text-3xl text-white leading-[1.12]">
                {titleLine1}
              </span>
              {titleLine2 && (
                <span className="block mt-0.5 pb-1 text-3xl text-transparent leading-[1.18] bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400">
                  {titleLine2}
                </span>
              )}
            </h1>

            {motto && (
              <p className="mb-2 text-xs text-[#f9c53c] font-bold">
                {motto}
              </p>
            )}

            <p className="max-w-lg mb-3.5 text-xs text-slate-200 leading-relaxed font-light drop-shadow-sm">
              {description}
            </p>

            {/* Mobile Meta Pills */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center px-3 py-1.5 text-white text-xs font-semibold bg-black/40 rounded-lg border border-white/20 backdrop-blur-md gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-[#f9c53c] shrink-0" />
                <span>{pills.date || '8 Jan 2026 • 4:30 PM'}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 text-white text-xs font-semibold bg-black/40 rounded-lg border border-white/20 backdrop-blur-md gap-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#f9c53c] shrink-0" />
                <span>{pills.venue ? pills.venue.split(',')[0] : 'Ganpat Vidyanagar'}</span>
              </div>
              <div className="flex items-center px-3 py-1.5 text-white text-xs font-semibold bg-black/40 rounded-lg border border-white/20 backdrop-blur-md gap-1.5 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-[#f9c53c] shrink-0" />
                <span>{pills.classSize ? pills.classSize.split('•')[1] || pills.classSize : '4,250+ Awardees'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
