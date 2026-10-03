"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';

interface GuestItem {
  category?: string;
  name: string;
  role: string;
  description?: string;
  organization?: string;
  image: string;
  url?: string;
  socials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface GuestsModuleProps {
  id?: string;
  data: {
    title?: string;
    category?: string;
    subtitle?: string;
    items?: GuestItem[];
  };
}

export default function GuestsModule({ id, data }: GuestsModuleProps) {
  const { title, category, subtitle, items = [] } = data || {};

  if (items.length === 0) return null;

  return (
    <section
      id={id}
      className="relative py-20 md:py-28 overflow-hidden select-none bg-white"
    >
      {/* Subtle background ambient gradient glows */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(21,86,178,0.03) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(249,197,60,0.04) 0%, transparent 70%)' }}
      />

      <div className="section-container relative z-10">

        {/* Section Header */}
        {(title || subtitle) && (
          <FadeIn className="text-center mb-16 md:mb-20">
            {category && (
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border mb-4 shadow-sm"
                style={{
                  background: 'rgba(249, 197, 60, 0.15)',
                  color: '#8C6514',
                  borderColor: 'rgba(249, 197, 60, 0.35)',
                }}
              >
                <Star size={10} className="fill-current" />
                {category}
              </span>
            )}
            {title && (
              <h2
                className="text-3xl md:text-5xl font-bold font-serif tracking-tight max-w-3xl mx-auto leading-tight"
                style={{ color: 'var(--midnight-navy, #06152B)' }}
              >
                {title}
              </h2>
            )}
            {/* Elegant golden gradient accent divider */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div
                className="w-12 h-px"
                style={{ background: 'linear-gradient(to right, transparent, #f9c53c)' }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#f9c53c' }}
              />
              <div
                className="w-12 h-px"
                style={{ background: 'linear-gradient(to left, transparent, #f9c53c)' }}
              />
            </div>
            {subtitle && (
              <p
                className="text-sm md:text-base mt-5 max-w-2xl mx-auto leading-relaxed"
                style={{ color: '#64748B' }}
              >
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}

        {/* Dignitaries Static Grid — 3 Column Fixed Laser-Straight Layout (NO MARQUEE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-start max-w-6xl mx-auto">
          {items.map((item, idx) => (
            <FadeIn
              key={idx}
              delay={idx * 120}
              className="group flex flex-col items-center text-center cursor-default w-full"
            >
              {/* Floating Cutout Portrait with strict fixed height and bottom anchoring */}
              <div className="relative w-full h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px] flex items-end justify-center overflow-visible">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(6,21,43,0.12)] group-hover:scale-[1.03] group-hover:drop-shadow-[0_20px_35px_rgba(6,21,43,0.18)] transition-all duration-500 ease-out select-none"
                  />
                )}
              </div>

              {/* Blue accent indicator bar — exact same Y line */}
              <div className="w-12 h-1 bg-[var(--royal-blue,#1556B2)] rounded-full mt-6 mb-4 group-hover:w-20 transition-all duration-300" />

              {/* Category / Dignitary Title — exact same Y line */}
              <div className="h-5 flex items-center justify-center mb-1">
                {item.category && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--royal-blue,#1556B2)]">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Name — exact same Y line */}
              <div className="min-h-[28px] flex items-center justify-center mb-1">
                <h3 className="font-sans font-black text-base sm:text-lg uppercase tracking-wider text-[#06152B] leading-tight">
                  {item.name}
                </h3>
              </div>

              {/* Role / Designation — exact same Y block */}
              <div className="h-10 flex items-center justify-center mb-1 max-w-xs px-2">
                {item.role && (
                  <p className="text-xs sm:text-sm font-semibold text-[#475569] leading-snug">
                    {item.role}
                  </p>
                )}
              </div>

              {/* Organization / Description — exact same Y block */}
              <div className="h-10 flex items-start justify-center max-w-xs px-2">
                {(item.organization || item.description) && (
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.organization || item.description}
                  </p>
                )}
              </div>

              {/* CTA Link — exact same Y line */}
              <div className="h-8 flex items-center justify-center mt-2">
                {item.url && item.url !== '#' ? (
                  <Link
                    href={item.url}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--royal-blue,#1556B2)] hover:text-[#8C6514] transition-colors"
                  >
                    <span>Read Profile</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
