'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, FolderPlus, ImageIcon, ArrowRightLeft, Folder } from 'lucide-react';
import { Field, Input, Divider, Select, Textarea } from './HeroEditor';
import MediaPicker from '../MediaPicker';

interface GalleryCategory {
  id: string;
  label: string;
}

interface GalleryImage {
  id?: string;
  url: string;
  alt?: string;
  title?: string;
  category?: string;
  hidden?: boolean;
}

interface GalleryData {
  title: string;
  subtitle?: string;
  category?: string;
  titleAlignment?: string;
  categories: GalleryCategory[];
  images: GalleryImage[];
  variant?: 'grid' | 'slider';
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

export default function GalleryEditor({ data, onChange }: Props) {
  const d = data as GalleryData;
  const categories = (d.categories || []).filter((c) => c.id && c.id !== 'all');
  const images = d.images || [];

  // Tracks which category group opened the MediaPicker
  const [activeCategoryForPicker, setActiveCategoryForPicker] = useState<string | null>(null);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  // Add new category
  const addCategory = () => {
    const newId = `category-${Date.now()}`;
    const newCat: GalleryCategory = { id: newId, label: 'New Category' };
    set('categories', [...categories, newCat]);
  };

  // Update category metadata
  const updateCategory = (index: number, key: keyof GalleryCategory, value: string) => {
    const nextCategories = [...categories];
    const oldId = nextCategories[index].id;
    nextCategories[index] = { ...nextCategories[index], [key]: value };

    // If ID changed, also update all associated images' category field
    if (key === 'id' && oldId !== value) {
      const nextImages = images.map((img) =>
        img.category === oldId ? { ...img, category: value } : img
      );
      onChange({ ...d, categories: nextCategories, images: nextImages });
      return;
    }

    set('categories', nextCategories);
  };

  // Remove category and optionally reassign or delete its images
  const removeCategory = (index: number) => {
    const catToRemove = categories[index];
    const nextCategories = categories.filter((_, idx) => idx !== index);
    const remainingCatId = nextCategories.length > 0 ? nextCategories[0].id : 'all';
    
    // Reassign images from the deleted category to the first remaining category
    const nextImages = images.map((img) =>
      img.category === catToRemove.id ? { ...img, category: remainingCatId } : img
    );

    onChange({ ...d, categories: nextCategories, images: nextImages });
  };

  // Add multiple images into a specific category group
  const handleAddImagesToCategory = (urls: string[], categoryId: string) => {
    const newImageItems: GalleryImage[] = urls.map((url) => {
      // Derive a default clean title from the filename
      const filename = url.split('/').pop()?.split('.')[0] || '';
      const cleanTitle = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url,
        alt: cleanTitle,
        title: cleanTitle,
        category: categoryId,
        hidden: false
      };
    });

    set('images', [...images, ...newImageItems]);
    setActiveCategoryForPicker(null);
  };

  // Update individual image
  const updateImageByIndex = (globalIndex: number, key: keyof GalleryImage, value: unknown) => {
    const nextImages = [...images];
    nextImages[globalIndex] = { ...nextImages[globalIndex], [key]: value };
    set('images', nextImages);
  };

  // Remove individual image
  const removeImageByIndex = (globalIndex: number) => {
    const nextImages = images.filter((_, idx) => idx !== globalIndex);
    set('images', nextImages);
  };

  // Category dropdown options for moving images
  const categoryOptions = (() => {
    const list: { value: string; label: string }[] = [];
    const seen = new Set<string>();

    categories.forEach((c) => {
      const val = c.id || '';
      if (val && !seen.has(val)) {
        seen.add(val);
        list.push({ value: val, label: c.label || val });
      }
    });

    if (!seen.has('all')) {
      list.push({ value: 'all', label: 'All / General' });
    }
    return list;
  })();

  // Group images by category ID
  const knownCategoryIds = new Set(categories.map((c) => c.id));
  const uncategorizedImages = images
    .map((img, idx) => ({ img, globalIndex: idx }))
    .filter(({ img }) => !img.category || !knownCategoryIds.has(img.category));

