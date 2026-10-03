'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Layers,
  GraduationCap,
  Award,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import MediaPicker from '../MediaPicker';
import { Field, Input } from './HeroEditor';
import { AwardeesStatsBlockData, StatCategoryItem } from '@/types/cms';

interface Props {
  data: object;
  onChange: (d: object) => void;
}

const VARIANTS = [
  { id: 'balanced-split',     name: '1. Executive Balanced Split (Classic 2-Column)' },
  { id: 'glass-cards',        name: '2. Glassmorphic Metric Cards (Live Gender Ratios)' },
  { id: 'editorial-compact',  name: '3. Editorial Luxe & Monument Pillar (Playfair Serif)' },
  { id: 'monolith-counter',   name: '4. Monolith Counter (Dramatic Full-Width Infographic)' },
  { id: 'split-stat-panels',  name: '5. Split Stat Panels (Dark Navy Left + Dense Grid Right)' },
  { id: 'cinematic-timeline', name: '6. Cinematic Timeline (ISRO / Railway Station Rail Style)' },
];

const DEFAULT_DEGREES: StatCategoryItem[] = [
  { label: 'RESEARCH', count: 32, percentage: '0.7%' },
  { label: 'POST GRADUATE', count: 889, percentage: '18.8%' },
  { label: 'PG DIPLOMA', count: 20, percentage: '0.4%' },
  { label: 'UNDER GRADUATE', count: 2277, percentage: '48.1%' },
  { label: 'DIPLOMA', count: 1511, percentage: '32.0%' },
];

const DEFAULT_FACULTIES: StatCategoryItem[] = [
  { label: 'ENGG. & TECHNOLOGY', count: 2633, percentage: '55.7%' },
  { label: 'COMPUTER APPLICATIONS', count: 995, percentage: '21.0%' },
  { label: 'MANAGEMENT STUDIES', count: 477, percentage: '10.1%' },
  { label: 'SCIENCE', count: 355, percentage: '7.5%' },
  { label: 'PHARMACY', count: 125, percentage: '2.6%' },
  { label: 'AGRICULTURE, ALLIED SCIENCES & TECH', count: 62, percentage: '1.3%' },
  { label: 'SOCIAL SCIENCE & HUMANITIES', count: 60, percentage: '1.3%' },
  { label: 'ARCHITECTURE DESIGN & PLANNING', count: 22, percentage: '0.5%' },
];

