'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Field, Input, Select, Textarea, Divider } from './HeroEditor';

interface CardItem {
  icon: string;
  title: string;
  description: string;
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

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });
  
  const updateItem = (i: number, key: keyof CardItem, value: unknown) => {
    const ni = [...items];
    ni[i] = { ...ni[i], [key]: value };
    set('items', ni);
  };

  const addItem = () => set('items', [...items, { icon: 'Star', title: 'Card Title', description: '', highlights: [] }]);
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
        <Input value={d.category || ''} onChange={(v) => set('category', v)} placeholder="e.g. Initiatives" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Card Type">
          <Select
            value={d.cardType || 'standard'}
            onChange={(v) => set('cardType', v)}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'academic', label: 'Academic / Awardees Corner' },
              { value: 'testimonial', label: 'Testimonials (Marquee)' },
              { value: 'guest_marquee', label: 'Past Convocation Guests (Marquee)' },
              { value: 'pillar', label: 'Pillar' },
              { value: 'initiative', label: 'Initiative' },
              { value: 'award', label: 'Award' },
              { value: 'roadmap', label: 'Roadmap' },
              { value: 'achievement', label: 'Achievement' },
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
          <div key={i} className={`border border-slate-200 rounded p-3 transition-all ${item.hidden ? 'opacity-60 bg-slate-100' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400">ITEM {i + 1} {item.hidden && '(HIDDEN)'}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateItem(i, 'hidden', !item.hidden)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={item.hidden ? "Show item" : "Hide item"}
                >
                  {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="p-0.5 text-slate-350 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="p-0.5 text-slate-350 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                <button onClick={() => removeItem(i)} className="p-0.5 text-slate-350 hover:text-red-650"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Field label="Icon">
                <Input value={item.icon || ''} onChange={(v) => updateItem(i, 'icon', v)} placeholder="Star" />
              </Field>
              <Field label="Title / Level">
                <Input value={item.title || ''} onChange={(v) => updateItem(i, 'title', v)} placeholder="Title" />
              </Field>
              <Field label="Year / Duration">
                <Input value={item.year || ''} onChange={(v) => updateItem(i, 'year', v)} placeholder="e.g. 4 Years" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Subtitle / Degree">
                <Input value={item.subtitle || ''} onChange={(v) => updateItem(i, 'subtitle', v)} placeholder="e.g. B.Tech" />
              </Field>
              <Field label="Category / Tag">
                <Input value={item.category || ''} onChange={(v) => updateItem(i, 'category', v)} placeholder="e.g. UG Program" />
              </Field>
            </div>

            <Field label="Description">
              <Textarea value={item.description || ''} onChange={(v) => updateItem(i, 'description', v)} placeholder="Card description…" rows={2} />
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

            <Field label="Link URL (optional)">
              <Input value={item.url || ''} onChange={(v) => updateItem(i, 'url', v)} placeholder="/page-slug" />
            </Field>
          </div>
        ))}
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center"
        >
          <Plus className="w-3 h-3" />
          Add Card
        </button>
      </div>
    </div>
  );
}
