'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { Field, Input, Select, Textarea, Divider } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface CardItem {
  icon?: string;
  image?: string;
  title: string;
  description?: string;
  url?: string;
  hidden?: boolean;
  highlights?: string[];
  subtitle?: string;
  year?: string;
  category?: string;
}

interface CardGridData {
  title: string;
  category: string;
  cardType: string;
  columns: number;
  items: CardItem[];
  cardStyle?: string;
}

interface Props { data: object; onChange: (d: object) => void; }

export default function CardGridEditor({ data, onChange }: Props) {
  const d = data as CardGridData;
  const items = d.items || [];
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });
  
  const updateItem = (i: number, key: keyof CardItem, value: unknown) => {
    const ni = [...items];
    ni[i] = { ...ni[i], [key]: value };
    set('items', ni);
  };

  const addItem = () => set('items', [...items, { icon: 'Award', title: 'Dignitary / Card Title', subtitle: '', description: '', highlights: [] }]);
  const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i));
  
  const moveItem = (i: number, dir: 'up' | 'down') => {
    const ni = [...items];
    const ti = dir === 'up' ? i - 1 : i + 1;
    if (ti < 0 || ti >= ni.length) return;
    [ni[i], ni[ti]] = [ni[ti], ni[i]];
    set('items', ni);
  };

  const parseHighlights = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  };

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Section Title" />
      </Field>
      <Field label="Category Tag">
        <Input value={d.category || ''} onChange={(v) => set('category', v)} placeholder="e.g. Convocation Heritage" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Card Layout / Type">
          <Select
            value={d.cardType || 'standard'}
            onChange={(v) => set('cardType', v)}
            options={[
              { value: 'guest_marquee', label: 'Eminent Past Guests (Text Cards Marquee)' },
              { value: 'guest_photo', label: 'Eminent Past Guests (Photo Cards Marquee)' },
              { value: 'guest_photo_grid', label: 'Eminent Past Guests (Photo Cards Grid)' },
              { value: 'guest_grid', label: 'Eminent Past Guests (Text Cards Grid)' },
              { value: 'academic', label: 'Academic / Awardees Corner' },
              { value: 'testimonial', label: 'Testimonials (Marquee)' },
              { value: 'standard', label: 'Standard Cards' },
              { value: 'pillar', label: 'Pillar Cards' },
              { value: 'initiative', label: 'Initiative Cards' },
              { value: 'award', label: 'Award Cards' },
              { value: 'roadmap', label: 'Roadmap Phases' },
              { value: 'achievement', label: 'Achievement Checklist' },
              { value: 'thought_leadership', label: 'Thought Leadership' },
              { value: 'media_highlight', label: 'Media Highlight' },
              { value: 'collaboration_model', label: 'Collaboration Model (3-Step)' },
              { value: 'research_table', label: 'Research Table' },
            ]}
          />
        </Field>
        <Field label="Columns">
          <Select
            value={String(d.columns || 3)}
            onChange={(v) => set('columns', Number(v))}
            options={[
              { value: '1', label: '1 column' },
              { value: '2', label: '2 columns' },
              { value: '3', label: '3 columns' },
              { value: '4', label: '4 columns' },
            ]}
          />
        </Field>
      </div>
      <Field label="Card Style">
        <Select
          value={d.cardStyle || 'standard'}
          onChange={(v) => set('cardStyle', v)}
          options={[
            { value: 'standard', label: 'Classic Modern' },
            { value: 'glass', label: 'Glassmorphism' },
            { value: 'glow', label: 'Interactive Glow' },
            { value: 'editorial', label: 'Minimal Editorial' },
          ]}
        />
      </Field>

      <Divider label={`Items (${items.length})`} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`border border-slate-200 rounded-xl p-3.5 transition-all ${item.hidden ? 'opacity-60 bg-slate-100' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400">CARD #{i + 1} {item.hidden && '(HIDDEN)'}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateItem(i, 'hidden', !item.hidden)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={item.hidden ? "Show item" : "Hide item"}
                >
                  {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeItem(i)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Photo Picker for guest_photo or any card */}
            <div className="mb-3 p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Card Image / Portrait
              </span>
              <div className="flex items-center gap-2.5">
                {item.image ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <Input value={item.image || ''} onChange={(v) => updateItem(i, 'image', v)} placeholder="e.g. /uploads/amit-shah.jpg" />
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex(i)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap border border-slate-200 shadow-sm transition-colors cursor-pointer"
                  >
                    Browse
                  </button>
                  {item.image && (
                    <button
                      type="button"
                      onClick={() => updateItem(i, 'image', '')}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Field label="Icon">
                <Input value={item.icon || ''} onChange={(v) => updateItem(i, 'icon', v)} placeholder="Award" />
              </Field>
              <Field label="Name / Title" required>
                <Input value={item.title || ''} onChange={(v) => updateItem(i, 'title', v)} placeholder="e.g. Shri Amit Shah" />
              </Field>
              <Field label="Year / Date">
                <Input value={item.year || ''} onChange={(v) => updateItem(i, 'year', v)} placeholder="e.g. Jan 16, 2025" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Designation / Subtitle">
                <Input value={item.subtitle || ''} onChange={(v) => updateItem(i, 'subtitle', v)} placeholder="e.g. Hon'ble Union Minister..." />
              </Field>
              <Field label="Edition / Category">
                <Input value={item.category || ''} onChange={(v) => updateItem(i, 'category', v)} placeholder="e.g. 18th Convocation" />
              </Field>
            </div>

            <Field label="Special Dignitaries / Description">
              <Textarea value={item.description || ''} onChange={(v) => updateItem(i, 'description', v)} placeholder="e.g. • Shri Rushikesh Patel • Shri Harsh Sanghavi" rows={2} />
            </Field>

            {/* Highlights field for academic, roadmap, achievement, or research_table */}
            {['academic', 'roadmap', 'achievement', 'research_table'].includes(d.cardType) && (
              <Field label="Highlights (one per line)">
                <Textarea
                  value={(item.highlights || []).join('\n')}
                  onChange={(v) => updateItem(i, 'highlights', parseHighlights(v))}
                  placeholder="Highlight 1&#10;Highlight 2&#10;Highlight 3"
                  rows={3}
                />
              </Field>
            )}

            <Field label="Profile Link URL (optional)">
              <Input value={item.url || ''} onChange={(v) => updateItem(i, 'url', v)} placeholder="/chief-guest" />
            </Field>
          </div>
        ))}

        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 transition-all w-full justify-center cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card Item
        </button>
      </div>

      {activeMediaIndex !== null && (
        <MediaPicker
          currentUrl={items[activeMediaIndex]?.image}
          onSelect={(url) => {
            updateItem(activeMediaIndex, 'image', url);
            setActiveMediaIndex(null);
          }}
          onClose={() => setActiveMediaIndex(null)}
          filter="image"
        />
      )}
    </div>
  );
}
