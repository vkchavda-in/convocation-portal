'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import type { MeetingsBlockData, MeetingItem } from '@/types/cms';
import { Field, Input, Divider, Select } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface MeetingsEditorProps {
  data: MeetingsBlockData;
  onChange: (d: MeetingsBlockData) => void;
}

const EMPTY_ITEM: MeetingItem = {
  title: '',
  dignitary: '',
  dignitaryRole: '',
  imageUrl: '',
  date: '',
};

export default function MeetingsEditor({ data: d, onChange }: MeetingsEditorProps) {
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const set = <K extends keyof MeetingsBlockData>(key: K, value: MeetingsBlockData[K]) =>
    onChange({ ...d, [key]: value });

  const items: MeetingItem[] = d.items || [];

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

  const updateItem = (i: number, key: keyof MeetingItem, value: any) => {
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
        <div className="col-span-2">
          <Field label="Layout Variant">
            <Select
              value={d.variant || 'columns-accordion'}
              onChange={(v) => set('variant', v as any)}
              options={[
                { value: 'columns-accordion', label: 'Cinematic Columns Accordion (Flexible expanding panels)' },
                { value: 'interactive-deck', label: 'Interactive Card Deck (Main card + selection stack)' },
                { value: 'editorial-mosaic', label: 'Asymmetric Editorial Mosaic (Clean staggered grid)' },
                { value: 'glass-tabs', label: 'Glass Tabs Showcase (Vertical tabs + active view)' },
                { value: 'panoramic-slider', label: 'Panoramic Banner Slider (Fade slides with thumbnail selectors)' },
                { value: 'split-slider', label: '60/40 Split Slider (Left slider + right details)' },
                { value: 'split-slider-reverse', label: '60/40 Split Slider Reverse (Left details + right slider)' },
                { value: 'masonry-log', label: 'Asymmetric Magazine Masonry (Grid board of different card shapes)' },
                { value: 'fading-cards', label: 'Fading Stacked Cards (Overlapping card deck cycling automatically)' },
                { value: 'deck-3d', label: '3D Card Swap Stack (Active card big/center, next 2 partially visible behind)' },
                { value: 'masonry-overlay', label: 'Minimal Masonry Overlay (Grid board with details overlaying bottom of photo)' }
              ]}
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Section Label">
            <Input
              value={d.sectionLabel || ''}
              onChange={(v) => set('sectionLabel', v)}
              placeholder="e.g. VIP ENGAGEMENTS"
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Section Headline (optional)">
            <Input
              value={d.headline || ''}
              onChange={(v) => set('headline', v)}
              placeholder="Important Meetings & Dialogues"
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Section Subheadline (optional)">
            <Input
              value={d.subheadline || ''}
              onChange={(v) => set('subheadline', v)}
              placeholder="Strategic sessions with national leaders and policymakers"
            />
          </Field>
        </div>
      </div>

      {/* ── Meetings items ── */}
      <Divider label={`Meetings (${items.length})`} />
      <p className="text-[10px] text-slate-400 -mt-2">
        Manage the VIP meetings. Each card renders in a clean vertical gallery row with a short tagline and details.
      </p>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = expandedIdx === i;
          const title = item.dignitary || item.title || `Meeting ${i + 1}`;

          return (
            <div key={i} className={`border border-slate-200 rounded-lg overflow-hidden transition-all bg-white ${item.hidden ? 'opacity-65 bg-slate-50' : ''}`}>
              {/* Collapsed header row */}
              <div
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
                onClick={() => setExpandedIdx(isOpen ? null : i)}
              >
                {/* Thumbnail */}
                <div
                  className="w-12 h-8 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPickerIdx(i);
                  }}
                  title="Click to pick image"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-sans text-[11px] font-semibold text-slate-700 truncate block">
                    {title} {item.hidden && '(HIDDEN)'}
                  </span>
                  {item.date && (
                    <span className="font-sans text-[9px] text-slate-400 block font-mono">
                      {item.date}
                    </span>
                  )}
                </div>

                {/* Reorder + remove */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateItem(i, 'hidden', !item.hidden);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title={item.hidden ? "Show item" : "Hide item"}
                  >
                    {item.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveItem(i, -1);
                    }}
                    disabled={i === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveItem(i, 1);
                    }}
                    disabled={i === items.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-25"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(i);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className={`ml-1 text-slate-400 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
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
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-sans text-[10px] text-slate-500">
                      {item.imageUrl ? 'Change meeting image' : 'Pick meeting image'}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Dignitary Name" required>
                      <Input
                        value={item.dignitary || ''}
                        onChange={(v) => updateItem(i, 'dignitary', v)}
                        placeholder="e.g. PM Narendra Modi"
                      />
                    </Field>
                    <Field label="Dignitary Role / Title">
                      <Input
                        value={item.dignitaryRole || ''}
                        onChange={(v) => updateItem(i, 'dignitaryRole', v)}
                        placeholder="e.g. Prime Minister of India"
                      />
                    </Field>
                    <Field label="Date / Year">
                      <Input
                        value={item.date || ''}
                        onChange={(v) => updateItem(i, 'date', v)}
                        placeholder="e.g. 2018"
                      />
                    </Field>
                    <Field label="Category / Sub-Section (optional)">
                      <Input
                        value={item.category || ''}
                        onChange={(v) => updateItem(i, 'category', v)}
                        placeholder="e.g. National Leadership"
                      />
                    </Field>
                  </div>

                  <Field label="Short Dialogue Tagline (less text-heavy)" required>
                    <Input
                      value={item.title || ''}
                      onChange={(v) => updateItem(i, 'title', v)}
                      placeholder="e.g. Strategic dialogue aligning skill development frameworks."
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center bg-white"
      >
        <Plus className="w-3 h-3" /> Add Meeting Item
      </button>

      {pickerIdx !== null && (
        <MediaPicker
          onSelect={(url: string) => {
            updateItem(pickerIdx, 'imageUrl', url);
            setPickerIdx(null);
          }}
          onClose={() => setPickerIdx(null)}
          filter="image"
        />
      )}
    </div>
  );
}
