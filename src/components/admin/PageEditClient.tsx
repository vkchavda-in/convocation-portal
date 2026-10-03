'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  Copy, Layers, AlertCircle, Check, X, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import HeroEditor from './block-editors/HeroEditor';
import HeroInfoEditor from './block-editors/HeroInfoEditor';
import GuestsEditor from './block-editors/GuestsEditor';
import AwardeesStatsEditor from './block-editors/AwardeesStatsEditor';
import QuoteEditor from './block-editors/QuoteEditor';
import CardGridEditor from './block-editors/CardGridEditor';
import GalleryEditor from './block-editors/GalleryEditor';
import NarrativeEditor from './block-editors/NarrativeEditor';
import ContactEditor from './block-editors/ContactEditor';
import MediaBlockEditor from './block-editors/MediaBlockEditor';
import CustomEditor from './block-editors/CustomEditor';

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner', color: '#6366f1' },
  { type: 'hero_info', label: 'Hero Info & Quick Facts', color: '#f59e0b' },
  { type: 'guests', label: 'Distinguished Dignitaries', color: '#c89e4c' },
  { type: 'awardees_stats', label: 'Convocation at a Glance (Stats)', color: '#0ea5e9' },
  { type: 'quote', label: 'Editorial Quote', color: '#7c3aed' },
  { type: 'card_grid', label: 'Card Grid / Testimonials', color: '#059669' },
  { type: 'gallery', label: 'Moments Gallery', color: '#db2777' },
  { type: 'narrative', label: 'Narrative Story', color: '#0891b2' },
  { type: 'contact', label: 'Contact Secretariat', color: '#16a34a' },
  { type: 'media', label: 'Media & Ceremony Resources', color: '#0284c7' },
  { type: 'custom', label: 'Custom Rich Text (CKEditor)', color: '#8b5cf6' },
];

const DEFAULT_BLOCK_DATA: Record<string, object> = {
  hero: {
    title: '19th Convocation',
    subtitle: 'Ganpat University',
    description: 'Celebrating the dedication, persistence and academic triumphs of our graduating batch.',
    tagline: '19th Convocation — Ganpat University',
    taglineIcon: 'Award',
    isSubpage: false,
    primaryCTA: { label: 'Invitation Details', url: '/19th-convocation-3' },
    portrait: { imageUrl: '', imageAlt: 'Portrait' },
  },
  hero_info: {
    title: '19th Convocation',
    tagline: 'Ganpat University',
    subtitle: 'January 8, 2026 • 4:30 PM onwards',
    description: 'Celebrating the dedication, persistence and academic triumphs of our graduating batch. Welcome awardees, parents, and distinguished guests to the grand ceremony.',
    primaryCTA: { label: 'Invitation details', url: '/19th-convocation-3' },
    secondaryCTA: { label: 'Logistics & Schedule', url: '/convocation-schedule' },
    heroStats: [
      { value: '8th Jan', label: 'Ceremony Date', icon: 'Calendar' },
      { value: '4:30 PM', label: 'Procession Starts', icon: 'Clock' },
      { value: '2026', label: 'Graduating Batch', icon: 'GraduationCap' }
    ]
  },
  guests: {
    title: 'Our Distinguished Dignitaries',
    category: 'Eminent Leaders',
    subtitle: 'Gracing the 19th Convocation Ceremony',
    items: [
      {
        category: 'Chief Guest',
        name: 'Dignitary Name',
        role: 'Honorable Chief Guest',
        description: 'Organization / Institution',
        image: '',
        url: '/chief-guest',
      }
    ]
  },
  awardees_stats: {
    headline: '19th Convocation at a Glance',
    subheadline: 'Celebrating academic milestones and graduating scholars across multidisciplinary domains.',
    bgImage: '',
  },
  quote: {
    category: "Director General's Message",
    quote: 'Education is the passport to the future, for tomorrow belongs to those who prepare for it today.',
    author: 'Dr. Mahendra Sharma',
    citation: 'Pro-Chancellor & Director General, Ganpat University',
    signature: '',
    image: '',
    layout: 'editorial',
  },
  card_grid: {
    title: 'Section Title',
    category: 'Information',
    cardType: 'standard',
    columns: 3,
    items: [{ icon: 'Star', title: 'Card Title', description: 'Card description here.' }],
  },
  gallery: {
    title: 'Moments of Glory',
    categories: [{ id: 'all', label: 'All Photos' }],
    images: [],
    variant: 'slider',
  },
  narrative: {
    title: 'Convocation Story',
    category: 'Overview',
    body: ['Enter narrative content here.'],
    layout: 'editorial',
  },
  contact: {
    title: 'Convocation Secretariat',
    subtitle: 'Get in touch for assistance and inquiries',
    categories: [],
    socials: [],
  },
  media: {
    title: 'Ceremony Media & Resources',
    videos: [],
    interviews: [],
    news: [],
    resources: [],
  },
  custom: {
    title: '',
    subtitle: '',
    body: '<p>Enter rich text content here...</p>',
    fullWidth: false,
  },
};

