import { ChapterBlockData } from '@/types/cms';
import OptimizedImage from '@/components/shared/OptimizedImage';
import FadeIn from '@/components/shared/FadeIn';

interface ChapterModuleProps {
  id?: string;
  data: ChapterBlockData;
}

export default function NarrativeDividerModule({ id, data }: ChapterModuleProps) {
  const headline      = data.headline      || '';
  const subheadline   = data.subheadline   || '';
  const description   = data.description   || '';
  const sectionLabel  = data.sectionLabel  || '';
  const callout       = data.callout       || '';
  const layoutVariant = data.layoutVariant || 'layered-story';
  const rawImages     = data.images?.length ? data.images : ['/assets/images/portrait.png'];

  // ── Shared text column ─────────────────────────────────────────────────────
  const TextBlock = ({ align = 'left' }: { align?: 'left' | 'center' }) => (
    <FadeIn
      variant="up"
      delay={100}
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} gap-3`}
    >
      {sectionLabel && (
        <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.28em] text-[#8C6514]">
          {sectionLabel}
        </span>
      )}
      <h2 className="font-serif font-bold text-[var(--foreground)] text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight">
        {headline}
      </h2>
      {subheadline && (
        <p className="font-serif font-medium text-[var(--primary)] text-sm sm:text-base leading-relaxed max-w-[480px]">
          {subheadline}
        </p>
      )}
      {description && (
        <p className="font-sans text-[var(--muted-foreground)] text-xs sm:text-sm leading-relaxed max-w-[440px]">
          {description}
        </p>
      )}
      {callout && (
        <div className="mt-2 border-l-2 border-[#f9c53c] pl-4">
          <span className="font-serif italic text-sm text-[var(--foreground)]/70">{callout}</span>
        </div>
      )}
    </FadeIn>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYOUT 1: Layered Story — diagonal overlapping image strips + text
  // ══════════════════════════════════════════════════════════════════════════
  const renderLayeredStory = () => {
    const imgs = [...rawImages];
    while (imgs.length < 3) imgs.push(rawImages[0]);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-0 min-h-[480px] lg:min-h-[520px]">
        {/* Image side — three slanted strips */}
        <div className="col-span-1 lg:col-span-6 relative h-[340px] sm:h-[420px] lg:h-[520px] overflow-hidden">
          {/* Strip 1 — leftmost, rotated */}
          <FadeIn variant="up" delay={0}
            className="absolute top-0 left-0 w-[36%] h-full overflow-hidden"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'bottom left' }}>
            <OptimizedImage src={imgs[0]} alt="" className="w-full h-full object-cover object-top scale-110 grayscale"
              style={{ transform: 'skewX(4deg) scale(1.14)', transformOrigin: 'center' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--royal-blue)]/20 to-transparent" />
          </FadeIn>

          {/* Strip 2 — centre, baseline */}
          <FadeIn variant="up" delay={100}
            className="absolute top-0 left-[32%] w-[38%] h-full overflow-hidden"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'bottom left' }}>
            <OptimizedImage src={imgs[1]} alt="" className="w-full h-full object-cover object-top grayscale"
              style={{ transform: 'skewX(4deg) scale(1.08)', transformOrigin: 'center' }} />
          </FadeIn>

          {/* Strip 3 — rightmost, rotated opposite */}
          <FadeIn variant="up" delay={200}
            className="absolute top-0 left-[64%] w-[40%] h-full overflow-hidden"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'bottom left' }}>
            <OptimizedImage src={imgs[2]} alt="" className="w-full h-full object-cover object-top scale-110 grayscale"
              style={{ transform: 'skewX(4deg) scale(1.14)', transformOrigin: 'center' }} />
            <div className="absolute inset-0 bg-gradient-to-l from-[#f9c53c]/10 to-transparent" />
          </FadeIn>

          {/* Gold line accents */}
          <div className="absolute top-0 left-[31%] w-[2px] h-full bg-white/80 z-10" />
          <div className="absolute top-0 left-[63%] w-[2px] h-full bg-white/80 z-10" />
        </div>

        {/* Text side */}
        <div className="col-span-1 lg:col-span-6 px-8 lg:pl-16 lg:pr-12 py-10 lg:py-0 flex items-center">
          <TextBlock align="left" />
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYOUT 2: Fragmented Timeline — diamond-clipped shards row
  // ══════════════════════════════════════════════════════════════════════════
  const renderFragmentedTimeline = () => {
    const imgs = [...rawImages];
    while (imgs.length < 5) imgs.push(rawImages[imgs.length % rawImages.length] || rawImages[0]);
    imgs.splice(5);
    return (
      <div className="flex flex-col items-center gap-10 px-6 lg:px-16 py-14">
        {/* Shard row */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
          {imgs.map((imgUrl, i) => {
            const heights = ['h-[160px]','h-[200px]','h-[240px]','h-[200px]','h-[160px]'];
            const widths  = ['w-[100px]','w-[120px]','w-[140px]','w-[120px]','w-[100px]'];
            return (
              <FadeIn key={i} variant="up" delay={i * 70}
                className={`relative ${widths[i]} ${heights[i]} overflow-hidden flex-shrink-0`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <OptimizedImage src={imgUrl} alt="" className="w-full h-full object-cover object-top grayscale" />
                <div className="absolute inset-0 border border-[#f9c53c]/40"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                {/* Shard number */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="text-[8px] font-sans font-bold text-white/70 tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </FadeIn>
            );
          })}
        </div>
        {/* Gold connector line */}
        <FadeIn variant="up" delay={350}
          className="w-[1px] h-8 bg-gradient-to-b from-[#f9c53c] to-transparent" />
        {/* Text */}
        <TextBlock align="center" />
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYOUT 3: Leadership Mosaic — asymmetric image grid + text
  // ══════════════════════════════════════════════════════════════════════════
  const renderLeadershipMosaic = () => {
    const imgs = [...rawImages];
    while (imgs.length < 3) imgs.push(rawImages[0]);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-0 min-h-[480px]">
        {/* Mosaic grid */}
        <div className="col-span-1 lg:col-span-6 grid grid-cols-2 grid-rows-2 gap-[3px] h-[360px] sm:h-[440px] lg:h-auto">
          {/* Large main image — spans 2 rows left column */}
          <FadeIn variant="up" delay={0} className="row-span-2 overflow-hidden">
            <OptimizedImage src={imgs[0]} alt="" className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700" />
          </FadeIn>
          {/* Two smaller images right column */}
          <FadeIn variant="up" delay={100} className="overflow-hidden">
            <OptimizedImage src={imgs[1]} alt="" className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700" />
          </FadeIn>
          <FadeIn variant="up" delay={200}
            className="overflow-hidden relative">
            <OptimizedImage src={imgs[2]} alt="" className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700" />
            {/* Gold accent overlay on bottom-right */}
            <div className="absolute bottom-0 right-0 w-3/4 h-[2px] bg-[#f9c53c]" />
            <div className="absolute bottom-0 right-0 w-[2px] h-3/4 bg-[#f9c53c]" />
          </FadeIn>
        </div>

        {/* Text side */}
        <div className="col-span-1 lg:col-span-6 flex items-center px-8 lg:pl-16 lg:pr-12 py-10 lg:py-0
          bg-gradient-to-br from-transparent to-[var(--royal-blue)]/3">
          <TextBlock align="left" />
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYOUT 4: Institutional Pillar — 3 vertical image columns
  // ══════════════════════════════════════════════════════════════════════════
  const renderInstitutionalPillar = () => {
    const imgs = [...rawImages];
    while (imgs.length < 3) imgs.push(rawImages[0]);
    const pillars = [
      { img: imgs[0], label: 'Foundation',  num: '01' },
      { img: imgs[1], label: 'Vision',      num: '02' },
      { img: imgs[2], label: 'Legacy',      num: '03' },
    ];
    return (
      <div className="flex flex-col gap-10 px-6 lg:px-16 py-12">
        {/* Section heading */}
        <FadeIn variant="up" delay={0} className="text-center">
          {sectionLabel && (
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#8C6514] block mb-3">
              {sectionLabel}
            </span>
          )}
          <h2 className="font-serif font-bold text-[var(--foreground)] text-3xl sm:text-4xl leading-tight">
            {headline}
          </h2>
          {subheadline && (
            <p className="font-serif text-[var(--primary)] text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}
        </FadeIn>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)] overflow-hidden">
          {pillars.map((p, i) => (
            <FadeIn key={i} variant="up" delay={i * 100 + 200}
              className="bg-[var(--background)] flex flex-col group">
              {/* Image */}
              <div className="h-[220px] sm:h-[260px] overflow-hidden">
                <OptimizedImage src={p.img} alt={p.label}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
              </div>
              {/* Gold top bar */}
              <div className="h-[2px] bg-gradient-to-r from-[#f9c53c] to-[#f9c53c]/20" />
              {/* Pillar label */}
              <div className="p-5 flex items-start gap-3">
                <span className="font-sans text-[10px] font-bold text-[#8C6514] tracking-widest mt-0.5">{p.num}</span>
                <div>
                  <p className="font-serif font-semibold text-[var(--foreground)] text-base leading-snug">{p.label}</p>
                  {description && i === 1 && (
                    <p className="font-sans text-[var(--muted-foreground)] text-xs mt-1 leading-relaxed">{description}</p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {callout && (
          <FadeIn variant="up" delay={500}
            className="text-center font-serif italic text-sm text-[var(--muted-foreground)] max-w-lg mx-auto">
            &ldquo;{callout}&rdquo;
          </FadeIn>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYOUT 5: Vision Chapter — clean editorial 50/50 split
  // ══════════════════════════════════════════════════════════════════════════
  const renderVisionChapter = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[440px] lg:min-h-[520px]">
      {/* Image half */}
      <FadeIn variant="up" delay={0} className="relative overflow-hidden h-[300px] sm:h-[380px] lg:h-auto">
        <OptimizedImage src={rawImages[0]} alt=""
          className="w-full h-full object-cover object-top grayscale" />
        {/* Dark bottom fade with callout */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight-navy)]/80 via-transparent to-transparent" />
        {callout && (
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <p className="font-serif italic text-white/90 text-sm sm:text-base leading-relaxed max-w-[380px]">
              &ldquo;{callout}&rdquo;
            </p>
          </div>
        )}
        {/* Gold vertical accent line on right edge */}
        <div className="absolute top-[10%] right-0 w-[2px] h-[80%] bg-gradient-to-b from-transparent via-[#f9c53c] to-transparent" />
      </FadeIn>

      {/* Text half */}
      <div className="flex items-center px-8 lg:pl-16 lg:pr-12 py-12 lg:py-0
        bg-gradient-to-br from-[var(--background)] to-[var(--background)]">
        <TextBlock align="left" />
      </div>
    </div>
  );

  // ── Section shell ──────────────────────────────────────────────────────────
  return (
    <section
      id={id}
      className="relative overflow-hidden w-full text-[var(--foreground)] bg-[var(--background)]"
    >
      {/* Subtle radial accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(97,28,36,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,158,76,0.03),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 section-container">
        {layoutVariant === 'layered-story'         && renderLayeredStory()}
        {layoutVariant === 'fragmented-timeline'   && renderFragmentedTimeline()}
        {layoutVariant === 'leadership-mosaic'     && renderLeadershipMosaic()}
        {layoutVariant === 'institutional-pillar'  && renderInstitutionalPillar()}
        {layoutVariant === 'vision-chapter'        && renderVisionChapter()}

        {/* Fallback for unrecognised variants / arc / radial (removed) */}
        {!['layered-story','fragmented-timeline','leadership-mosaic','institutional-pillar','vision-chapter'].includes(layoutVariant ?? '') && (
          <div className="flex flex-col items-center text-center max-w-[720px] mx-auto px-6 py-14">
            {sectionLabel && <span className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#8C6514] mb-4 block">{sectionLabel}</span>}
            <h2 className="font-serif font-bold text-[var(--foreground)] text-4xl leading-tight">{headline}</h2>
            {subheadline && <p className="font-serif text-[var(--primary)] text-sm mt-4 max-w-[540px]">{subheadline}</p>}
            {description && <p className="font-sans text-[var(--muted-foreground)] text-xs mt-3 max-w-[480px] leading-relaxed">{description}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
