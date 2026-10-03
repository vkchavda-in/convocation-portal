'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea, Divider } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface NarrativeDividerData {
  headline: string;
  subheadline?: string;
  description?: string;
  images: string[];
  sectionLabel?: string;
  callout?: string;
  layoutVariant?: string;
  visualAnchorType?: string;
  /** Whether the inner crystal rotates. Default true. */
  rotateInner?: boolean;
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

export default function NarrativeDividerEditor({ data, onChange }: Props) {
  const d = data as NarrativeDividerData;
  const images = d.images || [];
  const [pickerOpen, setPickerOpen] = useState(false);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const removeImage = (i: number) => {
    set('images', images.filter((_, idx) => idx !== i));
  };

  const handlePickImage = (url: string) => {
    set('images', [...images, url]);
    setPickerOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Indicators & Labels */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Section Indicator/Label">
          <Input
            value={d.sectionLabel || ''}
            onChange={(v) => set('sectionLabel', v)}
            placeholder="e.g. Pillar 01, Milestone, Vision"
          />
        </Field>
        <Field label="Layout Variant">
          <Select
            value={d.layoutVariant || 'layered-story'}
            onChange={(v) => set('layoutVariant', v)}
            options={[
              { value: 'layered-story',        label: 'Layered Story (slanted strips)' },
              { value: 'fragmented-timeline',  label: 'Fragmented Timeline (shards)' },
              { value: 'leadership-mosaic',    label: 'Leadership Mosaic (grid)' },
              { value: 'institutional-pillar', label: 'Institutional Pillar (columns)' },
              { value: 'vision-chapter',       label: 'Vision Chapter (split-panorama)' }
            ]}
          />
        </Field>
      </div>

      {/* 2. Headline */}
      <Field label="Statement Headline" required>
        <Input
          value={d.headline || ''}
          onChange={(v) => set('headline', v)}
          placeholder="Internalizing Humanity and Purpose"
        />
      </Field>

      {/* 3. Supporting Narrative (Red text) */}
      <Field label="Supporting Narrative (VC Philosophy)">
        <Textarea
          value={d.subheadline || ''}
          onChange={(v) => set('subheadline', v)}
          placeholder="The leader before the Leader, whose intrinsic leadership philosophy..."
          rows={3}
        />
        <p className="text-[10px] text-slate-400 mt-0.5">Appears as highlighted red/gold text in the layout</p>
      </Field>

      {/* 4. Micro-description (Standard copy text) */}
      <Field label="Narrative Micro-description">
        <Textarea
          value={d.description || ''}
          onChange={(v) => set('description', v)}
          placeholder="Enter additional background details..."
          rows={4}
        />
      </Field>

      {/* 5. Key Insight/Callout */}
      <Field label="Key Insight / Callout Text">
        <Input
          value={d.callout || ''}
          onChange={(v) => set('callout', v)}
          placeholder="e.g. 'A legacy of transformation.'"
        />
      </Field>

      {/* 6. Images */}
      <Divider label={`Images (${images.length})`} />

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {images.map((imgUrl, i) => (
            <div key={i} className="relative group aspect-square bg-slate-100 rounded overflow-hidden border border-slate-200">
              <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center bg-white"
      >
        <Plus className="w-3 h-3" /> Add Image
      </button>

      {pickerOpen && (
        <MediaPicker
          onSelect={handlePickImage}
          onClose={() => setPickerOpen(false)}
          filter="image"
        />
      )}
    </div>
  );
}
