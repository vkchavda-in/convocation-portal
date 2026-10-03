'use client';

/**
 * ArcRailVisual — Arc-rail circle with upright orbiting photos.
 *
 * ROTATION ARCHITECTURE
 * ─────────────────────
 * Layer 1 (SVG 1 — static / crystal): circle background + facets + rings.
 *   Crystal optionally rotates via CSS keyframe (CMS-controlled).
 *
 * Layer 2 (SVG 2 — RAF-driven): the photo arc.
 *   Two synchronized operations per RAF frame:
 *
 *   (a) Arc SVG gets CSS  transform = rotate(+θ, 50%, 50%)
 *       → the sector clip windows orbit around the circle centre.
 *
 *   (b) Each <image> gets SVG transform = rotate(−θ, xMid, yMid)
 *       where (xMid, yMid) is the sector's centre in SVG coordinates.
 *       → by the Ferris-wheel identity:
 *
 *         R(+θ, O) ∘ rotate_svg(−θ, xMid, yMid)
 *
 *       applied to image pixel (x, y) yields screen position:
 *         (sector_x_screen, sector_y_screen + (y − yMid))
 *
 *       i.e., the pixel stays upright at a fixed offset from the
 *       ORBITING sector centre.  Face stays face-up throughout the orbit.
 *
 * Layer 3 (SVG 3 — static): gravity-pull white-fade overlay.
 *
 * Hydration: all SVG geometry coords are pre-rounded (r2) so SSR and CSR
 * produce identical attribute strings.  RAF mutations happen client-only.
 */

