'use client';

import MediaPicker from '../MediaPicker';
import { useState } from 'react';
import { RefreshCw, Loader2, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { HeroBlockData, HeroStatItem } from '@/types/cms';

interface Props {
  data: object;
  onChange: (d: object) => void;
}

const DEFAULT_BG_IMAGES = [
  '/uploads/convocation-08-158a3767.jpg',
  '/uploads/convocation-14-158a9227.jpg',
  '/uploads/convocation-12-158a9209.jpg',
  '/uploads/convocation-21-mhdv5790.jpg',
  '/uploads/convocation-01-0u3a0768.jpg'
];

export default function HeroEditor({ data, onChange }: Props) {
  const d = data as HeroBlockData;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [studentImagePickerOpen, setStudentImagePickerOpen] = useState(false);
  const [slideshowPickerOpen, setSlideshowPickerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const activeVariant = d.variant || (d.isSubpage ? 'subpage-dark' : 'home');
  const layoutVariant = d.layoutVariant || 'maritime-cinematic';

  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

  const setCTA = (cta: 'primaryCTA' | 'secondaryCTA', key: string, value: string) => {
    const existing = d[cta] || { label: '', url: '' };
    onChange({ ...d, [cta]: { ...existing, [key]: value } });
  };

  const setPortrait = (key: string, value: string) => {
    onChange({ ...d, portrait: { ...(d.portrait || {}), [key]: value } });
  };

  const setPill = (key: string, value: string) => {
    onChange({ ...d, infoPills: { ...(d.infoPills || {}), [key]: value } });
  };

  const setStudentImage = (url: string) => {
    onChange({ ...d, studentImage: url, rightImage: url });
  };

  const handleVariantChange = (v: string) => {
    if (v === 'home') {
      onChange({ ...d, variant: 'home', isSubpage: false });
    } else if (v === 'subpage-dark') {
      onChange({ ...d, variant: 'subpage-dark', isSubpage: true });
    } else if (v === 'subpage-light') {
      onChange({ ...d, variant: 'subpage-light', isSubpage: true });
    }
  };

  const handleSyncToAllSubpages = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/pages/sync-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: activeVariant,
          subpageHeight: d.subpageHeight || 'medium',
          subpageAlign: d.subpageAlign || 'left',
          lightBgStyle: d.lightBgStyle || 'grid-dots',
          lightGradientPos: d.lightGradientPos || 'none'
        })
      });
      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.error || 'Failed to sync layout settings');
      } else {
        toast.success(resData.message || 'Layout settings synced to all subpages successfully!');
      }
    } catch (error) {
      console.error('Failed to sync hero settings:', error);
      toast.error('Failed to sync layout settings');
    } finally {
      setSyncing(false);
    }
  };

  // Slideshow image helpers
  const bgImages: string[] = d.bgImages && d.bgImages.length > 0
    ? d.bgImages
    : (d.bgImage ? [d.bgImage] : DEFAULT_BG_IMAGES);

  const removeSlideshowImage = (idx: number) => {
    set('bgImages', bgImages.filter((_, i) => i !== idx));
  };

  const moveSlideshowImage = (idx: number, dir: -1 | 1) => {
    const arr = [...bgImages];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    set('bgImages', arr);
  };

  // Resolved values with exact frontend defaults for crisp UI pre-fill
  const universityName = d.universityName ?? 'Ganpat University';
  const badgeText = d.badgeText ?? '19TH CONVOCATION • 2026';
  const title = d.title ?? '19th Convocation.';
  const titleHighlight = d.titleHighlight ?? 'Academic Triumph.';
  const motto = d.tagline ?? 'विद्यया विन्दतेऽमृतम् • Excellence Through Knowledge & Service';
  const description = d.description ?? 'Celebrating the perseverance, dedication and scholastic milestones of our graduating cohort. Welcoming awardees, parents, distinguished patrons, and world leaders to the grand ceremonial dais.';
  const studentImage = d.studentImage || d.rightImage || '/uploads/hero-student-right.png';
  const primaryCTA = d.primaryCTA || { label: 'Download Invitation & Schedule', url: '/19th-convocation-3' };
  const secondaryCTA = d.secondaryCTA || { label: 'Schedules & Protocols', url: '/convocation-schedule' };

  const pillDate = d.infoPills?.date ?? 'January 8, 2026 • 4:30 PM Onwards';
  const pillVenue = d.infoPills?.venue ?? 'Ganpat Vidyanagar, Mehsana-Gandhinagar Highway';
  const pillClassSize = d.infoPills?.classSize ?? 'Class of 2026 • 4,250+ Graduating Scholars';
  const pillChiefGuest = d.infoPills?.chiefGuest ?? 'Chief Guest: Dr. Pradyuman Vaja • Guest of Honour: Dr. V. Narayanan';

  return (
    <div className="space-y-5">
      {/* ── 1. HERO VARIANT TYPE ── */}
      <Field label="Hero Type">
        <Select
          value={activeVariant}
          onChange={handleVariantChange}
          options={[
            { value: 'home', label: 'Homepage Hero (Cinematic Flagship)' },
            { value: 'subpage-dark', label: 'Subpage Dark Banner' },
            { value: 'subpage-light', label: 'Subpage Light Spotlight' }
          ]}
        />
      </Field>

      {/* ══ HOME HERO CONFIGURATION ══ */}
      {activeVariant === 'home' && (
        <>
          <Divider label="Layout Variant" />
          <Field label="Home Layout Style">
            <Select
              value={layoutVariant}
              onChange={(v) => set('layoutVariant', v)}
              options={[
                { value: 'maritime-cinematic', label: '★ Cinematic Fixed-Reference Scene (Flagship)' },
                { value: 'slider', label: 'Classic Dark Slider (Carousel)' },
                { value: 'white-hero', label: 'Clean White Hero (Spotlight)' }
              ]}
            />
          </Field>

          {/* ── 2. HERO HEADLINE & TEXT ── */}
          <Divider label="Main Headlines & Content" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Eyebrow University Name">
              <Input
                value={universityName}
                onChange={(v) => set('universityName', v)}
                placeholder="Ganpat University"
              />
            </Field>

            <Field label="Eyebrow Badge Tag">
              <Input
                value={badgeText}
                onChange={(v) => set('badgeText', v)}
                placeholder="19TH CONVOCATION • 2026"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Main Title (Line 1)" required>
              <Input
                value={title}
                onChange={(v) => set('title', v)}
                placeholder="19th Convocation."
              />
            </Field>

            <Field label="Title Highlight (Line 2 — Gold Gradient)">
              <Input
                value={titleHighlight}
                onChange={(v) => set('titleHighlight', v)}
                placeholder="Academic Triumph."
              />
            </Field>
          </div>

          <Field label="University Sanskrit Motto / Tagline">
            <Input
              value={motto}
              onChange={(v) => set('tagline', v)}
              placeholder="विद्यया विन्दतेऽमृतम् • Excellence Through Knowledge & Service"
            />
          </Field>

          <Field label="Hero Description">
            <Textarea
              value={description}
              onChange={(v) => set('description', v)}
              rows={3}
              placeholder="Celebrating the perseverance, dedication and scholastic milestones..."
            />
          </Field>

          {/* ── 3. STUDENT CUTOUT IMAGE ── */}
          <Divider label="🎓 Student Cutout Image (Right-Side Photo)" />
          <p className="text-[11px] text-slate-500">
            Transparent PNG photo of graduating students positioned on the right side of the hero dais.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex gap-2">
              <Input
                value={studentImage}
                onChange={(v) => setStudentImage(v)}
                placeholder="/uploads/hero-student-right.png"
              />
              <button
                type="button"
                onClick={() => setStudentImagePickerOpen(true)}
                className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5 shrink-0 font-semibold transition-colors"
              >
                <ImageIcon size={14} />
                Browse Media
              </button>
            </div>

            {studentImage && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                <img
                  src={studentImage}
                  alt="Student Cutout Preview"
                  className="w-16 h-14 object-contain rounded bg-slate-100 p-1"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-800 block truncate">{studentImage}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Active Student Cutout</span>
                </div>
              </div>
            )}
          </div>

          {/* ── 4. BACKGROUND SLIDESHOW IMAGES ── */}
          <Divider label="🖼️ Background Slideshow Images (Dais & Campus)" />
          <p className="text-[11px] text-slate-500">
            The hero automatically fades through these photos in the background. Reorder using ↑↓ or add new images.
          </p>

          <div className="space-y-2">
            {bgImages.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">{idx + 1}</span>
                <img
                  src={url}
                  alt={`Slide ${idx + 1}`}
                  className="w-14 h-9 object-cover rounded-lg flex-shrink-0 bg-slate-200 border border-slate-300"
                />
                <span className="flex-1 text-[11px] text-slate-600 font-mono truncate min-w-0">{url}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveSlideshowImage(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-25"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlideshowImage(idx, 1)}
                    disabled={idx === bgImages.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded disabled:opacity-25"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlideshowImage(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove Slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSlideshowPickerOpen(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              Add Background Slideshow Image
            </button>
          </div>

          {/* ── 5. FROSTED GLASS INFO PILLS ── */}
          <Divider label="🏷️ Frosted Glass Info Pills (Badges on Hero)" />
          <p className="text-[11px] text-slate-500">
            The 4 glassmorphic chips displayed under the headline on the cinematic hero.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="📅 Date & Time">
              <Input
                value={pillDate}
                onChange={(v) => setPill('date', v)}
                placeholder="January 8, 2026 • 4:30 PM Onwards"
              />
            </Field>

            <Field label="📍 Venue & Campus">
              <Input
                value={pillVenue}
                onChange={(v) => setPill('venue', v)}
                placeholder="Ganpat Vidyanagar, Mehsana-Gandhinagar Highway"
              />
            </Field>

            <Field label="🎓 Graduating Class Size">
              <Input
                value={pillClassSize}
                onChange={(v) => setPill('classSize', v)}
                placeholder="Class of 2026 • 4,250+ Graduating Scholars"
              />
            </Field>

            <Field label="🏅 Chief Guest & Guest of Honour">
              <Input
                value={pillChiefGuest}
                onChange={(v) => setPill('chiefGuest', v)}
                placeholder="Chief Guest: Dr. Pradyuman Vaja • Guest of Honour: Dr. V. Narayanan"
              />
            </Field>
          </div>

          {/* ── 6. CTA BUTTONS ── */}
          <Divider label="🔘 Call-To-Action Buttons" />

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Primary Button (Gold Highlight)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Button Label">
                <Input
                  value={primaryCTA.label}
                  onChange={(v) => setCTA('primaryCTA', 'label', v)}
                  placeholder="Download Invitation & Schedule"
                />
              </Field>
              <Field label="Button URL">
                <Input
                  value={primaryCTA.url}
                  onChange={(v) => setCTA('primaryCTA', 'url', v)}
                  placeholder="/19th-convocation-3"
                />
              </Field>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Secondary Button (Frosted Glass)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Button Label">
                <Input
                  value={secondaryCTA.label}
                  onChange={(v) => setCTA('secondaryCTA', 'label', v)}
                  placeholder="Schedules & Protocols"
                />
              </Field>
              <Field label="Button URL">
                <Input
                  value={secondaryCTA.url}
                  onChange={(v) => setCTA('secondaryCTA', 'url', v)}
                  placeholder="/convocation-schedule"
                />
              </Field>
            </div>
          </div>
        </>
      )}

      {/* ══ SUBPAGE HERO CONFIGURATION ══ */}
      {(activeVariant === 'subpage-dark' || activeVariant === 'subpage-light') && (
        <>
          <Divider label="Subpage Content Settings" />

          <Field label="Title" required>
            <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="Title text" />
          </Field>
          <Field label="Subtitle">
            <Input value={d.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="Subtitle text" />
          </Field>
          <Field label="Description">
            <Textarea value={d.description || ''} onChange={(v) => set('description', v)} placeholder="Detailed description" />
          </Field>

          <Divider label="Sub-page Configuration" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Subpage Height">
              <Select
                value={d.subpageHeight || 'medium'}
                onChange={(v) => set('subpageHeight', v)}
                options={[
                  { value: 'short', label: 'Short' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'full', label: 'Full Viewport' }
                ]}
              />
            </Field>
            <Field label="Text Alignment">
              <Select
                value={d.subpageAlign || 'left'}
                onChange={(v) => set('subpageAlign', v)}
                options={[
                  { value: 'left', label: 'Left Aligned' },
                  { value: 'center', label: 'Centered' }
                ]}
              />
            </Field>
          </div>

          {activeVariant === 'subpage-dark' && (
            <Field label="Background Image">
              <div className="flex gap-2">
                <Input value={d.bgImage || ''} onChange={(v) => set('bgImage', v)} placeholder="/assets/images/bg.png" />
                <button
                  type="button"
                  onClick={() => setBgPickerOpen(true)}
                  className="flex-shrink-0 px-2.5 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Browse
                </button>
              </div>
            </Field>
          )}

          {activeVariant === 'subpage-light' && (
            <>
              <Field label="Background Pattern Style">
                <Select
                  value={d.lightBgStyle || 'grid-dots'}
                  onChange={(v) => set('lightBgStyle', v)}
                  options={[
                    { value: 'grid-dots', label: 'Grid & Coordinate Dots (Pure White)' },
                    { value: 'grid', label: 'Technical Grid Only (Pure White)' },
                    { value: 'dots', label: 'Coordinate Dots Only (Pure White)' },
                    { value: 'slate-tint', label: 'Technical Grid & Dots (Slate Tinted)' },
                    { value: 'minimal', label: 'Minimal (Clean White Background)' }
                  ]}
                />
              </Field>
              <Field label="Corner Gradients (Wave Glow)">
                <Select
                  value={d.lightGradientPos || 'none'}
                  onChange={(v) => set('lightGradientPos', v)}
                  options={[
                    { value: 'none', label: 'None (Clean)' },
                    { value: 'top-left', label: 'Top-Left Corner only' },
                    { value: 'top-right', label: 'Top-Right Corner only' },
                    { value: 'both', label: 'Both Top Corners' }
                  ]}
                />
              </Field>
            </>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSyncToAllSubpages}
              disabled={syncing}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Layout to All Subpages
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* ── MEDIA PICKERS ── */}
      {pickerOpen && (
        <MediaPicker
          onSelect={(url) => { setPortrait('imageUrl', url); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
          filter="image"
        />
      )}

      {bgPickerOpen && (
        <MediaPicker
          onSelect={(url) => { set('bgImage', url); setBgPickerOpen(false); }}
          onClose={() => setBgPickerOpen(false)}
          filter="image"
        />
      )}

      {studentImagePickerOpen && (
        <MediaPicker
          onSelect={(url) => {
            setStudentImage(url);
            setStudentImagePickerOpen(false);
          }}
          onClose={() => setStudentImagePickerOpen(false)}
          filter="image"
        />
      )}

      {slideshowPickerOpen && (
        <MediaPicker
          onSelect={(url) => {
            set('bgImages', [...bgImages, url]);
            setSlideshowPickerOpen(false);
          }}
          onClose={() => setSlideshowPickerOpen(false)}
          filter="image"
        />
      )}
    </div>
  );
}

// ── Shared small components ────────────────────────────────────────────────

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-slate-900 transition-all"
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, maxLength }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y bg-white text-slate-900 transition-all"
    />
  );
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-slate-900 cursor-pointer transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? '#2563eb' : '#cbd5e1' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-0.5">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
