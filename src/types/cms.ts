export interface BaseBlock {
  id: string;
  type: string;
  settings?: any;
  hidden?: boolean;
}

export interface LinkData {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface HeroStatItem {
  value: string;
  label: string;
  icon: string;
}

export interface HeroBlockData {
  title: string;
  subtitle: string;
  titleHighlight?: string;
  universityName?: string;
  badgeText?: string;
  description: string;
  tagline?: string;
  taglineIcon?: string; // e.g. "Award"
  primaryCTA?: LinkData;
  secondaryCTA?: LinkData;
  portrait?: {
    imageUrl?: string;
    imageAlt?: string;
    name?: string;
    title?: string;
  };
  isSubpage?: boolean;
  variant?: 'home' | 'subpage-dark' | 'subpage-light';
  bgImage?: string;
  bgImages?: string[];
  subpageHeight?: 'short' | 'medium' | 'full';
  subpageAlign?: 'left' | 'center';
  layoutVariant?: 'editorial' | 'stats-grid' | 'maritime-cinematic' | 'slider' | 'white-hero';
  heroStats?: HeroStatItem[];
  lightBgStyle?: 'grid-dots' | 'minimal' | 'dots' | 'grid' | 'slate-tint';
  lightGradientPos?: 'none' | 'top-left' | 'top-right' | 'both';
  rightImage?: string;
  studentImage?: string;
  infoPills?: {
    date?: string;
    venue?: string;
    classSize?: string;
    chiefGuest?: string;
  };
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: HeroBlockData;
}

export interface MetricItem {
  icon: string; // e.g. "Users", "Building2"
  value: string;
  label: string;
  description: string;
  hidden?: boolean;
}

export interface MetricsBlockData {
  title?: string;
  subtitle?: string;
  items: MetricItem[];
}

export interface MetricsBlock extends BaseBlock {
  type: 'metrics';
  data: MetricsBlockData;
}

export interface DetailItem {
  label: string;
  value: string;
}

export interface NarrativeBlockData {
  title: string;
  category?: string;
  categoryIcon?: string; // e.g. "User"
  body: string[];
  quote?: {
    text: string;
    author?: string;
    citation?: string;
  };
  sidePanel?: {
    title: string;
    subtitle?: string;
    type: 'list' | 'facts' | 'expertise';
    items?: string[];
    details?: DetailItem[];
  };
  layout?: 'editorial' | 'reverse' | 'centered' | 'personal_message' | 'principles' | 'centre_intro';
  imageUrl?: string;
  imageAlt?: string;
  imageBadge?: {
    value: string;
    label: string;
  };
}

export interface NarrativeBlock extends BaseBlock {
  type: 'narrative';
  data: NarrativeBlockData;
}

export interface CardItem {
  icon?: string; // e.g. "GraduationCap"
  title: string;
  description?: string;
  link?: string;
  tags?: string[];
  subtitle?: string;
  year?: string;
  highlights?: string[];
  category?: string;
  status?: string;
  impact?: string;
  rating?: number;
  hidden?: boolean;
}

export interface CardGridBlockData {
  title: string;
  subtitle?: string;
  category?: string;
  categoryIcon?: string; // e.g. "Briefcase"
  cardType?:
    | 'standard'
    | 'pillar'
    | 'initiative'
    | 'award'
    | 'academic'
    | 'testimonial'
    | 'roadmap'
    | 'achievement'
    | 'collaboration_model'
    | 'research_table';
  columns?: 1 | 2 | 3 | 4;
  isDark?: boolean;
  viewAllLink?: LinkData;
  items: CardItem[];
  cardStyle?: 'standard' | 'glass' | 'glow' | 'editorial';
}

export interface CardGridBlock extends BaseBlock {
  type: 'card_grid';
  data: CardGridBlockData;
}

export interface TimelineItem {
  year: number | string;
  icon?: string; // e.g. "Building2"
  title: string;
  institution?: string; // or subtitle
  highlights?: string[];
  impact?: {
    value: string;
    label: string;
    key?: string; // for compatibility
  }[];
  description?: string;
  hidden?: boolean;
}

export interface TimelineBlockData {
  title: string;
  subtitle?: string;
  category?: string;
  categoryIcon?: string;
  style?: 'interactive' | 'vertical';
  items: TimelineItem[];
}

export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  data: TimelineBlockData;
}

