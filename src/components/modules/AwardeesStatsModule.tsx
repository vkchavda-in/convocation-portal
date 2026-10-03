"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  GraduationCap,
  Award,
  Star,
  Sparkles,
  Layers,
  BarChart3,
  Trophy,
  Users,
} from 'lucide-react';
import { AwardeesStatsBlockData, StatCategoryItem } from '@/types/cms';

interface AwardeesStatsModuleProps {
  id?: string;
  data?: AwardeesStatsBlockData;
}

// Smooth easing counter component
function Counter({ value, trigger, duration = 1800 }: { value: number; trigger: boolean; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Quartic ease-out for a snappy deceleration at the end
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [trigger, value, duration]);

  return <span>{trigger ? count.toLocaleString() : '0'}</span>;
}

// Default Authentic Convocation Stats
const DEFAULT_DEGREES: StatCategoryItem[] = [
  { label: 'RESEARCH', count: 32, percentage: '0.7%' },
  { label: 'POST GRADUATE', count: 889, percentage: '18.8%' },
  { label: 'PG DIPLOMA', count: 20, percentage: '0.4%' },
  { label: 'UNDER GRADUATE', count: 2277, percentage: '48.1%' },
  { label: 'DIPLOMA', count: 1511, percentage: '32.0%' }
];

const DEFAULT_FACULTIES: StatCategoryItem[] = [
  { label: 'ENGG. & TECHNOLOGY', count: 2633, percentage: '55.7%' },
  { label: 'COMPUTER APPLICATIONS', count: 995, percentage: '21.0%' },
  { label: 'MANAGEMENT STUDIES', count: 477, percentage: '10.1%' },
  { label: 'SCIENCE', count: 355, percentage: '7.5%' },
  { label: 'PHARMACY', count: 125, percentage: '2.6%' },
  { label: 'AGRICULTURE, ALLIED SCIENCES & TECH', count: 62, percentage: '1.3%' },
  { label: 'SOCIAL SCIENCE & HUMANITIES', count: 60, percentage: '1.3%' },
  { label: 'ARCHITECTURE DESIGN & PLANNING', count: 22, percentage: '0.5%' }
];

