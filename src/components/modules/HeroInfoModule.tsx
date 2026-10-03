"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Icon from '@/components/shared/Icon';
import FadeIn from '@/components/shared/FadeIn';

interface HeroInfoModuleProps {
  id?: string;
  data: {
    title?: string;
    tagline?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: { label: string; url: string };
    secondaryCTA?: { label: string; url: string };
    heroStats?: Array<{ value: string; label: string; icon: string }>;
  };
}

export default function HeroInfoModule({ id, data }: HeroInfoModuleProps) {
  const {
    title = "19th Convocation",
    tagline = "Ganpat University",
    subtitle = "January 8, 2026 • 4:30 PM onwards",
    description = "Celebrating the dedication, persistence and academic triumphs of our graduating batch. Welcome awardees, parents, and distinguished guests to the grand ceremony.",
    primaryCTA = { label: "Invitation details", url: "/19th-convocation-3" },
    secondaryCTA = { label: "Logistics & Schedule", url: "/convocation-schedule" },
    heroStats = [
      { value: "8th Jan", label: "Ceremony Date", icon: "Calendar" },
      { value: "4:30 PM", label: "Procession Starts", icon: "Clock" },
      { value: "2026", label: "Graduating Batch", icon: "GraduationCap" }
    ]
  } = data || {};

  return (
    <section
      id={id}
      className="py-16 md:py-20 border-b select-none"
      style={{
        background: 'var(--parchment)',
        borderColor: 'var(--fog)',
      }}
    >
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column — Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">

            {/* Gold category badge */}
            {tagline && (
              <FadeIn>
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border"
                  style={{
                    background: 'var(--gold-pale)',
                    color: 'var(--gold-text)',
                    borderColor: 'rgba(201,168,76,0.35)',
                  }}
                >
                  {tagline}
                </span>
              </FadeIn>
            )}

            {/* Large serif title */}
            {title && (
              <FadeIn delay={80}>
                <h2
                  className="font-bold text-center lg:text-left leading-tight font-serif"
                  style={{
                    color: 'var(--ink)',
                    fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {title}
                </h2>
              </FadeIn>
            )}

            {/* Gold subtitle */}
            {subtitle && (
              <FadeIn delay={150} className="w-full">
                <p
                  className="font-bold text-sm uppercase tracking-[0.15em] text-center lg:text-left"
                  style={{ color: 'var(--gold-text)' }}
                >
                  {subtitle}
                </p>
              </FadeIn>
            )}

            {/* Gold divider */}
            <FadeIn delay={180}>
              <div
                className="w-12 h-0.5 mx-auto lg:mx-0"
                style={{ background: 'linear-gradient(90deg, #e9a800, #f9c53c, #f59e0b)' }}
              />
            </FadeIn>

            {/* Description */}
            {description && (
              <FadeIn delay={220}>
                <p
                  className="text-base leading-relaxed max-w-xl text-center lg:text-left mx-auto lg:mx-0"
                  style={{ color: 'var(--slate-text)' }}
                >
                  {description}
                </p>
              </FadeIn>
            )}

            {/* CTA Row */}
            <FadeIn delay={300} className="w-full flex justify-center lg:justify-start">
              <div className="flex flex-row flex-wrap gap-3.5 justify-center lg:justify-start items-center">
                {primaryCTA && (
                  <Link
                    href={primaryCTA.url}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] shadow-lg shadow-amber-500/25 hover:brightness-105 hover:shadow-xl active:scale-[0.98]"
                  >
                    <span>{primaryCTA.label}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                {secondaryCTA && (
                  <Link
                    href={secondaryCTA.url}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border transition-all bg-white hover:bg-slate-50 border-slate-200 text-[#06152B] shadow-sm"
                  >
                    <span>{secondaryCTA.label}</span>
                  </Link>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right Column — Key Info Cards */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end mt-4 lg:mt-0 w-full">
            {heroStats.length > 0 && (
              <div className="flex flex-col gap-4 w-full max-w-sm lg:max-w-none">
                {heroStats.map((s, idx) => (
                  <FadeIn
                    key={idx}
                    delay={200 + idx * 90}
                    className="bg-white rounded-xl p-5 flex items-center gap-4 border cursor-default transition-all duration-300"
                    style={{
                      borderColor: 'var(--fog)',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(11,37,69,0.08)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.40)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--fog)';
                    }}
                  >
                    {/* Icon box */}
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(11,37,69,0.08)',
                        color: 'var(--navy)',
                      }}
                    >
                      <Icon name={s.icon || 'Star'} size={20} />
                    </div>
                    {/* Text */}
                    <div>
                      <div
                        className="text-2xl font-bold leading-tight"
                        style={{ color: 'var(--ink)' }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-xs font-medium mt-0.5"
                        style={{ color: 'var(--slate-text)' }}
                      >
                        {s.label}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