import { useEffect, useRef, useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toRad = (d: number) => (d * Math.PI) / 180;

/** Pre-round to 2 dp → prevents hydration mismatches */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** SVG annulus sector path string */
const sec = (cx: number, cy: number, ri: number, ro: number, a1d: number, a2d: number) => {
  const [a1, a2] = [toRad(a1d), toRad(a2d)];
  const lg = Math.abs(a2d - a1d) > 180 ? 1 : 0;
  const p = (n: number) => r2(n).toFixed(2);
  const [c1, s1] = [Math.cos(a1), Math.sin(a1)];
  const [c2, s2] = [Math.cos(a2), Math.sin(a2)];
  return [
    `M ${p(cx + ri * c1)} ${p(cy + ri * s1)}`,
    `A ${ri} ${ri} 0 ${lg} 1 ${p(cx + ri * c2)} ${p(cy + ri * s2)}`,
    `L ${p(cx + ro * c2)} ${p(cy + ro * s2)}`,
    `A ${ro} ${ro} 0 ${lg} 0 ${p(cx + ro * c1)} ${p(cy + ro * s1)}`,
    'Z',
  ].join(' ');
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ArcRailVisualProps {
  images: string[];
  /** CMS-controlled: whether inner crystal slowly rotates. Default true. */
  rotateInner?: boolean;
  className?: string;
  /** Unique suffix to avoid SVG id collisions when multiple instances exist */
  uid?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CX = 300, CY = 300;
const R  = 284;          // full circle outer radius
const rXtal = 172;       // crystal zone
const rIn   = 180;       // photo strip inner edge
const rOut  = 279;       // photo strip outer edge
const N        = 6;
const arcSpan  = 156;    // crescent arc span (° total)
const arcStart = -78;    // topmost sector angle
const secSpan  = arcSpan / N;    // 26 ° per slot
const secGap   = 2.5;            // inter-sector gap (°)
const secFill  = secSpan - secGap; // ≈ 23.5 ° of actual image
const rMid     = (rIn + rOut) / 2; // ≈ 229.5
const imgSz    = 290;             // image canvas side (px in SVG units)
const ARC_DURATION_MS = 44_000;  // ms per revolution

/** Gravity-pull opacity: edges 40 %, centre 100 % */
const GRAV_OP = [0.40, 0.70, 1.0, 1.0, 0.70, 0.40];

// ── Component ─────────────────────────────────────────────────────────────────

export function ArcRailVisual({
  images,
  rotateInner = true,
  className = '',
  uid = 'arc',
}: ArcRailVisualProps) {

  // Always exactly 6 images (cycle if fewer supplied)
  const track: string[] = [];
  while (track.length < 6) track.push(...images);
  track.splice(6);

  // ── Crystal facets ────────────────────────────────────────────────────────
  const ptAt = (r: number, aDeg: number) => {
    const rad = ((aDeg - 90) * Math.PI) / 180;
    return { x: r2(CX + r * Math.cos(rad)), y: r2(CY + r * Math.sin(rad)) };
  };
  const pts = (p: { x: number; y: number }) => `${p.x},${p.y}`;

  const facets = useMemo(() => {
    const f: { points: string; fill: string; op: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const a1 = i * 30, a2 = (i + 1) * 30;
      const pA1 = ptAt(55, a1), pA2 = ptAt(55, a2);
      const pB1 = ptAt(112, a1), pB2 = ptAt(112, a2);
      const pC1 = ptAt(168, a1), pC2 = ptAt(168, a2);
      const fi = i % 3;
      const fills = [`url(#${uid}-tg1)`, `url(#${uid}-tg2)`, `url(#${uid}-tg3)`];
      f.push({ points: `${CX},${CY} ${pts(pA1)} ${pts(pA2)}`,              fill: fills[fi],       op: r2(0.82 + (i % 3) * 0.05) });
      f.push({ points: `${pts(pA1)} ${pts(pA2)} ${pts(pB2)} ${pts(pB1)}`,  fill: fills[(fi+1)%3], op: r2(0.62 + (i % 4) * 0.08) });
      f.push({ points: `${pts(pB1)} ${pts(pB2)} ${pts(pC2)} ${pts(pC1)}`,  fill: fills[(fi+2)%3], op: r2(0.46 + (i % 3) * 0.12) });
    }
    return f;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // ── Sector geometry (stable — pure constants, no image dependency) ─────────
  const sectorGeo = useMemo(() =>
    Array.from({ length: N }, (_, i) => {
      const a1   = arcStart + i * secSpan;
      const a2   = a1 + secFill;
      const aMid = a1 + secFill / 2;
      const xMid = r2(CX + rMid * Math.cos(toRad(aMid)));
      const yMid = r2(CY + rMid * Math.sin(toRad(aMid)));
      return {
        a1, a2,
        xMid, yMid,
        xImg: r2(xMid - imgSz / 2),
        // Face is in the upper 28 % of portrait photos.
        // Position image so that 28 % mark aligns with the sector centre.
        yImg: r2(yMid - imgSz * 0.28),
        sz: imgSz,
        opacity: GRAV_OP[i] ?? 1,
        clipPath: `url(#${uid}-sec-${i})`,
      };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [uid]);

  // ── RAF animation refs ────────────────────────────────────────────────────
  const arcSvgRef = useRef<SVGSVGElement>(null);
  const imgRefs   = useRef<(SVGImageElement | null)[]>(Array(N).fill(null));
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;

    const tick = (ts: number) => {
      if (startTime === null) startTime = ts;
      const angle = ((ts - startTime) / ARC_DURATION_MS) * 360; // unbounded, increases forever

      // (a) Rotate the arc SVG in CSS space
      if (arcSvgRef.current) {
        arcSvgRef.current.style.transform = `rotate(${angle % 360}deg)`;
      }

      // (b) Counter-rotate each image in SVG space around its sector centre.
      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        const { xMid, yMid } = sectorGeo[i];
        el.setAttribute(
          'transform',
          `rotate(${(-(angle % 360)).toFixed(3)},${xMid.toFixed(2)},${yMid.toFixed(2)})`,
        );
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [sectorGeo]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Self-contained CSS for the inner crystal spinning animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes crystalSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-crystal-spin {
          animation: crystalSpin 38s linear infinite;
          transform-origin: 300px 300px;
        }
      `}} />

      {/* Ambient glow */}
      <div className="absolute inset-[-6%] rounded-full bg-[var(--royal-blue)]/4   blur-[68px] pointer-events-none" />
      <div className="absolute inset-[8%]  rounded-full bg-[var(--champagne-gold)]/3 blur-[38px] pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════════════
          SVG 1 — Crystal + circle base (static, or crystal rotates alone)
      ═══════════════════════════════════════════════════════════════════ */}
      <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }} aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-tg1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--royal-blue)"   stopOpacity="0.40" />
            <stop offset="100%" stopColor="var(--midnight-navy)" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id={`${uid}-tg2`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="var(--champagne-gold)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--royal-blue)"     stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={`${uid}-tg3`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--royal-blue)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="var(--warm-white)" stopOpacity="0.03" />
          </linearGradient>
          <radialGradient id={`${uid}-bg`} cx="42%" cy="38%" r="60%">
            <stop offset="0%"   stopColor="var(--warm-white)" stopOpacity="1"    />
            <stop offset="72%"  stopColor="var(--background)" stopOpacity="0.80" />
            <stop offset="100%" stopColor="var(--royal-blue)" stopOpacity="0.07" />
          </radialGradient>
          <clipPath id={`${uid}-xclip`}>
            <circle cx={CX} cy={CY} r={rXtal} />
          </clipPath>
        </defs>

        {/* Circle base */}
        <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}-bg)`} />

        {/* Crystal facets — animated via CSS classes */}
        <g clipPath={`url(#${uid}-xclip)`}>
          <g className={rotateInner ? 'animate-crystal-spin' : ''}>
            {facets.map((f, i) => (
              <polygon key={i} points={f.points} fill={f.fill} opacity={f.op}
                stroke="var(--champagne-gold)" strokeOpacity="0.13" strokeWidth="0.5" />
            ))}
          </g>
          <circle cx={CX - 30} cy={CY - 38} r="50" fill="white" opacity="0.17" />
        </g>

        {/* White separator ring */}
        <circle cx={CX} cy={CY} r={rIn - 4} fill="none" stroke="white" strokeWidth="11" />
        <circle cx={CX} cy={CY} r={rIn - 4} fill="none"
          stroke="var(--champagne-gold)" strokeOpacity="0.22" strokeWidth="1" />

        {/* Outer border rings */}
        <circle cx={CX} cy={CY} r={R - 1} fill="none" stroke="white" strokeWidth="5" />
        <circle cx={CX} cy={CY} r={R + 1} fill="none"
          stroke="var(--border)" strokeOpacity="0.20" strokeWidth="1" />
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════
          SVG 2 — Arc layer (RAF-controlled rotation + per-image counter-rotation)
      ═══════════════════════════════════════════════════════════════════ */}
      <svg
        ref={arcSvgRef}
        viewBox="0 0 600 600"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible', transformOrigin: '50% 50%' }}
        aria-hidden="true"
      >
        <defs>
          {/* Greyscale filter */}
          <filter id={`${uid}-gs`} x="-5%" y="-5%" width="110%" height="110%">
            <feColorMatrix type="saturate" values="0" />
          </filter>

          {/* Sector clip paths — orbit with the SVG rotation */}
          {sectorGeo.map((s, i) => (
            <clipPath key={i} id={`${uid}-sec-${i}`} clipPathUnits="userSpaceOnUse">
              <path d={sec(CX, CY, rIn, rOut, s.a1, s.a2)} />
            </clipPath>
          ))}
        </defs>

        {/* Photo sectors */}
        {sectorGeo.map((s, i) => (
          <g key={i} clipPath={s.clipPath} opacity={s.opacity}>
            <image
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref={(el: any) => { imgRefs.current[i] = el; }}
              href={track[i]}
              x={s.xImg}
              y={s.yImg}
              width={s.sz}
              height={s.sz}
              preserveAspectRatio="xMidYMid slice"
              filter={`url(#${uid}-gs)`}
            />
            {/* White dividers between sectors */}
            <path d={sec(CX, CY, rIn, rOut, s.a1, s.a2)}
              fill="none" stroke="white" strokeWidth="3.5" />
          </g>
        ))}
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════
          SVG 3 — Gravity-pull overlay (static, always on top)
      ═══════════════════════════════════════════════════════════════════ */}
      <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }} aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-grav`} cx="88%" cy="50%" r="52%">
            <stop offset="0%"   stopColor="white" stopOpacity="0"    />
            <stop offset="65%"  stopColor="white" stopOpacity="0"    />
            <stop offset="100%" stopColor="white" stopOpacity="0.72" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}-grav)`} />
      </svg>
    </div>
  );
}
