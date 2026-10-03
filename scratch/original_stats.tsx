"use client";

import React from 'react';
import FadeIn from '@/components/shared/FadeIn';

interface AwardeesStatsModuleProps {
  id?: string;
  data?: {
    bgImage?: string;
    title?: string;
    subtitle?: string;
  };
}

export default function AwardeesStatsModule({ id, data }: AwardeesStatsModuleProps) {
  const bgImage = data?.bgImage || '/uploads/gallery-6.jpg';

  return (
    <section 
      id={id} 
      className="relative py-16 md:py-20 text-white overflow-hidden bg-cover bg-center select-none"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Dark Navy Overlay */}
      <div className="absolute inset-0 bg-[#001A3a]/90 backdrop-blur-[1px] pointer-events-none" />

      <div className="section-container relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
        {(data?.title || data?.subtitle) && (
          <div className="text-center mb-10">
            {data.subtitle && (
              <p className="text-[var(--secondary)] uppercase text-xs md:text-sm font-bold tracking-widest mb-2">
                {data.subtitle}
              </p>
            )}
            {data.title && (
              <h2 className="text-2xl md:text-4xl font-bold font-serif uppercase tracking-wider text-white">
                {data.title}
              </h2>
            )}
          </div>
        )}

        <div className="flex flex-col">
          {/* ─── ROW 1: TOTAL AWARDEES ─── */}
          <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/20 gap-6 md:gap-12">
            <div className="flex items-center gap-4 min-w-[280px]">
              <div className="text-4xl md:text-6xl font-bold tracking-tight text-white border-b-[3px] border-[var(--secondary)] pb-1 leading-none">
                4729
              </div>
              <div className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/95 leading-tight font-sans">
                TOTAL AWARDEES
              </div>
            </div>
            <div className="flex flex-row gap-12 items-center">
              <div className="flex items-center gap-3">
                <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none">
                  3527
                </div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                  MALE
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none">
                  1202
                </div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                  FEMALE
                </div>
              </div>
            </div>
          </div>

          {/* ─── ROW 2: GOLD MEDAL AWARDEES ─── */}
          <div className="flex flex-col md:flex-row md:items-center py-6 border-b border-white/20 gap-6 md:gap-12">
            <div className="flex items-center gap-4 min-w-[280px]">
              <div className="text-4xl md:text-6xl font-bold tracking-tight text-white border-b-[3px] border-[var(--secondary)] pb-1 leading-none">
                101
              </div>
              <div className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/95 leading-tight font-sans">
                GOLD MEDAL AWARDEES
              </div>
            </div>
            <div className="flex flex-row gap-12 items-center">
              <div className="flex items-center gap-3">
                <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none">
                  49
                </div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                  MALE
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none">
                  52
                </div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                  FEMALE
                </div>
              </div>
            </div>
          </div>

          {/* ─── ROW 3: CATEGORY LEVELS ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 py-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                32
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                RESEARCH
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                889
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                POST GRADUATE
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                20
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                PG DIPLOMA
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                2277
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                UNDER GRADUATE
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                1511
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 font-sans">
                DIPLOMA
              </div>
            </div>
          </div>

          {/* ─── ROW 4: DEPARTMENTS GROUP 1 ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                2633
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                ENGG. & TECHNOLOGY
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                125
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                PHARMACY
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                995
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                COMPUTER APPLICATIONS
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                477
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                MANAGEMENT STUDIES
              </div>
            </div>
          </div>

          {/* ─── ROW 5: DEPARTMENTS GROUP 2 ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                22
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                ARCHITECTURE DESIGN & PLANNING
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                60
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                SOCIAL SCIENCE & HUMANITIES
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                355
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                SCIENCE
              </div>
            </div>
          </div>

          {/* ─── ROW 6: DEPARTMENTS GROUP 3 ─── */}
          <div className="py-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-bold text-white border-b-[2px] border-[var(--secondary)] pb-0.5 leading-none shrink-0">
                62
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/85 font-sans leading-tight">
                AGRICULTURE, ALLIED SCIENCES AND TECHNOLOGY
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
