import React from 'react';
import dynamic from 'next/dynamic';

// ─── Section Skeleton ────────────────────────────────────────────────────────
// Shown while a dynamic module's JS chunk is downloading on slow connections.
// Pure CSS shimmer — zero JS cost. Prevents blank white flashes on mobile.
function SectionSkeleton() {
  return (
    <div className="w-full py-16 px-6" aria-hidden="true">
      <div className="section-container">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-3 bg-slate-200/80 rounded w-1/4" />
          <div className="h-8 bg-slate-200/80 rounded w-3/4" />
          <div className="h-4 bg-slate-200/60 rounded w-full" />
          <div className="h-4 bg-slate-200/60 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

// ALL modules use ssr:true — renders full HTML on the server immediately.
// Without ssr:true, dynamic() = blank white until JS chunk downloads (7-8s on mobile).
// ssr:true + dynamic = code-split chunks + instant SSR HTML. Best of both worlds.
const HeroModule = dynamic(() => import('@/components/modules/HeroModule'), { ssr: true });
const HeroInfoModule = dynamic(() => import('@/components/modules/HeroInfoModule'), { ssr: true, loading: SectionSkeleton });
const GuestsModule = dynamic(() => import('@/components/modules/GuestsModule'), { ssr: true, loading: SectionSkeleton });
const MetricsModule = dynamic(() => import('@/components/modules/MetricsModule'), { ssr: true, loading: SectionSkeleton });
const NarrativeModule = dynamic(() => import('@/components/modules/NarrativeModule'), { ssr: true, loading: SectionSkeleton });
const CardGridModule = dynamic(() => import('@/components/modules/CardGridModule'), { ssr: true, loading: SectionSkeleton });
const TimelineModule = dynamic(() => import('@/components/modules/TimelineModule'), { ssr: true, loading: SectionSkeleton });
const GalleryModule = dynamic(() => import('@/components/modules/GalleryModule'), { ssr: true, loading: SectionSkeleton });
const MediaModule = dynamic(() => import('@/components/modules/MediaModule'), { ssr: true, loading: SectionSkeleton });
const ContactModule = dynamic(() => import('@/components/modules/ContactModule'), { ssr: true, loading: SectionSkeleton });
const QuoteModule = dynamic(() => import('@/components/modules/QuoteModule'), { ssr: true, loading: SectionSkeleton });
const KnowledgeGraphModule = dynamic(() => import('@/components/modules/KnowledgeGraphModule'), { ssr: true, loading: SectionSkeleton });
const NarrativeDividerModule = dynamic(() => import('@/components/modules/NarrativeDividerModule'), { ssr: true, loading: SectionSkeleton });
const PressModule = dynamic(() => import('@/components/modules/PressModule'), { ssr: true, loading: SectionSkeleton });
const MeetingsModule = dynamic(() => import('@/components/modules/MeetingsModule'), { ssr: true, loading: SectionSkeleton });
const ResearchTabsModule = dynamic(() => import('@/components/modules/ResearchTabsModule'), { ssr: true, loading: SectionSkeleton });
const CustomModule = dynamic(() => import('@/components/modules/CustomModule'), { ssr: true, loading: SectionSkeleton });
const AwardeesStatsModule = dynamic(() => import('@/components/modules/AwardeesStatsModule'), { ssr: true, loading: SectionSkeleton });

export const SECTION_REGISTRY: Record<string, React.ComponentType<any>> = {
  hero: HeroModule,
  hero_info: HeroInfoModule,
  guests: GuestsModule,
  metrics: MetricsModule,
  narrative: NarrativeModule,
  card_grid: CardGridModule,
  timeline: TimelineModule,
  gallery: GalleryModule,
  media: MediaModule,
  contact: ContactModule,
  quote: QuoteModule,
  knowledge_graph: KnowledgeGraphModule,
  narrative_divider: NarrativeDividerModule, // legacy DB records
  chapter: NarrativeDividerModule,           // new canonical name
  press: PressModule,
  meetings: MeetingsModule,
  research_tabs: ResearchTabsModule,
  custom: CustomModule,
  awardees_stats: AwardeesStatsModule,
};

export function getSectionComponent(type: string): React.ComponentType<any> | null {
  return SECTION_REGISTRY[type] || null;
}
