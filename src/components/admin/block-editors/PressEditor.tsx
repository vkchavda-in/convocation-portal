'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import type { PressBlockData, PressItem } from '@/types/cms';
import { Field, Input, Textarea, Select, Divider } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface PressEditorProps {
  data: PressBlockData;
  onChange: (d: PressBlockData) => void;
}

const EMPTY_ITEM: PressItem = {
  imageUrl: '', category: '', headline: '', subheadline: '', publication: '', date: '', url: '',
};

export default function PressEditor({ data: d, onChange }: PressEditorProps) {
  const [pickerIdx,  setPickerIdx]  = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const set = <K extends keyof PressBlockData>(key: K, value: PressBlockData[K]) =>
    onChange({ ...d, [key]: value });

  const items: PressItem[] = d.items || [];

  const addItem = () => {
    onChange({ ...d, items: [...items, { ...EMPTY_ITEM }] });
    setExpandedIdx(items.length); // auto-expand new item
  };

  const removeItem = (i: number) => {
    const next = [...items];
    next.splice(i, 1);
    onChange({ ...d, items: next });
    if (expandedIdx === i) setExpandedIdx(null);
  };

  const updateItem = (i: number, key: keyof PressItem, value: any) => {
    const next = items.map((it, idx) => idx === i ? { ...it, [key]: value } : it);
    onChange({ ...d, items: next });
  };

  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...d, items: next });
    setExpandedIdx(j);
  };

  return (
    <div className="space-y-4">

      {/* ── Section settings ── */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <Field label="Section Label">
          <Input value={d.sectionLabel || ''} onChange={(v) => set('sectionLabel', v)}
            placeholder="e.g. Press Coverage" />
        </Field>
        <Field label="Display Variant">
          <Select
            value={d.variant || 'features'}
            onChange={(v) => set('variant', v as PressBlockData['variant'])}
            options={[
              { value: 'features',          label: 'Features Grid (2-col editorial)' },
              { value: 'marquee',           label: 'Marquee (auto-scroll ticker)' },
              { value: 'deck',              label: 'Deck (card browser)' },
              { value: 'editorial',         label: 'Editorial (featured + rail)' },
              { value: 'magazine-grid',     label: 'Magazine Grid (columns)' },
              { value: 'newspaper-row',     label: 'Newspaper Row (list)' },
              { value: 'featured-carousel', label: 'Featured Carousel (focused guide)' },
              { value: 'layered-deck',      label: 'Layered Deck (3D stacked peel)' },
            ]}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Section Headline (optional)">
            <Input value={d.headline || ''} onChange={(v) => set('headline', v)}
              placeholder="As Featured In" />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Section Subheadline (optional)">
            <Input value={d.subheadline || ''} onChange={(v) => set('subheadline', v)}
              placeholder="Across national and international media" />
          </Field>
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-1">
          <input
            id="press-enable-zoom"
            type="checkbox"
            checked={d.enableZoom !== false}
            onChange={(e) => set('enableZoom', e.target.checked)}
            className="w-3.5 h-3.5 accent-amber-700 cursor-pointer"
          />
          <label htmlFor="press-enable-zoom" className="font-sans text-[11px] text-slate-600 cursor-pointer select-none">
            Enable click-to-zoom (opens full-screen lightbox for reading)
          </label>
        </div>
      </div>

      {/* ── Press items ── */}
      <Divider label={`Press Items (${items.length})`} />
      <p className="text-[10px] text-slate-400 -mt-2">
        Each item maps to one magazine / newspaper spread. Category + Headline + Subheadline appear as text above the spread image.
      </p>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = expandedIdx === i;
          const title  = item.headline || item.publication || `Item ${i + 1}`;

          return (
            <div key={i} className={`border border-slate-200 rounded-lg overflow-hidden bg-white transition-opacity ${item.hidden ? 'opacity-60' : ''}`}>
              {/* Collapsed header row */}
              <div
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
                onClick={() => setExpandedIdx(isOpen ? null : i)}
              >
                {/* Thumbnail */}
                <div
                  className="w-12 h-8 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-300 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setPickerIdx(i); }}
                  title="Click to pick image"
                >
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full"><ImageIcon className="w-3 h-3 text-slate-400" /></div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-sans text-[11px] font-semibold text-slate-700 truncate block">{title}{item.hidden && <span className="ml-1 text-[9px] text-slate-400 font-normal">(hidden)</span>}</span>
                  {item.category && <span className="font-sans text-[9px] italic text-slate-400 truncate block">{item.category}</span>}
                </div>

                {/* Reorder + hide + remove */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button type="button" onClick={(e) => { e.stopPropagation(); updateItem(i, 'hidden', !item.hidden); }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title={item.hidden ? 'Show item' : 'Hide item'}>
                    {item.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(i, -1); }} disabled={i === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveItem(i, 1); }} disabled={i === items.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                    className="p-1 text-red-400 hover:text-red-600 ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className={`ml-1 text-slate-400 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>

              {/* Expanded fields */}
              {isOpen && (
                <div className="p-3 space-y-2">
                  {/* Image picker trigger */}
                  <div
                    className="flex items-center gap-3 p-2 bg-slate-50 border border-dashed border-slate-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    onClick={() => setPickerIdx(i)}
                  >
                    <div className="w-16 h-10 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="flex items-center justify-center h-full"><ImageIcon className="w-4 h-4 text-slate-400" /></div>
                      }
                    </div>
                    <span className="font-sans text-[10px] text-slate-500">
                      {item.imageUrl ? 'Change spread image' : 'Pick spread image (magazine cover + article page)'}
                    </span>
                  </div>

                  {/* Text fields: what appears above the spread in the layout */}
                  <div className="rounded border border-slate-100 p-2 bg-slate-50/50 space-y-2">
                    <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      TEXT SHOWN ABOVE SPREAD IMAGE
                    </p>
                    <Field label="Category (italic, small — e.g. 'Empowering Futures')">
                      <Input value={item.category || ''} onChange={(v) => updateItem(i, 'category', v)}
                        placeholder="e.g. Transformational Leadership" />
                    </Field>
                    <Field label="Headline (bold — e.g. 'Advanced Additive Manufacturing Suite')">
                      <Input value={item.headline || ''} onChange={(v) => updateItem(i, 'headline', v)}
                        placeholder="e.g. Revolutionizing Manufacturing with Advanced 3D Printing" />
                    </Field>
                    <Field label="Subheadline (normal — e.g. 'at Additive Manufacturing CoE')">
                      <Input value={item.subheadline || ''} onChange={(v) => updateItem(i, 'subheadline', v)}
                        placeholder="e.g. at Ganpat University, Gujarat" />
                    </Field>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Publication Name">
                      <Input value={item.publication || ''} onChange={(v) => updateItem(i, 'publication', v)}
                        placeholder="e.g. BW BusinessWorld" />
                    </Field>
                    <Field label="Issue Date">
                      <Input value={item.date || ''} onChange={(v) => updateItem(i, 'date', v)}
                        placeholder="e.g. May 2023" />
                    </Field>
                  </div>
                  <Field label="Article URL (optional)">
                    <Input value={item.url || ''} onChange={(v) => updateItem(i, 'url', v)}
                      placeholder="https://..." />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" onClick={addItem}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center bg-white">
        <Plus className="w-3 h-3" /> Add Press Feature
      </button>

      {pickerIdx !== null && (
        <MediaPicker
          onSelect={(url: string) => { updateItem(pickerIdx, 'imageUrl', url); setPickerIdx(null); }}
          onClose={() => setPickerIdx(null)}
          filter="image"
        />
      )}
    </div>
  );
}