  return (
    <div className="space-y-5">
      {/* ── General Section Settings ────────────────────────────────────── */}
      <Field label="Section Eyebrow / Tag">
        <Input
          value={d.category || ''}
          onChange={(v) => set('category', v)}
          placeholder="e.g. Photo Gallery"
        />
      </Field>

      <Field label="Section Title" required>
        <Input
          value={d.title || ''}
          onChange={(v) => set('title', v)}
          placeholder="e.g. Moments & Milestones"
        />
      </Field>

      <Field label="Description / Subtitle">
        <Textarea
          value={d.subtitle || ''}
          onChange={(v) => set('subtitle', v)}
          placeholder="Gallery description or historical context"
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <Divider label={`Category Groups (${categories.length}) • Total Photos (${images.length})`} />

      {/* ── Category Groups List ────────────────────────────────────────── */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => {
          const catImages = images
            .map((img, idx) => ({ img, globalIndex: idx }))
            .filter(({ img }) => img.category === cat.id);

          return (
            <div
              key={cat.id || catIdx}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Category Group Header */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-w-0">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Group Display Name
                      </span>
                      <input
                        type="text"
                        value={cat.label || ''}
                        onChange={(e) => updateCategory(catIdx, 'label', e.target.value)}
                        placeholder="e.g. Ceremony Highlights"
                        className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Group Filter ID / Slug
                      </span>
                      <input
                        type="text"
                        value={cat.id || ''}
                        onChange={(e) => updateCategory(catIdx, 'id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        placeholder="e.g. ceremony"
                        className="w-full px-2.5 py-1 text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-600">
                    {catImages.length} {catImages.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCategory(catIdx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete this Category Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Group Body: Image Grid */}
              <div className="p-3.5 sm:p-4">
                {catImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3.5">
                    {catImages.map(({ img, globalIndex }) => (
                      <div
                        key={img.id || globalIndex}
                        className={`group relative rounded-xl border border-slate-200 bg-white p-2 overflow-hidden shadow-xs hover:border-amber-400 transition-all ${
                          img.hidden ? 'opacity-50 bg-slate-50' : ''
                        }`}
                      >
                        {/* Image Thumbnail */}
                        <div className="aspect-4/3 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200 mb-2">
                          {img.url ? (
                            <img
                              src={img.url}
                              alt={img.alt || img.title || 'Gallery image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}

                          {/* Visibility toggle button */}
                          <button
                            type="button"
                            onClick={() => updateImageByIndex(globalIndex, 'hidden', !img.hidden)}
                            className="absolute top-1 left-1 p-1 bg-white/90 text-slate-700 hover:text-slate-900 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title={img.hidden ? 'Show photo in gallery' : 'Hide photo'}
                          >
                            {img.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>

                          {/* Delete image button */}
                          <button
                            type="button"
                            onClick={() => removeImageByIndex(globalIndex)}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 text-white hover:bg-red-700 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove photo from group"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Title / Caption */}
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={img.title || img.alt || ''}
                            onChange={(e) => {
                              updateImageByIndex(globalIndex, 'title', e.target.value);
                              updateImageByIndex(globalIndex, 'alt', e.target.value);
                            }}
                            placeholder="Photo title / caption"
                            className="w-full px-2 py-1 text-[11px] text-slate-800 bg-slate-50/80 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-amber-500 font-medium truncate"
                          />

                          {/* Quick category move dropdown */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <ArrowRightLeft className="w-3 h-3 shrink-0" />
                            <select
                              value={img.category || cat.id}
                              onChange={(e) => updateImageByIndex(globalIndex, 'category', e.target.value)}
                              className="w-full text-[10px] bg-transparent border-0 text-slate-500 focus:outline-none cursor-pointer truncate font-medium"
                              title="Move to another category"
                            >
                              {categoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 mb-3">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500 font-medium">No photos in this group yet</p>
                    <p className="text-[10px] text-slate-400">
                      Click below to select and add multiple photos in one click
                    </p>
                  </div>
                )}

                {/* Batch Add Images Button for this Category */}
                <button
                  type="button"
                  onClick={() => setActiveCategoryForPicker(cat.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-amber-400/80 bg-amber-50/40 hover:bg-amber-50 text-amber-800 text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Add Photos to &ldquo;{cat.label || cat.id}&rdquo; (Multi-Select)</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* ── Uncategorized Images Group (If any exist) ────────────────────── */}
        {uncategorizedImages.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700">General / Unassigned Photos</h4>
                <p className="text-[10px] text-slate-400">These photos will appear under &ldquo;All Categories&rdquo;</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                {uncategorizedImages.length} Photos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {uncategorizedImages.map(({ img, globalIndex }) => (
                <div key={img.id || globalIndex} className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="aspect-4/3 bg-slate-100 rounded-lg overflow-hidden mb-1.5">
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </div>
                  <Select
                    value={img.category || 'all'}
                    onChange={(v) => updateImageByIndex(globalIndex, 'category', v)}
                    options={categoryOptions}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add New Category Group Button ─────────────────────────────── */}
        <button
          type="button"
          onClick={addCategory}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <FolderPlus className="w-4 h-4 text-blue-500" />
          <span>+ Create New Category Group</span>
        </button>
      </div>

      {/* ── Multi-Select Media Picker Dialog ───────────────────────────── */}
      {activeCategoryForPicker && (
        <MediaPicker
          allowMultiple={true}
          filter="image"
          onSelectMultiple={(urls) => {
            handleAddImagesToCategory(urls, activeCategoryForPicker);
          }}
          onSelect={(url) => {
            handleAddImagesToCategory([url], activeCategoryForPicker);
          }}
          onClose={() => setActiveCategoryForPicker(null)}
        />
      )}
    </div>
  );
}
