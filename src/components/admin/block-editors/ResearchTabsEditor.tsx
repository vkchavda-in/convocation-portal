'use client';

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Field, Input, Textarea, Divider } from './HeroEditor';

interface ResearchAreaItem {
  title: string;
  desc: string;
}

interface ResearchDomainItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  areas: ResearchAreaItem[];
}

interface ResearchTabsBlockData {
  title?: string;
  subtitle?: string;
  domains: ResearchDomainItem[];
}

interface Props { data: object; onChange: (d: object) => void; }

export default function ResearchTabsEditor({ data, onChange }: Props) {
  const d = data as ResearchTabsBlockData;
  const domains = d.domains || [];

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const addDomain = () => {
    const nextId = `domain_${Date.now()}`;
    const newDomain: ResearchDomainItem = {
      id: nextId,
      title: 'New Domain',
      icon: 'FlaskConical',
      color: '#1556B2',
      description: '',
      areas: [{ title: 'Area 1', desc: 'Description of area 1' }]
    };
    set('domains', [...domains, newDomain]);
  };

  const updateDomain = (idx: number, key: keyof ResearchDomainItem, value: unknown) => {
    const nd = [...domains];
    nd[idx] = { ...nd[idx], [key]: value } as ResearchDomainItem;
    set('domains', nd);
  };

  const removeDomain = (idx: number) => {
    set('domains', domains.filter((_, i) => i !== idx));
  };

  const moveDomain = (idx: number, dir: 'up' | 'down') => {
    const nd = [...domains];
    const ti = dir === 'up' ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= nd.length) return;
    [nd[idx], nd[ti]] = [nd[ti], nd[idx]];
    set('domains', nd);
  };

  const addArea = (dIdx: number) => {
    const nd = [...domains];
    const areas = [...(nd[dIdx].areas || [])];
    areas.push({ title: 'New Area', desc: '' });
    nd[dIdx] = { ...nd[dIdx], areas };
    set('domains', nd);
  };

  const updateArea = (dIdx: number, aIdx: number, key: keyof ResearchAreaItem, value: string) => {
    const nd = [...domains];
    const areas = [...(nd[dIdx].areas || [])];
    areas[aIdx] = { ...areas[aIdx], [key]: value };
    nd[dIdx] = { ...nd[dIdx], areas };
    set('domains', nd);
  };

  const removeArea = (dIdx: number, aIdx: number) => {
    const nd = [...domains];
    const areas = (nd[dIdx].areas || []).filter((_, i) => i !== aIdx);
    nd[dIdx] = { ...nd[dIdx], areas };
    set('domains', nd);
  };

  return (
    <div className="space-y-4">
      <Field label="Section Title">
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Research Areas" />
      </Field>
      <Field label="Section Subtitle">
        <Input value={d.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="Subtitle text" />
      </Field>

      <Divider label={`Domains (${domains.length})`} />
      <div className="space-y-4">
        {domains.map((dom, dIdx) => (
          <div key={dom.id || dIdx} className="border border-slate-200 rounded p-4 bg-slate-50 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOMAIN {dIdx + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveDomain(dIdx, 'up')} disabled={dIdx === 0} className="p-0.5 text-slate-350 hover:text-slate-650 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveDomain(dIdx, 'down')} disabled={dIdx === domains.length - 1} className="p-0.5 text-slate-350 hover:text-slate-650 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeDomain(dIdx)} className="p-0.5 text-slate-350 hover:text-red-650"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field label="ID (Slug)" required>
                <Input value={dom.id || ''} onChange={(v) => updateDomain(dIdx, 'id', v)} placeholder="polymer_am" />
              </Field>
              <Field label="Title" required>
                <Input value={dom.title || ''} onChange={(v) => updateDomain(dIdx, 'title', v)} placeholder="Polymer Base AM" />
              </Field>
              <Field label="Icon" required>
                <Input value={dom.icon || ''} onChange={(v) => updateDomain(dIdx, 'icon', v)} placeholder="FlaskConical" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Color Theme">
                <Input value={dom.color || ''} onChange={(v) => updateDomain(dIdx, 'color', v)} placeholder="#1556B2" />
              </Field>
              <Field label="Description">
                <Input value={dom.description || ''} onChange={(v) => updateDomain(dIdx, 'description', v)} placeholder="Brief description of domain" />
              </Field>
            </div>

            {/* Areas list */}
            <div className="pl-4 border-l-2 border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 mb-1">RESEARCH AREAS</div>
              {(dom.areas || []).map((area, aIdx) => (
                <div key={aIdx} className="bg-white p-3 rounded border border-slate-100 space-y-2 relative">
                  <button
                    onClick={() => removeArea(dIdx, aIdx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-[10px] font-semibold"
                  >
                    Delete Area
                  </button>
                  <Field label="Area Title">
                    <Input
                      value={area.title}
                      onChange={(v) => updateArea(dIdx, aIdx, 'title', v)}
                      placeholder="e.g. Composite 3D Printing"
                    />
                  </Field>
                  <Field label="Area Description">
                    <Textarea
                      value={area.desc}
                      onChange={(v) => updateArea(dIdx, aIdx, 'desc', v)}
                      placeholder="Details of research area..."
                      rows={2}
                    />
                  </Field>
                </div>
              ))}
              <button
                onClick={() => addArea(dIdx)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded font-medium text-[10px] transition-colors"
              >
                + Add Research Area
              </button>
            </div>

          </div>
        ))}
        <button
          onClick={addDomain}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded border border-dashed border-slate-300 font-semibold text-xs transition-colors"
        >
          + Add Research Domain Tab
        </button>
      </div>
    </div>
  );
}
