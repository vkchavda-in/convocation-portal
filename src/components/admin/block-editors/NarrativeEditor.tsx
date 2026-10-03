'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea, Divider } from './HeroEditor';

interface NarrativeData {
  title: string;
  category: string;
  layout: string;
  body: string[];
}

interface Props { data: object; onChange: (d: object) => void; }

export default function NarrativeEditor({ data, onChange }: Props) {
  const d = data as NarrativeData;
  const body = d.body || [''];

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const updatePara = (i: number, value: string) => {
    const nb = [...body];
    nb[i] = value;
    set('body', nb);
  };

  const addPara = () => set('body', [...body, '']);
  const removePara = (i: number) => set('body', body.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Section Title" />
      </Field>
      <Field label="Category Tag">
        <Input value={d.category || ''} onChange={(v) => set('category', v)} placeholder="e.g. Leadership" />
      </Field>
      <Field label="Layout">
        <Select
          value={d.layout || 'editorial'}
          onChange={(v) => set('layout', v)}
          options={[
            { value: 'editorial', label: 'Editorial' },
            { value: 'split', label: 'Split (text + panel)' },
            { value: 'centered', label: 'Centered' },
          ]}
        />
      </Field>

      <Divider label="Body Paragraphs" />
      <div className="space-y-2">
        {body.map((para, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <Textarea
                value={para}
                onChange={(v) => updatePara(i, v)}
                placeholder={`Paragraph ${i + 1}…`}
                rows={3}
              />
            </div>
            <button
              onClick={() => removePara(i)}
              disabled={body.length === 1}
              className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed mt-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={addPara}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center"
        >
          <Plus className="w-3 h-3" />
          Add Paragraph
        </button>
      </div>
    </div>
  );
}
