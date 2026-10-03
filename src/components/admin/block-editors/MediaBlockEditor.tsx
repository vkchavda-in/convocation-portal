'use client';

import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Field, Input, Textarea, Divider } from './HeroEditor';

interface MediaItem { url: string; title: string; description?: string; thumbnail?: string; date?: string; source?: string; hidden?: boolean; }
interface MediaBlockData { title: string; videos: MediaItem[]; interviews: MediaItem[]; news: MediaItem[]; resources: MediaItem[]; }
interface Props { data: object; onChange: (d: object) => void; }

function ItemRepeater({ label, items, onUpdate }: { label: string; items: MediaItem[]; onUpdate: (items: MediaItem[]) => void }) {
  const add = () => onUpdate([...items, { url: '', title: '' }]);
  const remove = (i: number) => onUpdate(items.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, value: unknown) => {
    const ni = [...items];
    ni[i] = { ...ni[i], [key]: value };
    onUpdate(ni);
  };

  return (
    <div>
      <Divider label={`${label} (${items.length})`} />
      <div className="space-y-3 mt-3">
        {items.map((item, i) => (
          <div key={i} className={`border border-slate-200 rounded p-3 transition-opacity ${item.hidden ? 'opacity-60 bg-slate-100' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-semibold text-slate-400">
                {label.toUpperCase()} {i + 1}{item.hidden && <span className="ml-1 text-slate-300">(hidden)</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => update(i, 'hidden', !item.hidden)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={item.hidden ? `Show ${label}` : `Hide ${label}`}
                >
                  {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => remove(i)} className="p-0.5 text-slate-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <Field label="Title">
              <Input value={item.title || ''} onChange={(v) => update(i, 'title', v)} placeholder="Title" />
            </Field>
            <div className="mt-2">
              <Field label="URL">
                <Input value={item.url || ''} onChange={(v) => update(i, 'url', v)} placeholder="https://…" />
              </Field>
            </div>
            {label === 'News' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Field label="Source">
                  <Input value={item.source || ''} onChange={(v) => update(i, 'source', v)} placeholder="Times of India" />
                </Field>
                <Field label="Date">
                  <Input value={item.date || ''} onChange={(v) => update(i, 'date', v)} placeholder="Jan 2024" type="text" />
                </Field>
              </div>
            )}
            <div className="mt-2">
              <Field label="Description (optional)">
                <Textarea value={item.description || ''} onChange={(v) => update(i, 'description', v)} placeholder="Brief description…" rows={2} />
              </Field>
            </div>
          </div>
        ))}
        <button onClick={add} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center">
          <Plus className="w-3 h-3" /> Add {label}
        </button>
      </div>
    </div>
  );
}

export default function MediaBlockEditor({ data, onChange }: Props) {
  const d = data as MediaBlockData;
  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  return (
    <div className="space-y-4">
      <Field label="Section Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Media" />
      </Field>
      <ItemRepeater label="Video" items={d.videos || []} onUpdate={(v) => set('videos', v)} />
      <ItemRepeater label="Interview" items={d.interviews || []} onUpdate={(v) => set('interviews', v)} />
      <ItemRepeater label="News" items={d.news || []} onUpdate={(v) => set('news', v)} />
      <ItemRepeater label="Resource" items={d.resources || []} onUpdate={(v) => set('resources', v)} />
    </div>
  );
}
