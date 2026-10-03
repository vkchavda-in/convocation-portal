'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero Banner', description: 'Flagship hero with titles, portrait, and CTAs' },
  { type: 'hero_info', label: 'Hero Info & Quick Facts', description: 'Ceremony date, batch highlights, and CTA cards' },
  { type: 'guests', label: 'Distinguished Dignitaries', description: 'Chief guests and guest of honour profile cards' },
  { type: 'awardees_stats', label: 'Convocation at a Glance (Stats)', description: 'Key milestones, statistics, and background banner' },
  { type: 'quote', label: 'Editorial Quote', description: 'Leadership message with optional portrait cutout' },
  { type: 'card_grid', label: 'Card Grid / Testimonials', description: 'Multi-column cards or infinite testimonial marquee' },
  { type: 'gallery', label: 'Moments Gallery', description: 'Dual-row infinite marquee or photo grid' },
  { type: 'narrative', label: 'Narrative Story', description: 'Editorial story paragraphs and chapter details' },
  { type: 'contact', label: 'Contact Secretariat', description: 'Convocation secretariat contacts and social links' },
  { type: 'media', label: 'Media & Ceremony Resources', description: 'Videos, interviews, news coverage, and downloads' },
  { type: 'custom', label: 'Custom Rich Text (CKEditor)', description: 'Rich text and custom HTML area powered by CKEditor' },
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
    items: [
      { icon: 'Star', title: 'Card Title', description: 'Card description here.' },
    ],
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


interface Block {
  id: string;
  type: string;
  data: object;
  hidden?: boolean;
}

interface BlockEditorProps {
  initialBlocks: Block[];
  slug: string;
  isNew?: boolean;
  pageTitle: string;
  pageMetaTitle: string;
  pageMetaDescription: string;
  isPublished: boolean;
}

export default function BlockEditor({
  initialBlocks,
  slug,
  isNew = false,
  pageTitle: initialPageTitle,
  pageMetaTitle: initialMetaTitle,
  pageMetaDescription: initialMetaDesc,
  isPublished: initialPublished,
}: BlockEditorProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [pageTitle, setPageTitle] = useState(initialPageTitle);
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle);
  const [metaDescription, setMetaDescription] = useState(initialMetaDesc);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [slugValue, setSlugValue] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBlockType, setSelectedBlockType] = useState('card_grid');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const addBlock = () => {
    const newBlock: Block = {
      id: generateId(),
      type: selectedBlockType,
      data: DEFAULT_BLOCK_DATA[selectedBlockType] || {},
    };
    setBlocks((prev) => [...prev, newBlock]);
    setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
  };

  const removeBlock = (id: string) => {
    if (!confirm('Remove this block?')) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const toggleBlockVisibility = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b))
    );
  };

  const updateBlockData = (id: string, jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, data: parsed } : b))
      );
    } catch {
      // Invalid JSON - let user fix it
    }
  };

  const updateBlockType = (id: string, newType: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, type: newType, data: DEFAULT_BLOCK_DATA[newType] || {} }
          : b
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isNew ? '/api/pages' : `/api/pages/${slugValue}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        ...(isNew && { slug: slugValue }),
        title: pageTitle,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        sections: blocks,
        isPublished,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save page');
        return;
      }

      setSuccess('Page saved successfully!');
      if (isNew) {
        router.push(`/admin/pages/${data.slug}/edit`);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${pageTitle}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/pages/${slugValue}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/pages');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete page');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Page Title"
              className="text-lg font-bold text-gray-900 w-full bg-transparent border-none outline-none placeholder-gray-400 focus:ring-0 p-0"
            />
            <p className="text-xs text-gray-400 mt-0.5">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600">Published</span>
              <div
                onClick={() => setIsPublished(!isPublished)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  isPublished ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ {success}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Page Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Page Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              {isNew && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">/</span>
                    <input
                      type="text"
                      value={slugValue}
                      onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="page-slug"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Auto-formatted to lowercase with hyphens</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. Additive Manufacturing Centre of Excellence"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description (SEO)</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines (150-160 chars recommended)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            {blocks.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <div className="text-3xl mb-2">🧩</div>
                <p className="font-medium text-gray-500">No blocks yet</p>
                <p className="text-sm mt-1">Use the panel on the right to add blocks</p>
              </div>
            )}

            {blocks.map((block, index) => {
              const isExpanded = expandedBlocks.has(block.id);
              const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type);

              return (
                <div key={block.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${block.hidden ? 'opacity-60' : ''}`}>
                  {/* Block Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(block.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                        disabled={index === 0}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                        disabled={index === blocks.length - 1}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {block.type}
                        </span>
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {/* @ts-expect-error dynamic block data access */}
                          {block.data?.title || blockMeta?.label || block.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block.id); }}
                        className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={block.hidden ? "Show block" : "Hide block"}
                      >
                        {block.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Block Editor */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      {/* Block Type Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Block Type</label>
                        <select
                          value={block.type}
                          onChange={(e) => updateBlockType(block.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                        >
                          {BLOCK_TYPES.map((bt) => (
                            <option key={bt.type} value={bt.type}>
                              {bt.label} ({bt.type})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Changing type resets block data to defaults
                        </p>
                      </div>

                      {/* Block ID (read-only) */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Block ID</label>
                        <input
                          type="text"
                          value={block.id}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-gray-500 bg-gray-50 focus:outline-none cursor-not-allowed"
                        />
                      </div>

                      {/* JSON Editor */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          Block Data (JSON)
                          <span className="text-gray-400">— edit directly or paste from CMS guide</span>
                        </label>
                        <div className="relative">
                          <textarea
                            defaultValue={JSON.stringify(block.data, null, 2)}
                            onBlur={(e) => updateBlockData(block.id, e.target.value)}
                            rows={12}
                            spellCheck={false}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y bg-gray-50"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Changes are applied when you click outside the editor. Save the page to persist.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Add Block */}
        <div className="w-72 border-l border-gray-200 bg-white p-5 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Add Block</h3>
          <div className="mb-4">
            <select
              value={selectedBlockType}
              onChange={(e) => setSelectedBlockType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            >
              {BLOCK_TYPES.map((bt) => (
                <option key={bt.type} value={bt.type}>
                  {bt.label}
                </option>
              ))}
            </select>
            {BLOCK_TYPES.find((bt) => bt.type === selectedBlockType) && (
              <p className="text-xs text-gray-400 mt-1.5">
                {BLOCK_TYPES.find((bt) => bt.type === selectedBlockType)?.description}
              </p>
            )}
          </div>
          <button
            onClick={addBlock}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Block Types</h3>
            <div className="space-y-2">
              {BLOCK_TYPES.map((bt) => (
                <div
                  key={bt.type}
                  className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedBlockType(bt.type)}
                >
                  <p className="text-xs font-medium text-gray-700">{bt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{bt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
