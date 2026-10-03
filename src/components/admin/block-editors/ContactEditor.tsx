'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Field, Input, Textarea, Select, Divider } from './HeroEditor';

interface ContactCategory { label: string; items: { icon?: string; label: string; value: string }[]; }
interface SocialLink { platform: string; url: string; }
interface ContactData { title: string; subtitle: string; categories: ContactCategory[]; socials: SocialLink[]; }
interface Props { data: object; onChange: (d: object) => void; }

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
];

export default function ContactEditor({ data, onChange }: Props) {
  const d = data as ContactData;
  const categories = d.categories || [];
  const socials = d.socials || [];
  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const updateCat = (ci: number, key: string, value: unknown) => {
    const nc = [...categories];
    nc[ci] = { ...nc[ci], [key]: value };
    set('categories', nc);
  };
  const addCat = () => set('categories', [...categories, { label: 'Contact', items: [] }]);
  const removeCat = (ci: number) => set('categories', categories.filter((_, i) => i !== ci));

  const updateCatItem = (ci: number, ii: number, key: string, value: string) => {
    const nc = [...categories];
    const ni = [...nc[ci].items];
    ni[ii] = { ...ni[ii], [key]: value };
    nc[ci] = { ...nc[ci], items: ni };
    set('categories', nc);
  };
  const addCatItem = (ci: number) => {
    const nc = [...categories];
    nc[ci] = { ...nc[ci], items: [...nc[ci].items, { label: '', value: '' }] };
    set('categories', nc);
  };
  const removeCatItem = (ci: number, ii: number) => {
    const nc = [...categories];
    nc[ci] = { ...nc[ci], items: nc[ci].items.filter((_, i) => i !== ii) };
    set('categories', nc);
  };

  const updateSocial = (i: number, key: string, value: string) => {
    const ns = [...socials];
    ns[i] = { ...ns[i], [key]: value };
    set('socials', ns);
  };
  const addSocial = () => set('socials', [...socials, { platform: 'linkedin', url: '' }]);
  const removeSocial = (i: number) => set('socials', socials.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Contact" />
      </Field>
      <Field label="Subtitle">
        <Textarea value={d.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="Get in touch…" rows={2} />
      </Field>

      <Divider label="Contact Categories" />
      <div className="space-y-3">
        {categories.map((cat, ci) => (
          <div key={ci} className="border border-slate-200 rounded p-3 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <Field label={`Category ${ci + 1} Label`}>
                <Input value={cat.label} onChange={(v) => updateCat(ci, 'label', v)} placeholder="Office" />
              </Field>
              <button onClick={() => removeCat(ci)} className="ml-2 mt-4 p-1 text-slate-300 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
            </div>
            <div className="space-y-1.5 mt-2">
              {cat.items.map((item, ii) => (
                <div key={ii} className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={item.icon || ''}
                    onChange={(e) => updateCatItem(ci, ii, 'icon', e.target.value)}
                    placeholder="Icon"
                    className="w-16 px-2 py-1.5 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateCatItem(ci, ii, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateCatItem(ci, ii, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button onClick={() => removeCatItem(ci, ii)} className="p-1 text-slate-300 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => addCatItem(ci)} className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded border border-dashed border-slate-200 hover:border-blue-300 w-full justify-center transition-all">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
          </div>
        ))}
        <button onClick={addCat} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center">
          <Plus className="w-3 h-3" /> Add Category
        </button>
      </div>

      <Divider label="Social Links" />
      <div className="space-y-2">
        {socials.map((social, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="w-36 flex-shrink-0">
              <Select
                value={social.platform}
                onChange={(v) => updateSocial(i, 'platform', v)}
                options={PLATFORMS}
              />
            </div>
            <Input value={social.url} onChange={(v) => updateSocial(i, 'url', v)} placeholder="https://…" />
            <button onClick={() => removeSocial(i)} className="p-1.5 text-slate-300 hover:text-red-600 rounded flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <button onClick={addSocial} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center">
          <Plus className="w-3 h-3" /> Add Social Link
        </button>
      </div>
    </div>
  );
}