export default function AwardeesStatsModule({ id, data }: AwardeesStatsModuleProps) {
  const bgImage = data?.bgImage || '/uploads/convocation-metrics-bg.jpg';
  const title = data?.title || data?.headline || '19th Convocation at a Glance';
  const subtitle = data?.subtitle || data?.subheadline || 'Academic highlights and achievements of the graduating batch.';
  const variant = data?.variant || 'balanced-split';

  const totalAwardees = data?.totalAwardees ?? 4729;
  const totalMale = data?.totalMale ?? 3527;
  const totalFemale = data?.totalFemale ?? 1202;

  const goldMedalists = data?.goldMedalists ?? 101;
  const goldMale = data?.goldMale ?? 49;
  const goldFemale = data?.goldFemale ?? 52;

  const degrees = data?.degrees && data.degrees.length > 0 ? data.degrees : DEFAULT_DEGREES;
  const faculties = data?.faculties && data.faculties.length > 0 ? data.faculties : DEFAULT_FACULTIES;

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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalMalePct = Math.round((totalMale / Math.max(totalAwardees, 1)) * 1000) / 10;
  const totalFemalePct = Math.round((totalFemale / Math.max(totalAwardees, 1)) * 1000) / 10;
  const goldMalePct = Math.round((goldMale / Math.max(goldMedalists, 1)) * 1000) / 10;
  const goldFemalePct = Math.round((goldFemale / Math.max(goldMedalists, 1)) * 1000) / 10;

  // Header Component
  const renderHeader = () => (
    <div className="text-center mb-12 md:mb-14">
      {subtitle && (
        <p className="text-[#f9c53c] uppercase text-xs md:text-sm font-bold tracking-widest mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif uppercase tracking-wider text-white drop-shadow-sm">
          {title}
        </h2>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 1: BALANCED SPLIT (Classic Executive 2-Column Balanced)
  // ══════════════════════════════════════════════════════════════════════════
  const renderBalancedSplit = () => (
    <div className="flex flex-col">
      {/* ─── TOP HIGHLIGHTS (2 Balanced Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 mb-8 border-b border-white/20">
        {/* Total Awardees */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 lg:pr-10 lg:border-r lg:border-white/20">
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white border-b-[3px] border-[#f9c53c] pb-1 leading-none shrink-0">
              <Counter value={totalAwardees} trigger={isInView} duration={2000} />
            </div>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white/95 leading-tight font-sans">
              TOTAL AWARDEES
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={totalMale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                MALE
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={totalFemale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                FEMALE
              </div>
            </div>
          </div>
        </div>

        {/* Gold Medal Awardees */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white border-b-[3px] border-[#f9c53c] pb-1 leading-none shrink-0">
              <Counter value={goldMedalists} trigger={isInView} duration={1600} />
            </div>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white/95 leading-tight font-sans">
              GOLD MEDAL AWARDEES
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={goldMale} trigger={isInView} duration={1600} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                MALE
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={goldFemale} trigger={isInView} duration={1600} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                FEMALE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROGRAM LEVELS (5 Columns) ─── */}
      <div className="pb-8 mb-8 border-b border-white/20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {degrees.map((deg, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={deg.count} trigger={isInView} duration={1400 + idx * 100} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/85 font-sans">
                {deg.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FACULTIES (4 Columns) ─── */}
      <div className="pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {faculties.map((fac, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-bold text-white border-b-[2px] border-[#f9c53c] pb-0.5 leading-none shrink-0">
                <Counter value={fac.count} trigger={isInView} duration={1400 + idx * 70} />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                {fac.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 2: GLASS CARDS (Frosted Glassmorphic Cards & Progress Bars)
  // ══════════════════════════════════════════════════════════════════════════
  const renderGlassCards = () => (
    <div className="space-y-8">
      {/* Grand Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Awardees Card */}
        <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-3xl p-6 sm:p-8 hover:border-[#f9c53c]/40 hover:bg-white/[0.1] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f9c53c]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f9c53c]/20 text-[#f9c53c] border border-[#f9c53c]/40">
              <Star size={12} fill="#f9c53c" />
              Class of 2026
            </span>
            <span className="text-xs font-mono text-white/60">Total Graduating Strength</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4 mb-5">
            <span className="text-5xl sm:text-6xl font-bold font-serif tracking-tight text-white drop-shadow">
              <Counter value={totalAwardees} trigger={isInView} duration={2000} />
            </span>
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#f9c53c]">
              Total Awardees
            </span>
          </div>

          {/* Gender Ratio Bar */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Male: <Counter value={totalMale} trigger={isInView} duration={1800} /> ({totalMalePct}%)
              </span>
              <span className="text-pink-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                Female: <Counter value={totalFemale} trigger={isInView} duration={1800} /> ({totalFemalePct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden flex p-0.5 border border-white/10">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${totalMalePct}%` }}
              />
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-1000"
                style={{ width: `${totalFemalePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gold Medals Card */}
        <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-3xl p-6 sm:p-8 hover:border-[#f9c53c]/40 hover:bg-white/[0.1] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Award size={12} />
              Academic Excellence
            </span>
            <span className="text-xs font-mono text-white/60">Top Honor Achievers</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4 mb-5">
            <span className="text-5xl sm:text-6xl font-bold font-serif tracking-tight text-white drop-shadow">
              <Counter value={goldMedalists} trigger={isInView} duration={1600} />
            </span>
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-300">
              Gold Medal Awardees
            </span>
          </div>

          {/* Gender Ratio Bar */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Male: <Counter value={goldMale} trigger={isInView} duration={1600} /> ({goldMalePct}%)
              </span>
              <span className="text-pink-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                Female: <Counter value={goldFemale} trigger={isInView} duration={1600} /> ({goldFemalePct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden flex p-0.5 border border-white/10">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${goldMalePct}%` }}
              />
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-1000"
                style={{ width: `${goldFemalePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Program Levels Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {degrees.map((deg, idx) => (
          <div
            key={idx}
            className="bg-white/[0.05] border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:border-[#f9c53c]/40 hover:bg-white/[0.08] transition-all flex flex-col justify-between"
          >
            {deg.percentage && (
              <span className="text-[10px] font-mono font-bold text-white/50 mb-2">{deg.percentage}</span>
            )}
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif mb-1">
              <Counter value={deg.count} trigger={isInView} duration={1500} />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/80">
              {deg.label}
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Disciplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {faculties.map((fac, idx) => (
          <div
            key={idx}
            className="bg-white/[0.04] border border-white/10 backdrop-blur-sm rounded-2xl p-4 hover:border-[#f9c53c]/40 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-3 group"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-2xl font-bold text-white font-serif group-hover:text-[#f9c53c] transition-colors">
                <Counter value={fac.count} trigger={isInView} duration={1500} />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/80 leading-tight truncate" title={fac.label}>
                {fac.label}
              </div>
            </div>
            {fac.percentage && (
              <span className="text-[10px] font-mono font-bold text-[#f9c53c]/70 shrink-0">{fac.percentage}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 3: EDITORIAL COMPACT (Playfair Display Serif Monument Pillar)
  // ══════════════════════════════════════════════════════════════════════════
  const renderEditorialCompact = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left Monument Pillar (Grand Total & Gold Medals) */}
      <div className="lg:col-span-5 bg-gradient-to-br from-[#061e38]/90 to-[#020b18]/90 border-2 border-[#f9c53c]/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#f9c53c]/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#f9c53c]/20 text-[#f9c53c] border border-[#f9c53c]/40 mb-6">
            <Sparkles size={14} />
            Institutional Milestone
          </div>
          <div className="text-6xl sm:text-7xl font-bold font-serif text-white tracking-tight leading-none mb-3">
            <Counter value={totalAwardees} trigger={isInView} duration={2000} />
          </div>
          <div className="text-base font-extrabold uppercase tracking-widest text-[#f9c53c] mb-6">
            Total Graduating Awardees
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <div>
              <div className="text-2xl font-bold text-cyan-300 font-serif">
                <Counter value={totalMale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Male Scholars ({totalMalePct}%)
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-300 font-serif">
                <Counter value={totalFemale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Female Scholars ({totalFemalePct}%)
              </div>
            </div>
          </div>
        </div>

        {/* Gold Medalist Feature */}
        <div className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold font-serif text-amber-300 leading-none mb-1">
              <Counter value={goldMedalists} trigger={isInView} duration={1600} />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/90">
              Gold Medal Awardees
            </div>
          </div>
          <div className="text-right text-[11px] font-medium text-amber-200/80">
            <div>{goldMale} Male</div>
            <div>{goldFemale} Female</div>
          </div>
        </div>
      </div>

      {/* Right Matrix (Programs + Faculties) */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-6">
        {/* Degree Levels Ribbon */}
        <div className="bg-white/5 border border-white/15 rounded-3xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#f9c53c] mb-4 flex items-center gap-2">
            <Layers size={14} />
            Academic Degree Levels
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {degrees.map((deg, idx) => (
              <div key={idx} className="border-l-2 border-[#f9c53c] pl-3">
                <div className="text-xl sm:text-2xl font-bold font-serif text-white">
                  <Counter value={deg.count} trigger={isInView} duration={1500} />
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/75 leading-tight">
                  {deg.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculties Matrix */}
        <div className="bg-white/5 border border-white/15 rounded-3xl p-6 flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-[#f9c53c] mb-4 flex items-center gap-2">
            <BarChart3 size={14} />
            Faculties & Disciplines
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {faculties.map((fac, idx) => (
              <div key={idx} className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#f9c53c]">0{idx + 1}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/85 truncate max-w-[180px]">
                    {fac.label}
                  </span>
                </div>
                <span className="text-base font-bold font-serif text-white shrink-0">
                  <Counter value={fac.count} trigger={isInView} duration={1500} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 4: MONOLITH COUNTER (Dramatic Full-Width Editorial Infographic)
  // Each stat row is separated by a gold rule — oversized numbers stacked vertically
  // ══════════════════════════════════════════════════════════════════════════
  const renderMonolithCounter = () => (
    <div className="space-y-0">
      {/* Grand Totals — Oversized stacked rows */}
      {[
        { value: totalAwardees, label: 'TOTAL AWARDEES', sub: `${totalMale} Male · ${totalFemale} Female`, duration: 2000 },
        { value: goldMedalists, label: 'GOLD MEDAL AWARDEES', sub: `${goldMale} Male · ${goldFemale} Female`, duration: 1600 },
      ].map((item, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center justify-between py-8 sm:py-10 border-b border-[#f9c53c]/40 gap-3"
        >
          <div
            className="text-[clamp(3.5rem,10vw,7rem)] font-black font-serif tracking-tighter text-white leading-none"
            style={{ WebkitTextStroke: '1px rgba(249,197,60,0.25)' }}
          >
            <Counter value={item.value} trigger={isInView} duration={item.duration} />
          </div>
          <div className="sm:text-right">
            <div className="text-sm sm:text-base font-extrabold uppercase tracking-[0.2em] text-[#f9c53c]">
              {item.label}
            </div>
            <div className="text-xs font-medium text-white/60 mt-1 font-mono">{item.sub}</div>
          </div>
        </div>
      ))}

      {/* Degree Levels rows */}
      <div className="pt-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-6 font-mono">
          — ACADEMIC DEGREE CONFERRALS —
        </div>
        <div className="space-y-0">
          {degrees.map((deg, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-5 border-b border-white/10 last:border-b-0 hover:border-[#f9c53c]/30 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-white/30 w-5">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                  {deg.label}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-2xl sm:text-3xl font-black font-serif text-white group-hover:text-[#f9c53c] transition-colors">
                  <Counter value={deg.count} trigger={isInView} duration={1400 + idx * 100} />
                </span>
                {deg.percentage && (
                  <span className="text-[10px] font-mono text-white/40 hidden sm:block">{deg.percentage}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty rows */}
      <div className="pt-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-6 font-mono">
          — FACULTY & DISCIPLINE BREAKDOWN —
        </div>
        <div className="space-y-0">
          {faculties.map((fac, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-5 border-b border-white/10 last:border-b-0 hover:border-[#f9c53c]/30 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-white/30 w-5">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                  {fac.label}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-2xl sm:text-3xl font-black font-serif text-white group-hover:text-[#f9c53c] transition-colors">
                  <Counter value={fac.count} trigger={isInView} duration={1400 + idx * 70} />
                </span>
                {fac.percentage && (
                  <span className="text-[10px] font-mono text-white/40 hidden sm:block">{fac.percentage}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 5: SPLIT STAT PANELS (Dark Navy Left + Dense Grid Right)
  // ══════════════════════════════════════════════════════════════════════════
  const renderSplitStatPanels = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Left Panel — Dark Navy Hero Numbers */}
      <div className="lg:col-span-4 bg-[#020d1f] border-b lg:border-b-0 lg:border-r border-white/10 p-8 flex flex-col justify-between gap-10">
        {/* Total Awardees Block */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f9c53c]/70 mb-3 font-mono">
            Total Graduating
          </div>
          <div className="text-[clamp(3rem,8vw,5.5rem)] font-black font-serif text-white leading-none tracking-tighter mb-2">
            <Counter value={totalAwardees} trigger={isInView} duration={2000} />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">Awardees</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-xl font-bold font-serif text-cyan-300">
                <Counter value={totalMale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/70">Male</div>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <div className="text-xl font-bold font-serif text-pink-300">
                <Counter value={totalFemale} trigger={isInView} duration={1800} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-pink-400/70">Female</div>
            </div>
          </div>
        </div>

        {/* Gold Medals Block */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/70 mb-3 font-mono">
            Gold Medalists
          </div>
          <div className="text-[clamp(2.5rem,6vw,4.5rem)] font-black font-serif text-amber-300 leading-none tracking-tighter mb-2">
            <Counter value={goldMedalists} trigger={isInView} duration={1600} />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Distinctions</div>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="text-cyan-300">{goldMale} Male</span>
            <span className="text-pink-300">{goldFemale} Female</span>
          </div>
        </div>

        {/* Separator accent line */}
        <div className="h-px bg-gradient-to-r from-[#f9c53c]/60 via-[#f9c53c]/20 to-transparent" />
      </div>

      {/* Right Panel — Dense Stats Grid */}
      <div className="lg:col-span-8 bg-white/[0.03] p-6 sm:p-8 flex flex-col gap-7">
        {/* Degree Levels */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap size={14} className="text-[#f9c53c]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f9c53c]">
              Degree Levels
            </span>
          </div>
          <div className="grid grid-cols-1 gap-0">
            {degrees.map((deg, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 border-b border-white/[0.07] last:border-b-0"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white/75">{deg.label}</span>
                <div className="flex items-center gap-4">
                  {deg.percentage && (
                    <div
                      className="hidden sm:block h-1.5 rounded-full bg-[#f9c53c]/30 overflow-hidden"
                      style={{ width: '60px' }}
                    >
                      <div
                        className="h-full rounded-full bg-[#f9c53c]"
                        style={{ width: deg.percentage }}
                      />
                    </div>
                  )}
                  <span className="text-lg font-black font-serif text-white w-14 text-right">
                    <Counter value={deg.count} trigger={isInView} duration={1400 + idx * 100} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Faculty Disciplines */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={14} className="text-[#f9c53c]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f9c53c]">
              Faculties & Disciplines
            </span>
          </div>
          <div className="grid grid-cols-1 gap-0">
            {faculties.map((fac, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 border-b border-white/[0.07] last:border-b-0"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white/75 max-w-[70%] leading-tight">{fac.label}</span>
                <div className="flex items-center gap-4">
                  {fac.percentage && (
                    <div
                      className="hidden sm:block h-1.5 rounded-full bg-[#f9c53c]/30 overflow-hidden"
                      style={{ width: '60px' }}
                    >
                      <div
                        className="h-full rounded-full bg-[#f9c53c]"
                        style={{ width: fac.percentage }}
                      />
                    </div>
                  )}
                  <span className="text-lg font-black font-serif text-white w-14 text-right">
                    <Counter value={fac.count} trigger={isInView} duration={1400 + idx * 70} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VARIANT 6: CINEMATIC TIMELINE (Horizontal Station Timeline — ISRO/Railway Style)
  // ══════════════════════════════════════════════════════════════════════════
  const renderCinematicTimeline = () => (
    <div className="space-y-12">
      {/* Top Hero Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10 border-b border-[#f9c53c]/30">
        <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-gradient-to-b before:from-[#f9c53c] before:to-[#f9c53c]/20">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#f9c53c]/60 mb-2">Mission Stat 01</div>
          <div className="text-[clamp(2.5rem,7vw,5rem)] font-black font-serif text-white leading-none">
            <Counter value={totalAwardees} trigger={isInView} duration={2000} />
          </div>
          <div className="text-sm font-bold uppercase tracking-widest text-white/70 mt-2">Total Awardees</div>
          <div className="text-xs font-mono text-white/40 mt-1">{totalMale} M · {totalFemale} F</div>
        </div>
        <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-gradient-to-b before:from-amber-400 before:to-amber-400/20">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/60 mb-2">Mission Stat 02</div>
          <div className="text-[clamp(2.5rem,7vw,5rem)] font-black font-serif text-amber-300 leading-none">
            <Counter value={goldMedalists} trigger={isInView} duration={1600} />
          </div>
          <div className="text-sm font-bold uppercase tracking-widest text-white/70 mt-2">Gold Medalists</div>
          <div className="text-xs font-mono text-white/40 mt-1">{goldMale} M · {goldFemale} F</div>
        </div>
      </div>

      {/* Degree Timeline — Horizontal station rail */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Station A</div>
          <div className="flex-1 h-px bg-white/10" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#f9c53c]">
            Degree Programme Stations
          </div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Timeline rail */}
        <div className="relative">
          {/* The rail line */}
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f9c53c]/80 via-[#f9c53c]/40 to-[#f9c53c]/80" />

          {/* Station nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 relative z-10">
            {degrees.map((deg, idx) => (
              <div key={idx} className="flex flex-col items-center text-center pt-0">
                {/* Node dot on rail */}
                <div className="w-3 h-3 rounded-full border-2 border-[#f9c53c] bg-[#041326] mb-4 shadow-[0_0_8px_#f9c53c60]" />
                <div className="text-2xl sm:text-3xl font-black font-serif text-white mb-1">
                  <Counter value={deg.count} trigger={isInView} duration={1400 + idx * 120} />
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/60 leading-tight px-1">
                  {deg.label}
                </div>
                {deg.percentage && (
                  <div className="mt-1.5 text-[9px] font-mono text-[#f9c53c]/60">{deg.percentage}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Timeline — Second station rail */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Station B</div>
          <div className="flex-1 h-px bg-white/10" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#f9c53c]">
            Faculty & Discipline Stations
          </div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Timeline rail */}
        <div className="relative">
          {/* The rail line */}
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-amber-400/80" />

          {/* Station nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 relative z-10">
            {faculties.map((fac, idx) => (
              <div key={idx} className="flex flex-col items-center text-center pt-0">
                {/* Node dot on rail */}
                <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-[#041326] mb-4 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <div className="text-lg sm:text-xl font-black font-serif text-white mb-1">
                  <Counter value={fac.count} trigger={isInView} duration={1400 + idx * 80} />
                </div>
                <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/60 leading-tight px-0.5">
                  {fac.label}
                </div>
                {fac.percentage && (
                  <div className="mt-1.5 text-[9px] font-mono text-amber-400/60">{fac.percentage}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer metadata strip */}
      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><Users size={10} className="text-[#f9c53c]/50" /> {totalAwardees.toLocaleString()} Total</span>
        <span>·</span>
        <span className="flex items-center gap-1.5"><Trophy size={10} className="text-amber-400/50" /> {goldMedalists} Gold Medals</span>
        <span>·</span>
        <span>{degrees.length} Degree Levels · {faculties.length} Faculties</span>
      </div>
    </div>
  );

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative py-16 md:py-24 text-white overflow-hidden bg-cover bg-center select-none"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Edge-to-Edge Subtle Glass Matte Finish Blur with Subtle Blue Overlay */}
      <div className="absolute inset-0 bg-[#041326]/75 md:bg-[#041326]/70 backdrop-blur-[6px] md:backdrop-blur-[8px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e3b]/30 via-transparent to-[#041326]/40 pointer-events-none" />

      <div className="section-container relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {renderHeader()}

        {variant === 'glass-cards' && renderGlassCards()}
        {variant === 'editorial-compact' && renderEditorialCompact()}
        {variant === 'monolith-counter' && renderMonolithCounter()}
        {variant === 'split-stat-panels' && renderSplitStatPanels()}
        {variant === 'cinematic-timeline' && renderCinematicTimeline()}
        {(variant === 'balanced-split' || !['glass-cards', 'editorial-compact', 'monolith-counter', 'split-stat-panels', 'cinematic-timeline'].includes(variant)) && renderBalancedSplit()}
      </div>
    </section>
  );
}
