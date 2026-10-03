'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Field, Input, Select, Divider } from './HeroEditor';

interface TimelineItem { year: string; title: string; institution: string; highlights: string[]; hidden?: boolean; }
interface TimelineData { title: string; style: string; items: TimelineItem[]; }
interface Props { data: object; onChange: (d: object) => void; }

export default function TimelineEditor({ data, onChange }: Props) {
  const d = data as TimelineData;
  const items = d.items || [];

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });
  const updateItem = (i: number, key: string, value: unknown) => {
    const ni = [...items];
    ni[i] = { ...ni[i], [key]: value };
    set('items', ni);
  };
  const updateHighlight = (i: number, hi: number, value: string) => {
    const h = [...(items[i].highlights || [])];
    h[hi] = value;
    updateItem(i, 'highlights', h);
  };
  const addHighlight = (i: number) => updateItem(i, 'highlights', [...(items[i].highlights || []), '']);
  const removeHighlight = (i: number, hi: number) => updateItem(i, 'highlights', (items[i].highlights || []).filter((_: string, idx: number) => idx !== hi));
  const addItem = () => set('items', [...items, { year: '2024', title: 'Event Title', institution: '', highlights: [] }]);
  const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i));
  const moveItem = (i: number, dir: 'up' | 'down') => {
    const ni = [...items];
    const ti = dir === 'up' ? i - 1 : i + 1;
    if (ti < 0 || ti >= ni.length) return;
    [ni[i], ni[ti]] = [ni[ti], ni[i]];
    set('items', ni);
  };

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Timeline" />
      </Field>
      <Field label="Style">
        <Select
          value={d.style || 'interactive'}
          onChange={(v) => set('style', v)}
          options={[
            { value: 'interactive', label: 'Interactive' },
            { value: 'vertical', label: 'Vertical' },
            { value: 'horizontal', label: 'Horizontal' },
          ]}
        />
      </Field>

      <Divider label={`Events (${items.length})`} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`border border-slate-200 rounded p-3 transition-opacity ${item.hidden ? 'opacity-60 bg-slate-100' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400">EVENT {i + 1}{item.hidden && <span className="ml-1 text-slate-300">(hidden)</span>}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateItem(i, 'hidden', !item.hidden)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={item.hidden ? 'Show event' : 'Hide event'}
                >
                  {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                <button onClick={() => removeItem(i)} className="p-0.5 text-slate-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Year">
                <Input value={item.year || ''} onChange={(v) => updateItem(i, 'year', v)} placeholder="2024" />
              </Field>
              <Field label="Title">
                <Input value={item.title || ''} onChange={(v) => updateItem(i, 'title', v)} placeholder="Event Title" />
              </Field>
            </div>
            <Field label="Institution / Organization">
              <Input value={item.institution || ''} onChange={(v) => updateItem(i, 'institution', v)} placeholder="University of…" />
            </Field>
            <div className="mt-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Highlights</label>
              <div className="space-y-1.5">
                {(item.highlights || []).map((h: string, hi: number) => (
                  <div key={hi} className="flex gap-1.5">
                    <Input value={h} onChange={(v) => updateHighlight(i, hi, v)} placeholder={`Highlight ${hi + 1}`} />
                    <button onClick={() => removeHighlight(i, hi)} className="p-1.5 text-slate-300 hover:text-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addHighlight(i)} className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded border border-dashed border-slate-200 hover:border-blue-300 w-full justify-center transition-all">
                  <Plus className="w-3 h-3" /> Add Highlight
                </button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addItem} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center">
          <Plus className="w-3 h-3" /> Add Event
        </button>
      </div>
    </div>
  );
}