export interface QuoteBlockData {
  quote: string;
  author?: string;
  citation?: string;
  image?: string;
  imageUrl?: string;
  portraitUrl?: string;
  signature?: string;
  signaturePath?: string;
  category?: string;
  layout?: 'editorial' | 'simple' | 'split-flat' | 'card-testimonial';
  align?: 'left' | 'center';
  fontStyle?: 'serif' | 'sans';
  showAccents?: boolean;
  imageSize?: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  imagePosition?: 'left' | 'right';
  backgroundTheme?: 'parchment' | 'cream' | 'white' | string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  data: QuoteBlockData;
}

export interface GalleryItem {
  id: number;
  category: string;
  title: string;
  aspect: 'tall' | 'wide' | 'square';
  url?: string;
  imageUrl?: string;
  page?: number;
  description?: string;
  hidden?: boolean;
}

export interface GalleryCategory {
  id: string;
  label: string;
}

export interface GalleryBlockData {
  title: string;
  subtitle?: string;
  categories: GalleryCategory[];
  images: GalleryItem[];
  variant?: 'grid' | 'slider';
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  data: GalleryBlockData;
}

export interface VideoItem {
  title: string;
  event: string;
  duration: string;
  views: string;
  hidden?: boolean;
}

export interface InterviewItem {
  title: string;
  outlet: string;
  date: string;
  type: string;
  hidden?: boolean;
}

export interface NewsItem {
  headline: string;
  source: string;
  date: string;
  hidden?: boolean;
}

export interface ResourceItem {
  title: string;
  type: string;
  size: string;
  hidden?: boolean;
}

export interface MediaBlockData {
  title: string;
  subtitle?: string;
  videos: VideoItem[];
  interviews: InterviewItem[];
  news: NewsItem[];
  resources: ResourceItem[];
}

export interface MediaBlock extends BaseBlock {
  type: 'media';
  data: MediaBlockData;
}

export interface ContactBlockData {
  title: string;
  subtitle?: string;
  categories?: {
    title: string;
    description: string;
    icon: string;
  }[];
  socials?: {
    name: string;
    icon: string;
    url: string;
  }[];
}

export interface ContactBlock extends BaseBlock {
  type: 'contact';
  data: ContactBlockData;
}

export interface GraphNode {
  id: string;
  label: string;
  group: 'people' | 'organizations' | 'centres' | 'initiatives' | 'roles' | 'tags' | 'locations' | 'media' | 'other';
  details?: any;
}

export interface GraphLink {
  source: string;
  target: string;
  value: string;
}