export default function AwardeesStatsEditor({ data, onChange }: Props) {
  const d = data as AwardeesStatsBlockData;
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [degreesOpen, setDegreesOpen] = useState(true);
  const [facultiesOpen, setFacultiesOpen] = useState(true);

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const currentVariant = d.variant || 'balanced-split';

  const degrees: StatCategoryItem[] = d.degrees && d.degrees.length > 0 ? d.degrees : DEFAULT_DEGREES;
  const faculties: StatCategoryItem[] = d.faculties && d.faculties.length > 0 ? d.faculties : DEFAULT_FACULTIES;

  // Degrees Handlers
  const handleUpdateDegree = (index: number, field: keyof StatCategoryItem, val: string | number) => {
    const updated = [...degrees];
    updated[index] = { ...updated[index], [field]: val };
    set('degrees', updated);
  };

  const handleAddDegree = () => {
    const newItem: StatCategoryItem = { label: 'NEW PROGRAM LEVEL', count: 100, percentage: '2.5%' };
    set('degrees', [...degrees, newItem]);
  };

  const handleDeleteDegree = (index: number) => {
    set('degrees', degrees.filter((_, i) => i !== index));
  };

  // Faculties Handlers
  const handleUpdateFaculty = (index: number, field: keyof StatCategoryItem, val: string | number) => {
    const updated = [...faculties];
    updated[index] = { ...updated[index], [field]: val };
    set('faculties', updated);
  };

  const handleAddFaculty = () => {
    const newItem: StatCategoryItem = { label: 'NEW FACULTY / SCHOOL', count: 150, percentage: '3.0%' };
    set('faculties', [...faculties, newItem]);
  };

  const handleDeleteFaculty = (index: number) => {
    set('faculties', faculties.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. LAYOUT VARIANT DROPDOWN ─── */}
      <Field label="Layout Variant (Choose from 6 Styles)" required>
        <div className="relative">
          <select
            value={currentVariant}
            onChange={(e) => set('variant', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer appearance-none pr-10"
          >
            {VARIANTS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
        </div>
      </Field>

      {/* ─── 2. HEADLINES & TITLES ─── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <Field label="Section Headline" required>
          <Input
            value={d.title || ''}
            onChange={(v) => set('title', v)}
            placeholder="19th Convocation at a Glance"
          />
        </Field>

        <Field label="Subtitle / Top Tagline">
          <Input
            value={d.subtitle || ''}
            onChange={(v) => set('subtitle', v)}
            placeholder="Academic highlights and achievements of the graduating batch."
          />
        </Field>
      </div>

      {/* ─── 3. BACKGROUND IMAGE ─── */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <Field label="Background Backdrop Image">
          <div className="flex gap-2">
            <Input
              value={d.bgImage || ''}
              onChange={(v) => set('bgImage', v)}
              placeholder="/uploads/convocation-metrics-bg.jpg"
            />
            <button
              type="button"
              onClick={() => setBgPickerOpen(true)}
              className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5 shrink-0 font-semibold transition-colors"
            >
              <ImageIcon size={14} />
              Browse Media
            </button>
          </div>
        </Field>

        {d.bgImage && (
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={d.bgImage}
              alt="Background Preview"
              className="w-16 h-10 object-cover rounded-lg"
            />
            <span className="text-xs text-slate-500 font-mono truncate">{d.bgImage}</span>
          </div>
        )}
      </div>

      {/* ─── 4. KEY HIGHLIGHTS STATS ─── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Primary Key Metrics (Totals & Gender Splits)
        </label>

        {/* Total Awardees Group */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="text-amber-600" />
            Total Graduating Awardees
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Total Count">
              <Input
                value={d.totalAwardees !== undefined ? String(d.totalAwardees) : '4729'}
                onChange={(v) => set('totalAwardees', parseInt(v, 10) || 0)}
                placeholder="4729"
              />
            </Field>
            <Field label="Male Count">
              <Input
                value={d.totalMale !== undefined ? String(d.totalMale) : '3527'}
                onChange={(v) => set('totalMale', parseInt(v, 10) || 0)}
                placeholder="3527"
              />
            </Field>
            <Field label="Female Count">
              <Input
                value={d.totalFemale !== undefined ? String(d.totalFemale) : '1202'}
                onChange={(v) => set('totalFemale', parseInt(v, 10) || 0)}
                placeholder="1202"
              />
            </Field>
          </div>
        </div>

        {/* Gold Medalists Group */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-amber-600" />
            Gold Medal Awardees
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Total Gold Medals">
              <Input
                value={d.goldMedalists !== undefined ? String(d.goldMedalists) : '101'}
                onChange={(v) => set('goldMedalists', parseInt(v, 10) || 0)}
                placeholder="101"
              />
            </Field>
            <Field label="Male Gold Medals">
              <Input
                value={d.goldMale !== undefined ? String(d.goldMale) : '49'}
                onChange={(v) => set('goldMale', parseInt(v, 10) || 0)}
                placeholder="49"
              />
            </Field>
            <Field label="Female Gold Medals">
              <Input
                value={d.goldFemale !== undefined ? String(d.goldFemale) : '52'}
                onChange={(v) => set('goldFemale', parseInt(v, 10) || 0)}
                placeholder="52"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ─── 5. ACADEMIC PROGRAM LEVELS (Degrees List) ─── */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDegreesOpen(!degreesOpen)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-amber-600 transition-colors"
          >
            <Layers size={14} />
            <span>Academic Degrees & Levels ({degrees.length})</span>
            {degreesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={handleAddDegree}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Plus size={14} />
            Add Degree Level
          </button>
        </div>

        {degreesOpen && (
          <div className="space-y-3">
            {degrees.map((deg, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Degree Level #{idx + 1}
                  </span>
                  <Input
                    value={deg.label}
                    onChange={(v) => handleUpdateDegree(idx, 'label', v)}
                    placeholder="e.g. POST GRADUATE"
                  />
                </div>

                <div className="w-full sm:w-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Count</span>
                  <Input
                    value={String(deg.count)}
                    onChange={(v) => handleUpdateDegree(idx, 'count', parseInt(v, 10) || 0)}
                    placeholder="889"
                  />
                </div>

                <div className="w-full sm:w-24">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Share %</span>
                  <Input
                    value={deg.percentage || ''}
                    onChange={(v) => handleUpdateDegree(idx, 'percentage', v)}
                    placeholder="18.8%"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDegree(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-end sm:self-center mt-2 sm:mt-4"
                  title="Delete Degree"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 6. FACULTIES & DISCIPLINES LIST ─── */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFacultiesOpen(!facultiesOpen)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-amber-600 transition-colors"
          >
            <Building2 size={14} />
            <span>Faculties & Disciplines ({faculties.length})</span>
            {facultiesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={handleAddFaculty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Plus size={14} />
            Add Faculty
          </button>
        </div>

        {facultiesOpen && (
          <div className="space-y-3">
            {faculties.map((fac, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Faculty #{idx + 1} Name
                  </span>
                  <Input
                    value={fac.label}
                    onChange={(v) => handleUpdateFaculty(idx, 'label', v)}
                    placeholder="e.g. ENGG. & TECHNOLOGY"
                  />
                </div>

                <div className="w-full sm:w-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Count</span>
                  <Input
                    value={String(fac.count)}
                    onChange={(v) => handleUpdateFaculty(idx, 'count', parseInt(v, 10) || 0)}
                    placeholder="2633"
                  />
                </div>

                <div className="w-full sm:w-24">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Share %</span>
                  <Input
                    value={fac.percentage || ''}
                    onChange={(v) => handleUpdateFaculty(idx, 'percentage', v)}
                    placeholder="55.7%"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteFaculty(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-end sm:self-center mt-2 sm:mt-4"
                  title="Delete Faculty"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {bgPickerOpen && (
        <MediaPicker
          onSelect={(url) => {
            set('bgImage', url);
            setBgPickerOpen(false);
          }}
          onClose={() => setBgPickerOpen(false)}
          filter="image"
        />
      )}
    </div>
  );
}
