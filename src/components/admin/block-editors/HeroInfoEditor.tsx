'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Award } from 'lucide-react';
import { Field, Input, Textarea, Divider } from './HeroEditor';

interface HeroStat {
  value: string;
  label: string;
  icon: string;
}

interface HeroInfoData {
  title?: string;
  tagline?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: { label: string; url: string };
  secondaryCTA?: { label: string; url: string };
  heroStats?: HeroStat[];
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

export default function HeroInfoEditor({ data, onChange }: Props) {
  const d = data as HeroInfoData;
  const stats = d.heroStats || [];

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const updateStat = (index: number, key: keyof HeroStat, value: string) => {
    const next = [...stats];
    next[index] = { ...next[index], [key]: value };
    set('heroStats', next);
  };

  const addStat = () => {
    const next = [
      ...stats,
      { value: 'New Stat', label: 'Description', icon: 'Star' },
    ];
    set('heroStats', next);
  };

  const removeStat = (index: number) => {
    const next = stats.filter((_, idx) => idx !== index);
    set('heroStats', next);
  };

  const moveStat = (from: number, to: number) => {
    if (to < 0 || to >= stats.length) return;
    const next = [...stats];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set('heroStats', next);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Main Banner Content
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tagline / Badge" hint="e.g. Ganpat University">
            <Input
              value={d.tagline || ''}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="Ganpat University"
            />
          </Field>

          <Field label="Subtitle / Date Highlight" hint="e.g. January 8, 2026 • 4:30 PM onwards">
            <Input
              value={d.subtitle || ''}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder="January 8, 2026 • 4:30 PM onwards"
            />
          </Field>
        </div>

        <Field label="Main Title" hint="Primary heading of the hero info block">
          <Input
            value={d.title || ''}
            onChange={(e) => set('title', e.target.value)}
            placeholder="19th Convocation"
          />
        </Field>

        <Field label="Description" hint="Supporting paragraph text">
          <Textarea
            value={d.description || ''}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Celebrating the dedication, persistence and academic triumphs..."
          />
        </Field>
      </div>

      <Divider />

      {/* Call to Actions */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Call to Action Buttons
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-amber-400">Primary Button (Gold)</p>
            <Field label="Button Label">
              <Input
                value={d.primaryCTA?.label || ''}
                onChange={(e) =>
                  set('primaryCTA', {
                    ...d.primaryCTA,
                    label: e.target.value,
                  })
                }
                placeholder="Invitation details"
              />
            </Field>
            <Field label="Button Link URL">
              <Input
                value={d.primaryCTA?.url || ''}
                onChange={(e) =>
                  set('primaryCTA', {
                    ...d.primaryCTA,
                    url: e.target.value,
                  })
                }
                placeholder="/19th-convocation-3"
              />
            </Field>
          </div>

          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-300">Secondary Button (White Outline)</p>
            <Field label="Button Label">
              <Input
                value={d.secondaryCTA?.label || ''}
                onChange={(e) =>
                  set('secondaryCTA', {
                    ...d.secondaryCTA,
                    label: e.target.value,
                  })
                }
                placeholder="Logistics & Schedule"
              />
            </Field>
            <Field label="Button Link URL">
              <Input
                value={d.secondaryCTA?.url || ''}
                onChange={(e) =>
                  set('secondaryCTA', {
                    ...d.secondaryCTA,
                    url: e.target.value,
                  })
                }
                placeholder="/convocation-schedule"
              />
            </Field>
          </div>
        </div>
      </div>

      <Divider />

      {/* Key Info / Quick Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Quick Info Cards (Right Column)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlight key facts, time, date, or graduating batch.
            </p>
          </div>
          <button
            type="button"
            onClick={addStat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>

        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Award size={14} className="text-amber-400" />
                  Card #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStat(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStat(idx, idx + 1)}
                    disabled={idx === stats.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    className="p-1 text-red-400/70 hover:text-red-400 ml-2"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Main Highlight" hint="e.g. 8th Jan / 4:30 PM">
                  <Input
                    value={stat.value || ''}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                    placeholder="8th Jan"
                  />
                </Field>
                <Field label="Label" hint="e.g. Ceremony Date">
                  <Input
                    value={stat.label || ''}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    placeholder="Ceremony Date"
                  />
                </Field>
                <Field label="Icon Name" hint="Lucide icon name (e.g. Calendar, Clock, GraduationCap, Award, MapPin)">
                  <Input
                    value={stat.icon || ''}
                    onChange={(e) => updateStat(idx, 'icon', e.target.value)}
                    placeholder="Calendar"
                  />
                </Field>
              </div>
            </div>
          ))}

          {stats.length === 0 && (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              No info cards added yet. Click &quot;Add Card&quot; to highlight ceremony metadata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