export interface KnowledgeGraphBlockData {
  title: string;
  subtitle?: string;
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface KnowledgeGraphBlock extends BaseBlock {
  type: 'knowledge_graph';
  data: KnowledgeGraphBlockData;
}

export interface ChapterBlockData {
  headline: string;
  subheadline?: string;
  description?: string;
  images: string[];
  sectionLabel?: string;
  callout?: string;
  layoutVariant?:
    | 'layered-story'
    | 'fragmented-timeline'
    | 'leadership-mosaic'
    | 'institutional-pillar'
    | 'vision-chapter';
  visualAnchorType?: string;
  /** Whether the inner crystal rotates (legacy arc-narrative prop, unused) */
  rotateInner?: boolean;
}

/** @deprecated use ChapterBlockData */
export type NarrativeDividerBlockData = ChapterBlockData;

export interface ChapterBlock extends BaseBlock {
  type: 'chapter';
  data: ChapterBlockData;
}

/** @deprecated use ChapterBlock */
export interface NarrativeDividerBlock extends BaseBlock {
  type: 'narrative_divider';
  data: ChapterBlockData;
}

// ── Press Coverage Block ────────────────────────────────────────────────────

export interface PressItem {
  imageUrl: string;
  /** Small italic label above the headline, e.g. "Empowering Futures" */
  category?: string;
  /** Bold main headline, e.g. "The Visionary Leadership" */
  headline?: string;
  /** Subtitle below headline, e.g. "of Dr. Mahendra Sharma at Ganpat University" */
  subheadline?: string;
  /** Publication name badge, e.g. "BW BusinessWorld" */
  publication?: string;
  date?: string;
  url?: string;
  hidden?: boolean;
}

export interface PressBlockData {
  sectionLabel?: string;
  headline?: string;
  subheadline?: string;
  /**
   * marquee           — Two infinite-scroll rows (compact, "As Featured In" feel)
   * features          — 2-col editorial grid with title text above each spread
   * deck              — Browsable card stack one at a time
   * editorial         — Featured large + right thumbnail rail
   * magazine-grid     — Clean column-based grid with golden accent borders
   * newspaper-row     — Large date/publication source in serif with detail description list
   * featured-carousel — focused active card slide-show with faded side cards
   * layered-deck      — 3D stacked deck where cards overlap and rotate
   */
  variant?: 'marquee' | 'features' | 'deck' | 'editorial' | 'magazine-grid' | 'newspaper-row' | 'featured-carousel' | 'layered-deck';
  /** Allow clicking images to open a full-screen zoom/read lightbox. Default: true */
  enableZoom?: boolean;
  items?: PressItem[];
}

export interface PressBlock extends BaseBlock {
  type: 'press';
  data: PressBlockData;
}

// ── VIP Meetings Showcase Block ──────────────────────────────────────────────

export interface MeetingItem {
  title: string;
  dignitary: string;
  dignitaryRole?: string;
  imageUrl?: string;
  date?: string;
  category?: string;
  hidden?: boolean;
}

export interface MeetingsBlockData {
  sectionLabel?: string;
  headline?: string;
  subheadline?: string;
  variant?: 'columns-accordion' | 'interactive-deck' | 'editorial-mosaic' | 'glass-tabs' | 'panoramic-slider' | 'split-slider' | 'split-slider-reverse' | 'masonry-log' | 'fading-cards' | 'deck-3d' | 'masonry-overlay';
  items?: MeetingItem[];
}



export interface MeetingsBlock extends BaseBlock {
  type: 'meetings';
  data: MeetingsBlockData;
}

// ── Research Tabs Block ──────────────────────────────────────────────────────

export interface ResearchAreaItem {
  title: string;
  desc: string;
}

export interface ResearchDomainItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  areas: ResearchAreaItem[];
}

export interface ResearchTabsBlockData {
  title?: string;
  subtitle?: string;
  domains: ResearchDomainItem[];
}

export interface ResearchTabsBlock extends BaseBlock {
  type: 'research_tabs';
  data: ResearchTabsBlockData;
}

export type CMSBlock =
  | HeroBlock
  | MetricsBlock
  | NarrativeBlock
  | CardGridBlock
  | TimelineBlock
  | QuoteBlock
  | GalleryBlock
  | MediaBlock
  | ContactBlock
  | KnowledgeGraphBlock
  | NarrativeDividerBlock
  | ChapterBlock
  | PressBlock
  | MeetingsBlock
  | ResearchTabsBlock
  | CustomBlock;

// ── Custom Rich Text Block ──────────────────────────────────────────────────

export interface StatCategoryItem {
  label: string;
  count: number;
  icon?: string;
  percentage?: string;
}

export interface AwardeesStatsBlockData {
  title?: string;
  subtitle?: string;
  headline?: string;
  subheadline?: string;
  bgImage?: string;
  variant?: 'balanced-split' | 'glass-cards' | 'editorial-compact' | 'monolith-counter' | 'split-stat-panels' | 'cinematic-timeline';
  totalAwardees?: number;
  totalMale?: number;
  totalFemale?: number;
  goldMedalists?: number;
  goldMale?: number;
  goldFemale?: number;
  degrees?: StatCategoryItem[];
  faculties?: StatCategoryItem[];
}

export interface AwardeesStatsBlock extends BaseBlock {
  type: 'awardees_stats';
  data: AwardeesStatsBlockData;
}

export interface CustomBlockData {
  title?: string;
  subtitle?: string;
  body: string;
  fullWidth?: boolean;
}

export interface CustomBlock extends BaseBlock {
  type: 'custom';
  data: CustomBlockData;
}


export interface PageData {
  id: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: CMSBlock[];
}
