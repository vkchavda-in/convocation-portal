'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Field, Input, Divider } from './HeroEditor';

interface MetricItem { icon: string; value: string; label: string; description: string; hidden?: boolean; }
interface MetricsData { items: MetricItem[]; }
interface Props { data: object; onChange: (d: object) => void; }

export default function MetricsEditor({ data, onChange }: Props) {
  const d = data as MetricsData;
  const items = d.items || [];

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });
  const updateItem = (i: number, key: string, value: unknown) => {
    const ni = [...items];
    ni[i] = { ...ni[i], [key]: value };
    set('items', ni);
  };
  const addItem = () => set('items', [...items, { icon: 'Users', value: '0+', label: 'Metric', description: '' }]);
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
      <Divider label={`Metrics (${items.length})`} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`border border-slate-200 rounded p-3 transition-opacity ${item.hidden ? 'opacity-60 bg-slate-100' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400">METRIC {i + 1}{item.hidden && <span className="ml-1 text-slate-300">(hidden)</span>}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateItem(i, 'hidden', !item.hidden)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={item.hidden ? 'Show metric' : 'Hide metric'}
                >
                  {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => moveItem(i, 'up')} disabled={i === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                <button onClick={() => removeItem(i)} className="p-0.5 text-slate-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="Icon">
                <Input value={item.icon || ''} onChange={(v) => updateItem(i, 'icon', v)} placeholder="Users" />
              </Field>
              <Field label="Value">
                <Input value={item.value || ''} onChange={(v) => updateItem(i, 'value', v)} placeholder="500+" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Label">
                <Input value={item.label || ''} onChange={(v) => updateItem(i, 'label', v)} placeholder="Students" />
              </Field>
              <Field label="Description">
                <Input value={item.description || ''} onChange={(v) => updateItem(i, 'description', v)} placeholder="Short note" />
              </Field>
            </div>
          </div>
        ))}
        <button onClick={addItem} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center">
          <Plus className="w-3 h-3" /> Add Metric
        </button>
      </div>
    </div>
  );
}
