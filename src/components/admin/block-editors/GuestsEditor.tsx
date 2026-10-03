'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, User, Image as ImageIcon } from 'lucide-react';
import MediaPicker from '../MediaPicker';
import { Field, Input, Textarea, Divider } from './HeroEditor';

interface GuestItem {
  category?: string;
  name: string;
  role: string;
  description?: string;
  organization?: string;
  image: string;
  url?: string;
}

interface GuestsData {
  title?: string;
  category?: string;
  subtitle?: string;
  items?: GuestItem[];
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

export default function GuestsEditor({ data, onChange }: Props) {
  const d = data as GuestsData;
  const items = d.items || [];
  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const updateItem = (index: number, key: keyof GuestItem, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    set('items', next);
  };

  const addItem = () => {
    const next = [
      ...items,
      {
        category: 'Distinguished Guest',
        name: 'New Dignitary',
        role: 'Designation / Title',
        description: 'Organization / Affiliation',
        image: '',
        url: '#',
      },
    ];
    set('items', next);
  };

  const removeItem = (index: number) => {
    if (!confirm('Remove this dignitary?')) return;
    const next = items.filter((_, idx) => idx !== index);
    set('items', next);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    set('items', next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section Title" required>
          <Input
            value={d.title || ''}
            onChange={(v) => set('title', v)}
            placeholder="Our Distinguished Dignitaries"
          />
        </Field>
        <Field label="Badge / Category">
          <Input
            value={d.category || ''}
            onChange={(v) => set('category', v)}
            placeholder="19th Convocation"
          />
        </Field>
      </div>

      <Field label="Subtitle / Description">
        <Textarea
          value={d.subtitle || ''}
          onChange={(v) => set('subtitle', v)}
          placeholder="Welcoming the eminent dignitaries and visionary leaders..."
          rows={2}
        />
      </Field>

      <Divider label={`Dignitaries (${items.length})`} />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
          >
            {/* Top row with position buttons & remove */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                #{index + 1} {item.category || 'Guest'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-400 hover:text-red-600 ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dignitary Name" required>
                <Input
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, 'name', v)}
                  placeholder="e.g. Dr. Pradyuman Vaja"
                />
              </Field>
              <Field label="Category Title">
                <Input
                  value={item.category || ''}
                  onChange={(v) => updateItem(index, 'category', v)}
                  placeholder="e.g. The Chief Guest"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Role / Designation">
                <Input
                  value={item.role || ''}
                  onChange={(v) => updateItem(index, 'role', v)}
                  placeholder="e.g. Hon'ble Minister for Higher Education"
                />
              </Field>
              <Field label="Organization / Affiliation">
                <Input
                  value={item.organization || item.description || ''}
                  onChange={(v) => {
                    updateItem(index, 'organization', v);
                    updateItem(index, 'description', v);
                  }}
                  placeholder="e.g. Government of Gujarat"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cutout Portrait Image">
                <div className="flex gap-2">
                  <Input
                    value={item.image || ''}
                    onChange={(v) => updateItem(index, 'image', v)}
                    placeholder="/uploads/guest-cutout.png"
                  />
                  <button
                    type="button"
                    onClick={() => setActivePickerIdx(index)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0"
                  >
                    <ImageIcon size={12} />
                    Browse
                  </button>
                </div>
              </Field>
              <Field label="Profile Page URL">
                <Input
                  value={item.url || ''}
                  onChange={(v) => updateItem(index, 'url', v)}
                  placeholder="/chief-guest or #"
                />
              </Field>
            </div>

            {/* Image Preview thumbnail if available */}
            {item.image && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded border border-slate-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-contain bg-slate-100 rounded"
                />
                <span className="text-xs text-slate-500 truncate">{item.image}</span>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors bg-white"
        >
          <Plus size={14} /> Add Dignitary / Guest
        </button>
      </div>

      {activePickerIdx !== null && (
        <MediaPicker
          onSelect={(url) => {
            updateItem(activePickerIdx, 'image', url);
            setActivePickerIdx(null);
          }}
          onClose={() => setActivePickerIdx(null)}
          filter="image"
        />
      )}
    </div>
  );
}