function getBlockSummary(block: Block): string {
  const d = block.data as Record<string, unknown>;
  return (d.title as string) || (d.headline as string) || (d.quote as string)?.slice(0, 40) || block.type;
}

const BLOCK_EDITORS: Record<string, React.ComponentType<{ data: object; onChange: (d: object) => void }>> = {
  hero: HeroEditor,
  hero_info: HeroInfoEditor,
  guests: GuestsEditor,
  awardees_stats: AwardeesStatsEditor,
  quote: QuoteEditor,
  card_grid: CardGridEditor,
  gallery: GalleryEditor,
  narrative: NarrativeEditor,
  contact: ContactEditor,
  media: MediaBlockEditor,
  custom: CustomEditor,
};


interface Block { id: string; type: string; data: object; hidden?: boolean; }

interface PageEditClientProps {
  initialBlocks: Block[];
  slug: string;
  isNew?: boolean;
  pageTitle: string;
  pageMetaTitle: string;
  pageMetaDescription: string;
  isPublished: boolean;
  initialUpdatedAt?: string;
}

export default function PageEditClient({
  initialBlocks, slug, isNew = false,
  pageTitle: initTitle, pageMetaTitle: initMetaTitle,
  pageMetaDescription: initMetaDesc, isPublished: initPublished,
  initialUpdatedAt = '',
}: PageEditClientProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [pageTitle, setPageTitle] = useState(initTitle);
  const [metaTitle, setMetaTitle] = useState(initMetaTitle);
  const [metaDesc, setMetaDesc] = useState(initMetaDesc);
  const [isPublished, setIsPublished] = useState(initPublished);
  const [slugValue, setSlugValue] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [past, setPast] = useState<Block[][]>([]);
  const [future, setFuture] = useState<Block[][]>([]);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('card_grid');
  const [showRawJson, setShowRawJson] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);

  // Concurrency & Real-time Syncing states
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialUpdatedAt);
  const [hasExternalChanges, setHasExternalChanges] = useState(false);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const lastUpdatedAtRef = useRef(initialUpdatedAt);

  useEffect(() => {
    lastUpdatedAtRef.current = lastUpdatedAt;
  }, [lastUpdatedAt]);

  // Polling listener for external changes
  useEffect(() => {
    if (isNew) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pages/${slug}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.updatedAt) {
            const dbTime = new Date(data.updatedAt).getTime();
            const clientTime = new Date(lastUpdatedAtRef.current).getTime();
            if (dbTime > clientTime) {
              setHasExternalChanges(true);
            } else {
              setHasExternalChanges(false);
            }
          }
        }
      } catch (e) {
        console.error('Failed to poll page status:', e);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [slug, isNew]);

  const loadLatestChanges = async () => {
    setLoadingChanges(true);
    try {
      const res = await fetch(`/api/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBlocks((data.sections as Block[]) || []);
        setPageTitle(data.title || '');
        setMetaTitle(data.metaTitle || '');
        setMetaDesc(data.metaDescription || '');
        setIsPublished(data.isPublished ?? true);
        setLastUpdatedAt(data.updatedAt);
        setHasExternalChanges(false);
        toast.success('Latest page changes loaded successfully');
      } else {
        toast.error('Failed to load latest page changes');
      }
    } catch {
      toast.error('Error loading latest page changes');
    } finally {
      setLoadingChanges(false);
    }
  };

  const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const commitHistory = (newBlocks: Block[]) => {
    setPast((p) => [...p, blocks]);
    setFuture([]);
    setBlocks(newBlocks);
  };

  const addBlock = () => {
    const b: Block = { id: genId(), type: selectedType, data: DEFAULT_BLOCK_DATA[selectedType] || {} };
    commitHistory([...blocks, b]);
    setSelectedBlock(b.id);
    setAddOpen(false);
    toast.success(`${BLOCK_TYPES.find((t) => t.type === selectedType)?.label} block added`);
  };

  const removeBlock = (id: string) => {
    commitHistory(blocks.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
    setConfirmDeleteBlock(null);
    toast.success('Block removed');
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    const nb = [...blocks];
    const ti = dir === 'up' ? index - 1 : index + 1;
    if (ti < 0 || ti >= nb.length) return;
    [nb[index], nb[ti]] = [nb[ti], nb[index]];
    commitHistory(nb);
  };

  const duplicateBlock = (block: Block) => {
    const copy: Block = { ...block, id: genId() };
    const idx = blocks.findIndex((b) => b.id === block.id);
    const nb = [...blocks];
    nb.splice(idx + 1, 0, copy);
    commitHistory(nb);
    setSelectedBlock(copy.id);
    toast.success('Block duplicated');
  };

  const updateBlockData = (id: string, data: object) => {
    const newBlocks = blocks.map((b) => b.id === id ? { ...b, data } : b);
    setBlocks(newBlocks);
    
    // Debounce history commits for data updates to prevent every keystroke from creating history
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      setPast((p) => [...p, blocks]);
      setFuture([]);
    }, 1000);
  };

  const toggleBlockVisibility = (id: string) => {
    const updated = blocks.map((b) => b.id === id ? { ...b, hidden: !b.hidden } : b);
    commitHistory(updated);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture((f) => [blocks, ...f]);
    setPast((p) => p.slice(0, p.length - 1));
    setBlocks(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [...p, blocks]);
    setFuture((f) => f.slice(1));
    setBlocks(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past, future, blocks]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = isNew ? '/api/pages' : `/api/pages/${slugValue}`;
      const method = isNew ? 'POST' : 'PUT';
      const payload = {
        ...(isNew && { slug: slugValue }),
        title: pageTitle,
        metaTitle: metaTitle || null,
        metaDescription: metaDesc || null,
        sections: blocks,
        isPublished,
        ...(!isNew && { lastUpdatedAt }),
      };
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || 'Conflict: This page has been modified.', {
            duration: 8000,
          });
          setHasExternalChanges(true);
        } else {
          toast.error(data.error || 'Failed to save');
        }
        return;
      }
      toast.success('Page saved successfully');
      if (data.updatedAt) {
        setLastUpdatedAt(data.updatedAt);
        setHasExternalChanges(false);
      }
      if (isNew) router.push(`/admin/pages/${data.slug}/edit`);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentBlock = blocks.find((b) => b.id === selectedBlock);
  const CurrentEditor = currentBlock ? BLOCK_EDITORS[currentBlock.type] : null;
  const selectedBlockMeta = BLOCK_TYPES.find((t) => t.type === currentBlock?.type);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-slate-400 min-w-0">
          <Link href="/admin" className="hover:text-slate-600">Admin</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/admin/pages" className="hover:text-slate-600">Pages</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-700 font-medium truncate max-w-[160px]">
            {isNew ? 'New Page' : pageTitle}
          </span>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-3">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo (Ctrl+Z)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo (Ctrl+Y)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
          </div>
          {/* Publish toggle */}
          <button
            onClick={() => setIsPublished(!isPublished)}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all"
            style={
              isPublished
                ? { borderColor: '#bbf7d0', background: '#f0fdf4', color: '#15803d' }
                : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#64748b' }
            }
          >
            {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isPublished ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-60"
            style={{ background: '#2563eb' }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Real-time Poll Warning Banner */}
      {hasExternalChanges && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4 flex-shrink-0 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Note:</strong> Another user has saved updates to this page. To load their changes, click the update button.
            </span>
          </div>
          <button
            onClick={loadLatestChanges}
            disabled={loadingChanges}
            className="flex-shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {loadingChanges ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Load Latest Changes
          </button>
        </div>
      )}

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Page settings + blocks table */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ width: selectedBlock ? '55%' : '100%', transition: 'width 0.2s ease' }}
        >
          {/* Page Settings */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Page Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Page Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Home"
                />
              </div>
              {isNew ? (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">URL Slug <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">/</span>
                    <input
                      type="text"
                      value={slugValue}
                      onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="page-slug"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">URL Slug</label>
                  <span className="inline-flex items-center px-2.5 py-1.5 border border-slate-100 rounded text-xs font-mono text-slate-500 bg-slate-50">
                    /{slugValue}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="SEO title…"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Meta Description</label>
                <input
                  type="text"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="150–160 chars…"
                />
              </div>
            </div>
          </div>

          {/* Blocks Table Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Blocks</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                {blocks.length}
              </span>
            </div>
            <button
              onClick={() => setAddOpen(!addOpen)}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </div>

          {/* Add Block Panel */}
          {addOpen && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="flex items-center gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {BLOCK_TYPES.map((bt) => (
                    <option key={bt.type} value={bt.type}>{bt.label}</option>
                  ))}
                </select>
                <button
                  onClick={addBlock}
                  className="inline-flex items-center gap-1 text-white text-xs font-medium px-3 py-1.5 rounded"
                  style={{ background: '#2563eb' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
                <button
                  onClick={() => setAddOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Blocks Table */}
          <div className="flex-1 bg-white">
            {blocks.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-xs text-slate-400 mb-3">No blocks yet. Add your first block above.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left w-12">#</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">Type</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left">Content</th>
                    <th className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((block, index) => {
                    const meta = BLOCK_TYPES.find((t) => t.type === block.type);
                    const isSelected = selectedBlock === block.id;
                    const isHidden = block.hidden;
                    return (
                      <tr
                        key={block.id}
                        onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                        className="border-b border-slate-50 transition-colors cursor-pointer group"
                        style={{ 
                          background: isSelected ? '#eff6ff' : undefined,
                          opacity: isHidden ? 0.6 : undefined
                        }}
                      >
                        <td className="px-3 py-2 text-[10px] text-slate-400 font-mono">{index + 1}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium text-white"
                            style={{ background: meta?.color || '#64748b' }}
                          >
                            {block.type}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-slate-700 font-medium truncate max-w-[200px] block">
                            {getBlockSummary(block)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => toggleBlockVisibility(block.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              title={isHidden ? "Show block" : "Hide block"}
                            >
                              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => moveBlock(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed rounded"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveBlock(index, 'down')}
                              disabled={index === blocks.length - 1}
                              className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed rounded"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => duplicateBlock(block)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteBlock(block.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT — Block editor panel */}
        {selectedBlock && currentBlock && (
          <div
            className="border-l border-slate-200 bg-white flex flex-col overflow-hidden"
            style={{ width: '45%', transition: 'width 0.2s ease' }}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium text-white flex-shrink-0"
                  style={{ background: selectedBlockMeta?.color || '#64748b' }}
                >
                  {currentBlock.type}
                </span>
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {selectedBlockMeta?.label}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleBlockVisibility(currentBlock.id)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors mr-1"
                  title={currentBlock.hidden ? "Show Block" : "Hide Block"}
                >
                  {currentBlock.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-[10px] px-2 py-1 rounded border border-slate-200 text-slate-500 hover:border-slate-300 transition-colors"
                >
                  {showRawJson ? 'Form' : 'JSON'}
                </button>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {showRawJson ? (
                <div>
                  <p className="text-[10px] text-slate-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Edit raw JSON — changes apply on blur
                  </p>
                  <textarea
                    defaultValue={JSON.stringify(currentBlock.data, null, 2)}
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateBlockData(currentBlock.id, parsed);
                        toast.success('JSON applied');
                      } catch {
                        toast.error('Invalid JSON');
                      }
                    }}
                    rows={20}
                    spellCheck={false}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-[11px] font-mono bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                  />
                </div>
              ) : CurrentEditor ? (
                <CurrentEditor
                  data={currentBlock.data}
                  onChange={(d) => updateBlockData(currentBlock.id, d)}
                />
              ) : (
                <p className="text-xs text-slate-400">No editor for this block type.</p>
              )}
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{currentBlock.id}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1 text-white text-[10px] font-medium px-2.5 py-1.5 rounded disabled:opacity-60"
                  style={{ background: '#2563eb' }}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete block dialog */}
      {confirmDeleteBlock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setConfirmDeleteBlock(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-5 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Remove block?</h3>
            <p className="text-xs text-slate-500 mb-4">This block and all its content will be removed.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteBlock(null)}
                className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => removeBlock(confirmDeleteBlock)}
                className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
