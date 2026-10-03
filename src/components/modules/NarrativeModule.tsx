"use client";

import Icon from '@/components/shared/Icon';
import { NarrativeBlockData } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';
import FadeIn from '@/components/shared/FadeIn';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/app/components/ui/accordion';

interface NarrativeModuleProps {
  id?: string;
  data: NarrativeBlockData;
}

export default function NarrativeModule({ id, data }: NarrativeModuleProps) {
  const {
    title,
    category,
    categoryIcon,
    body,
    quote,
    sidePanel,
    layout = 'centered',
    imageUrl,
    imageAlt,
    imageBadge
  } = data;

  if (layout === 'centre_intro') {
    return (
      <section id={id} className="cv-auto py-12 md:py-16 bg-[#F6F8FB] overflow-hidden">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <FadeIn variant="left">
              {category && (
                <div className="text-xs font-semibold tracking-widest uppercase mb-3 text-[var(--secondary)]">
                  {category}
                </div>
              )}
              <h2
                className="text-4xl font-bold mb-6 leading-tight text-[#1E293B]"
                style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                {title}
              </h2>
              <div className="text-slate-500 leading-relaxed mb-8 space-y-4 text-sm lg:text-base">
                {body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {sidePanel?.details && sidePanel.details.length > 0 && (
                <div className="flex gap-8 mb-8 flex-wrap justify-start">
                  {sidePanel.details.map((item, idx) => (
                    <div key={idx} className="text-left pr-6">
                      <div className="text-2xl font-bold text-[var(--royal-blue)]">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>

            {/* Right Column - Image with badge */}
            <FadeIn variant="right" delay={150} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <OptimizedImage
                  src={imageUrl || "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=700&h=500&fit=crop&auto=format"}
                  alt={imageAlt || title}
                  className="rounded-2xl w-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ height: '420px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {imageBadge && (
                <FadeIn
                  variant="scale"
                  delay={300}
                  className="absolute bottom-4 left-4 md:-bottom-6 md:-left-6 rounded-xl p-4 md:p-5 shadow-lg bg-[var(--royal-blue)] text-white min-w-[140px] md:min-w-[160px] z-10"
                >
                  <div className="text-xl md:text-2xl font-bold leading-none">{imageBadge.value}</div>
                  <div className="text-[10px] md:text-xs text-blue-200 mt-1 font-medium tracking-wide">{imageBadge.label}</div>
                </FadeIn>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'personal_message') {
    return (
      <section id={id} className="cv-auto py-12 bg-white">
        <div className="section-container">
          <FadeIn className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] rounded-2xl px-6 py-12 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              {categoryIcon && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                  <Icon name={categoryIcon} className="text-[var(--secondary)]" size={28} />
                </div>
              )}

              <h2 className="mb-6" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                lineHeight: '1.2'
              }}>
                {title}
              </h2>

              <div className="space-y-6 text-white/90 leading-relaxed text-sm lg:text-base">
                {body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}

                {quote && (
                  <p className="pt-6 border-t border-white/20">
                    <span className="text-[var(--secondary)]" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                      — {quote.text}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  if (layout === 'principles') {
    return (
      <section id={id} className="cv-auto py-12 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-12">
              {categoryIcon && (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--secondary)] to-[var(--royal-blue)] rounded-full mb-6">
                  <Icon name={categoryIcon} className="text-white" size={32} />
                </div>
              )}

              <h2 className="mb-4 text-[#1E293B]" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
              }}>
                {title}
              </h2>
            </FadeIn>

            <FadeIn
              delay={100}
              className="bg-white rounded-2xl p-6 sm:p-12 border border-slate-100 hover:border-[var(--secondary)]/40 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {body.length > 0 && (
                <p className="mb-6 text-[#1E293B]/80 leading-relaxed text-sm lg:text-base">
                  {body[0]}
                </p>
              )}

              {sidePanel?.items && sidePanel.items.length > 0 && (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {sidePanel.items.map((item, index) => {
                    const [heading, ...descParts] = item.split(':');
                    const desc = descParts.join(':');
                    return (
                      <AccordionItem 
                        key={index} 
                        value={`item-${index}`} 
                        className="border border-slate-200/50 rounded-xl px-5 bg-slate-50/20 hover:bg-slate-50/50 transition-colors"
                      >
                        <AccordionTrigger className="text-[var(--royal-blue)] hover:text-[var(--secondary)] font-bold text-base hover:no-underline py-4 font-sans tracking-wide">
                          {heading}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 leading-relaxed text-sm pb-4 font-sans font-light">
                          {desc.trim()}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'editorial') {
    const role = (data as any).role || sidePanel?.subtitle;
    const organization = (data as any).organization || sidePanel?.title;

    return (
      <section id={id} className="relative py-12 md:py-20 bg-white overflow-hidden select-none">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* LEFT COLUMN — Sticky Floating Cutout Portrait (Identical to Guest Section on Home) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 self-start flex flex-col items-center text-center">
              <FadeIn className="w-full flex flex-col items-center text-center">
                {/* Floating Cutout Portrait Container */}
                <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[440px] flex items-end justify-center overflow-visible">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt || title || 'Dignitary Portrait'}
                      className="h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_16px_32px_rgba(6,21,43,0.15)] select-none"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-400">{(title || '').charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Blue accent indicator bar */}
                <div className="w-12 h-1 bg-[var(--royal-blue,#1556B2)] rounded-full mt-6 mb-4" />

                {/* Category / Dignitary Title (e.g. The Chief Guest) */}
                {category && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--royal-blue,#1556B2)] mb-1">
                    {category}
                  </span>
                )}

                {/* Name — Bold Uppercase */}
                <h1 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wider text-[#06152B] leading-tight mb-2">
                  {title}
                </h1>

                {/* Role / Designation */}
                {role && (
                  <p className="text-xs sm:text-sm font-semibold text-[#475569] leading-snug mb-1 max-w-xs">
                    {role}
                  </p>
                )}

                {/* Organization / Description */}
                {organization && (
                  <p className="text-xs text-[#64748B] leading-relaxed max-w-xs">
                    {organization}
                  </p>
                )}
              </FadeIn>
            </div>

            {/* RIGHT COLUMN — Scrolling Biography / Description (No duplicate badge, name, or title) */}
            <div className="lg:col-span-7">
              <FadeIn delay={100} className="space-y-6 text-[#334155] text-base md:text-lg leading-relaxed font-sans font-normal pt-2">
                {body.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? "text-[#06152B] text-lg md:text-xl font-medium leading-relaxed border-l-4 border-[var(--royal-blue,#1556B2)] pl-4 py-1"
                        : "leading-relaxed"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </FadeIn>
            </div>

          </div>
        </div>
      </section>
    );
  }

  // Fallback / Standard Centered Layout
  return (
    <section id={id} className="cv-auto py-12 bg-[var(--mist)]">
      <div className="section-container">
        <FadeIn className="max-w-3xl mx-auto text-center">
          {categoryIcon && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--gold)] to-[var(--slate-blue)] rounded-full mb-8">
              <Icon name={categoryIcon} className="text-white" size={32} />
            </div>
          )}

          <h2 className="mb-6 text-[var(--ink)]" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
          }}>
            {title}
          </h2>

          <div className="text-[var(--slate-text)] leading-relaxed mb-8 space-y-6 text-sm lg:text-base">
            {body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {quote && (
            <div className="bg-white rounded-2xl p-6 sm:p-12 border border-[var(--fog)] hover:border-[var(--gold)]/40 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <blockquote className="text-[var(--slate-blue)]" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontStyle: 'italic',
                lineHeight: '1.6'
              }}>
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              {quote.author && (
                <cite className="block mt-4 not-italic text-sm text-[var(--ghost)] font-medium">
                  — {quote.author} {quote.citation ? `, ${quote.citation}` : ''}
                </cite>
              )}
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
