'use client';

import { Field, Input, Textarea, Toggle, Select } from './HeroEditor';
import MediaPicker from '../MediaPicker';
import { useState } from 'react';

interface QuoteData {
  quote: string;
  author: string;
  citation: string;
  category?: string;
  signature: string;
  image?: string;
  imageSize?: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  imagePosition?: 'left' | 'right';
  backgroundTheme?: 'parchment' | 'cream' | 'white';
  layout?: 'editorial' | 'simple' | 'split-flat' | 'card-testimonial';
  align?: 'left' | 'center';
  fontStyle?: 'serif' | 'sans';
  showAccents?: boolean;
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

export default function QuoteEditor({ data, onChange }: Props) {
  const d = data as QuoteData;
  const [sigPickerOpen, setSigPickerOpen] = useState(false);
  const [portraitPickerOpen, setPortraitPickerOpen] = useState(false);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  return (
    <div className="space-y-4">
      {/* 1. Category / Badge */}
      <Field label="Category / Section Badge">
        <Input
          value={d.category || ''}
          onChange={(v) => set('category', v)}
          placeholder="e.g. Director General's Message, President's Message"
        />
      </Field>

      {/* 2. Layout Selector */}
      <Field label="Layout Variant">
        <Select
          value={d.layout || 'editorial'}
          onChange={(v) => set('layout', v)}
          options={[
            { value: 'editorial', label: 'Clean Editorial (2-Column with portrait & quote)' },
            { value: 'simple', label: 'Simple Classic (Centered text, no portrait)' }
          ]}
        />
      </Field>

      {/* 3. Portrait Position (Left vs Right) */}
      {(d.layout !== 'simple') && (
        <Field label="Portrait Image Position">
          <Select
            value={d.imagePosition || 'left'}
            onChange={(v) => set('imagePosition', v)}
            options={[
              { value: 'left', label: 'Image on LEFT, Quote on RIGHT' },
              { value: 'right', label: 'Quote on LEFT, Image on RIGHT' }
            ]}
          />
        </Field>
      )}

      {/* 4. Portrait Image Selector */}
      {(d.layout !== 'simple') && (
        <>
          <Field label="Portrait Image (PNG/JPG)">
            <div className="flex gap-2">
              <Input value={d.image || ''} onChange={(v) => set('image', v)} placeholder="/assets/images/portrait.png" />
              <button
                type="button"
                onClick={() => setPortraitPickerOpen(true)}
                className="flex-shrink-0 px-2.5 py-1.5 text-[10px] border border-slate-200 rounded text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap bg-white"
              >
                Browse
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Pick a portrait photo of the dignitary</p>
          </Field>
          <Field label="Portrait Image Size">
            <Select
              value={d.imageSize || 'large'}
              onChange={(v) => set('imageSize', v)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large (Default)' },
                { value: 'xl', label: 'Extra Large (XL)' },
                { value: 'xxl', label: 'Double Extra Large (XXL)' }
              ]}
            />
          </Field>
        </>
      )}

      {/* 5. Background Theme */}
      <Field label="Background Tone">
        <Select
          value={d.backgroundTheme || 'parchment'}
          onChange={(v) => set('backgroundTheme', v)}
          options={[
            { value: 'parchment', label: 'Warm Parchment (Light #FEFCF8)' },
            { value: 'cream', label: 'Soft Cream (Light #F8FAFC)' },
            { value: 'white', label: 'Clean Pure White' }
          ]}
        />
      </Field>

      {/* 6. Font Style Option */}
      <Field label="Typography Style">
        <Select
          value={d.fontStyle || 'serif'}
          onChange={(v) => set('fontStyle', v)}
          options={[
            { value: 'serif', label: 'Editorial Serif (Playfair Display)' },
            { value: 'sans', label: 'Clean Modern Sans-Serif (Inter)' }
          ]}
        />
      </Field>

      {/* 7. Quote Text Field */}
      <Field label="Quote Text" required>
        <Textarea
          value={d.quote || ''}
          onChange={(v) => set('quote', v)}
          placeholder="Enter the quote text…"
          rows={4}
          maxLength={600}
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Characters: {(d.quote || '').length}/600
        </p>
      </Field>

      {/* 8. Author Name */}
      <Field label="Author">
        <Input value={d.author || ''} onChange={(v) => set('author', v)} placeholder="Dr. Mahendra Sharma" />
      </Field>

      {/* 9. Citation / Title */}
      <Field label="Citation / Title">
        <Input value={d.citation || ''} onChange={(v) => set('citation', v)} placeholder="Pro-Chancellor & Director General, Ganpat University" />
      </Field>

      {/* 10. Signature Selector */}
      <Field label="Signature Image (PNG)">
        <div className="flex gap-2">
          <Input value={d.signature || ''} onChange={(v) => set('signature', v)} placeholder="/assets/images/signature.png" />
          <button
            type="button"
            onClick={() => setSigPickerOpen(true)}
            className="flex-shrink-0 px-2.5 py-1.5 text-[10px] border border-slate-200 rounded text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap bg-white"
          >
            Browse
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Pick a transparent PNG image representing the signature</p>
      </Field>

      {/* Media Pickers */}
      {sigPickerOpen && (
        <MediaPicker
          onSelect={(url) => { set('signature', url); setSigPickerOpen(false); }}
          onClose={() => setSigPickerOpen(false)}
          filter="image"
        />
      )}

      {portraitPickerOpen && (
        <MediaPicker
          onSelect={(url) => { set('image', url); setPortraitPickerOpen(false); }}
          onClose={() => setPortraitPickerOpen(false)}
          filter="image"
        />
      )}
    </div>
  );
}
