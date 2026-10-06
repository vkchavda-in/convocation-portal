'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Field, Input, Divider, Select, Textarea } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface GalleryCategory { id: string; label: string; }
interface GalleryImage { url: string; alt: string; category?: string; hidden?: boolean; }
interface GalleryData {
  title: string;
  subtitle?: string;
  category?: string;
  titleAlignment?: string;
  categories: GalleryCategory[];
  images: GalleryImage[];
  variant?: 'grid' | 'slider';
}
interface Props { data: object; onChange: (d: object) => void; }

export default function GalleryEditor({ data, onChange }: Props) {
  const d = data as GalleryData;
  const categories = d.categories || [];
  const images = d.images || [];
  const [pickerOpen, setPickerOpen] = useState(false);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const updateCat = (i: number, key: string, value: string) => {
    const nc = [...categories];
    nc[i] = { ...nc[i], [key]: value };
    set('categories', nc);
  };
  const addCat = () => set('categories', [...categories, { id: `cat-${Date.now()}`, label: 'Category' }]);
  const removeCat = (i: number) => set('categories', categories.filter((_, idx) => idx !== i));

  const updateImage = (i: number, key: string, value: unknown) => {
    const ni = [...images];
    ni[i] = { ...ni[i], [key]: value };
    set('images', ni);
  };
  const removeImage = (i: number) => set('images', images.filter((_, idx) => idx !== i));
  const handlePickImage = (url: string) => {
    const defaultCat = categories.length > 0 ? categories[0].id : 'all';
    set('images', [...images, { url, alt: '', category: defaultCat }]);
    setPickerOpen(false);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.label || c.id })),
  ];

  return (
    <div className="space-y-4">
      <Field label="Section Subtitle / Eyebrow">
        <Input value={d.category || ''} onChange={(v) => set('category', v)} placeholder="e.g. Photo Gallery" />
      </Field>

      <Field label="Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Gallery" />
      </Field>

      <Field label="Description">
        <Textarea value={d.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="Gallery description" />
      </Field>

      <Field label="Title Alignment">
        <Select
          value={d.titleAlignment || 'center'}
          onChange={(v) => set('titleAlignment', v)}
          options={[
            { value: 'center', label: 'Center (Default)' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Field>

      <Field label="Layout Variant">
        <Select
          value={d.variant || 'grid'}
          onChange={(v) => set('variant', v)}
          options={[
            { value: 'grid', label: 'Grid (Standard Masonry)' },
            { value: 'slider', label: 'Slider (Smooth Infinite Marquee)' },
          ]}
        />
      </Field>

      <Divider label="Categories" />
      <div className="space-y-1.5">
        {categories.map((cat, i) => (
          <div key={i} className="flex gap-2">
            <Input value={cat.id} onChange={(v) => updateCat(i, 'id', v)} placeholder="id (no spaces)" />
            <Input value={cat.label} onChange={(v) => updateCat(i, 'label', v)} placeholder="Label" />
            <button onClick={() => removeCat(i)} className="p-1.5 text-slate-300 hover:text-red-600 rounded flex-shrink-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <button onClick={addCat} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center cursor-pointer">
          <Plus className="w-3 h-3" /> Add Category
        </button>
      </div>

      <Divider label={`Images (${images.length})`} />
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
          {images.map((img, i) => (
            <div key={i} className={`relative group p-2 rounded-lg border border-slate-200 bg-white transition-opacity ${img.hidden ? 'opacity-50' : ''}`}>
              <div className="aspect-video bg-slate-100 rounded overflow-hidden border border-slate-200 relative mb-2">
                {img.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                )}
                {/* Top-left: hide toggle */}
                <button
                  onClick={() => updateImage(i, 'hidden', !img.hidden)}
                  className="absolute top-1 left-1 p-1 bg-white/80 text-slate-600 hover:text-slate-900 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                  title={img.hidden ? 'Show image' : 'Hide image'}
                >
                  {img.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                {/* Top-right: delete */}
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  title="Remove Image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={img.alt || ''}
                  onChange={(e) => updateImage(i, 'alt', e.target.value)}
                  placeholder="Alt text"
                  className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Category</label>
                  <Select
                    value={img.category || (categories.length > 0 ? categories[0].id : 'all')}
                    onChange={(v) => updateImage(i, 'category', v)}
                    options={categoryOptions}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center cursor-pointer"
      >
        <Plus className="w-3 h-3" /> Add Image from Media Library
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
