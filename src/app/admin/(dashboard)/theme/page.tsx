'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Palette,
  Type,
  Sliders,
  Sparkles,
  Layout,
  Code2,
  Save,
  RotateCcw,
  Loader2,
  Check,
  Eye,
  Award,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Shield,
  Layers,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/components/admin/AdminToaster';

/* ─── 20+ Curated Themes ────────────────────────────────────────────────────────── */
interface ThemePreset {
  id: string;
  name: string;
  category: 'Classic' | 'Prestige' | 'Modern' | 'Ceremonial' | 'Earthy';
  description: string;
  primary: string;
  secondary: string;
  bgDark: string;
  bgLight: string;
  colors: string[];
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'theme-ivy-league',
    name: 'Ivy League Crimson',
    category: 'Prestige',
    description: 'Classical burgundy, deep wine & warm ivory parchment',
    primary: '#611C24',
    secondary: '#C89E4C',
    bgDark: '#24060A',
    bgLight: '#FCFAF5',
    colors: ['#3A0E15', '#611C24', '#C89E4C', '#FCFAF5', '#24060A']
  },
  {
    id: 'theme-midnight-navy',
    name: 'Classic Midnight Navy',
    category: 'Classic',
    description: 'Original ceremonial navy & warm champagne gold',
    primary: '#103C75',
    secondary: '#CBA85A',
    bgDark: '#07111F',
    bgLight: '#FAFAF8',
    colors: ['#08172D', '#103C75', '#CBA85A', '#FAFAF8', '#07111F']
  },
  {
    id: 'theme-oxford-prestige',
    name: 'Oxford Prestige Blue',
    category: 'Prestige',
    description: 'Deep Oxford blue, royal accents & bright gold',
    primary: '#1A365D',
    secondary: '#D4AF37',
    bgDark: '#050E1B',
    bgLight: '#F7F9FB',
    colors: ['#0A1C36', '#1A365D', '#D4AF37', '#F7F9FB', '#050E1B']
  },
  {
    id: 'theme-emerald-legacy',
    name: 'Emerald Legacy',
    category: 'Ceremonial',
    description: 'Scholarly forest green, jade & burnished gold',
    primary: '#123F2B',
    secondary: '#C89E4C',
    bgDark: '#05130D',
    bgLight: '#F6F8F5',
    colors: ['#0A2419', '#123F2B', '#C89E4C', '#F6F8F5', '#05130D']
  },
  {
    id: 'theme-imperial-violet',
    name: 'Imperial Violet',
    category: 'Prestige',
    description: 'Dignified royal purple, plum & polished gold',
    primary: '#422060',
    secondary: '#C89E4C',
    bgDark: '#190C25',
    bgLight: '#F8F5FA',
    colors: ['#28143A', '#422060', '#C89E4C', '#F8F5FA', '#190C25']
  },
  {
    id: 'theme-tuscan-sun',
    name: 'Tuscan Sienna',
    category: 'Earthy',
    description: 'Sienna brown, ochre red & honey gold highlights',
    primary: '#593627',
    secondary: '#E5AC44',
    bgDark: '#1A100B',
    bgLight: '#FDFBF7',
    colors: ['#2B1D15', '#593627', '#E5AC44', '#FDFBF7', '#1A100B']
  },
  {
    id: 'theme-classic-mahogany',
    name: 'Classic Mahogany',
    category: 'Ceremonial',
    description: 'Mahogany redwood, deep bronze & warm ivory',
    primary: '#5C2820',
    secondary: '#CCA677',
    bgDark: '#1F0B08',
    bgLight: '#FCFAF7',
    colors: ['#31140F', '#5C2820', '#CCA677', '#FCFAF7', '#1F0B08']
  },
  {
    id: 'theme-slate-charcoal',
    name: 'Slate & Charcoal',
    category: 'Modern',
    description: 'Sleek dark slate-gray, anthracite & brushed gold',
    primary: '#2C2D31',
    secondary: '#D8B467',
    bgDark: '#0D0E0F',
    bgLight: '#F5F5F5',
    colors: ['#161719', '#2C2D31', '#D8B467', '#F5F5F5', '#0D0E0F']
  },
  {
    id: 'theme-teal-scholar',
    name: 'Teal Scholar',
    category: 'Modern',
    description: 'Contemporary academic deep teal & bright champagne',
    primary: '#154850',
    secondary: '#D4AF37',
    bgDark: '#05181C',
    bgLight: '#F5F8F8',
    colors: ['#0A2B30', '#154850', '#D4AF37', '#F5F8F8', '#05181C']
  },
  {
    id: 'theme-bronze-amber',
    name: 'Bronze & Amber',
    category: 'Earthy',
    description: 'Rich espresso brown, warm amber gold & cream',
    primary: '#4A3528',
    secondary: '#D49D42',
    bgDark: '#1B120E',
    bgLight: '#FAF8F5',
    colors: ['#2C1E17', '#4A3528', '#D49D42', '#FAF8F5', '#1B120E']
  },
  {
    id: 'theme-cambridge-blue',
    name: 'Cambridge Sage Blue',
    category: 'Classic',
    description: 'Heritage sage blue, navy & delicate champagne',
    primary: '#3B5B66',
    secondary: '#C5A059',
    bgDark: '#071015',
    bgLight: '#F4F7F6',
    colors: ['#0F1E26', '#3B5B66', '#C5A059', '#F4F7F6', '#071015']
  },
  {
    id: 'theme-bordeaux-velvet',
    name: 'Bordeaux Velvet',
    category: 'Prestige',
    description: 'Claret wine red, velvet undertones & soft gold',
    primary: '#541524',
    secondary: '#CBB07B',
    bgDark: '#1C060B',
    bgLight: '#FAF6F7',
    colors: ['#2D0B13', '#541524', '#CBB07B', '#FAF6F7', '#1C060B']
  },
  {
    id: 'theme-sandalwood-gold',
    name: 'Sandalwood Gold',
    category: 'Earthy',
    description: 'Sandalwood brown, warm sand gold & ecru',
    primary: '#543F30',
    secondary: '#D4AB70',
    bgDark: '#1D140E',
    bgLight: '#FBF9F6',
    colors: ['#2E2218', '#543F30', '#D4AB70', '#FBF9F6', '#1D140E']
  },
  {
    id: 'theme-nordic-spruce',
    name: 'Nordic Spruce',
    category: 'Modern',
    description: 'Clean spruce green, slate tint & soft wheat gold',
    primary: '#1E3F47',
    secondary: '#E6C594',
    bgDark: '#071317',
    bgLight: '#F4F8F9',
    colors: ['#0E2329', '#1E3F47', '#E6C594', '#F4F8F9', '#071317']
  },
  {
    id: 'theme-desert-sage',
    name: 'Desert Sage',
    category: 'Earthy',
    description: 'Sage green, warm amber & clean alabaster',
    primary: '#3E4D47',
    secondary: '#DCA462',
    bgDark: '#141C19',
    bgLight: '#FAF9F6',
    colors: ['#222D29', '#3E4D47', '#DCA462', '#FAF9F6', '#141C19']
  },
  {
    id: 'theme-royal-plum',
    name: 'Royal Plum',
    category: 'Ceremonial',
    description: 'Deep aubergine, rich violet & radiant amber',
    primary: '#471A43',
    secondary: '#D4AC6E',
    bgDark: '#140513',
    bgLight: '#FCF6FC',
    colors: ['#230B21', '#471A43', '#D4AC6E', '#FCF6FC', '#140513']
  },
  {
    id: 'theme-steel-platinum',
    name: 'Steel & Platinum',
    category: 'Modern',
    description: 'Architectural steel blue, ice slate & platinum silver',
    primary: '#384556',
    secondary: '#B8C5D6',
    bgDark: '#0F151E',
    bgLight: '#F4F7FA',
    colors: ['#1C2430', '#384556', '#B8C5D6', '#F4F7FA', '#0F151E']
  },
  {
    id: 'theme-earthy-clay',
    name: 'Earthy Terracotta',
    category: 'Earthy',
    description: 'Warm terracotta, clay red & umber charcoal',
    primary: '#59453C',
    secondary: '#D9967E',
    bgDark: '#1B1512',
    bgLight: '#FAF7F5',
    colors: ['#2B231F', '#59453C', '#D9967E', '#FAF7F5', '#1B1512']
  },
  {
    id: 'theme-sahara-gold',
    name: 'Sahara Sand',
    category: 'Ceremonial',
    description: 'Sahara sand gold, warm ochre & desert mist',
    primary: '#564431',
    secondary: '#CCA26A',
    bgDark: '#1E170F',
    bgLight: '#FAF9F5',
    colors: ['#2E2519', '#564431', '#CCA26A', '#FAF9F5', '#1E170F']
  },
  {
    id: 'theme-royal-champagne',
    name: 'Royal Champagne',
    category: 'Prestige',
    description: 'Deep royal blue, luminous champagne gold & crisp white',
    primary: '#1E3A5F',
    secondary: '#DFB76C',
    bgDark: '#0B1422',
    bgLight: '#FFFFFF',
    colors: ['#101C2E', '#1E3A5F', '#DFB76C', '#FFFFFF', '#0B1422']
  }
];

/* ─── Font Pairings ─────────────────────────────────────────────────────────────── */
interface FontPairing {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  headingFamily: string;
  bodyFamily: string;
  sampleHeading: string;
  description: string;
}

const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'pairing-classic',
    name: 'Classic Editorial',
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    headingFamily: 'Playfair Display',
    bodyFamily: 'Inter',
    sampleHeading: 'Honoring Scholarly Excellence & Achievement',
    description: 'Playfair Display (Serif) + Inter (Sans) — Timeless academic elegance'
  },
  {
    id: 'pairing-modern-sans',
    name: 'Modern Academic Sans',
    headingFont: "'Outfit', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingFamily: 'Outfit',
    bodyFamily: 'Inter',
    sampleHeading: 'Empowering Future Leaders & Innovators',
    description: 'Outfit (Geometric Sans) + Inter (Sans) — Crisp, bold and high-impact'
  }
];

/* ─── Shape & Border Radiuses ────────────────────────────────────────────────────── */
const RADIUS_OPTIONS = [
  { label: 'Sharp Architectural', value: '0px', desc: '0px — Crisp prestige structure' },
  { label: 'Subtle Rounded', value: '4px', desc: '4px — Delicate refined corner' },
  { label: 'Balanced Modern', value: '8px', desc: '8px — Modern standard' },
  { label: 'Smooth Curved', value: '14px', desc: '14px — Friendly smooth curve' },
  { label: 'Pill Shape', value: '9999px', desc: 'Full Pill — Circular pill buttons' },
];

/* ─── Custom Theme Interface ─────────────────────────────────────────────────────── */
interface CustomThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  bgDark?: string;
  bgLight?: string;
  headingColor?: string;
  bodyColor?: string;
  borderRadius?: string;
  maxWidth?: string;
  customCss?: string;
}

export default function ThemeSettingsPage() {
  const [activeTab, setActiveTab] = useState<'presets' | 'typography' | 'colors' | 'shapes' | 'css'>('presets');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  const [activeTheme, setActiveTheme] = useState('theme-ivy-league');
  const [activeFont, setActiveFont] = useState('pairing-classic');
  const [customSettings, setCustomSettings] = useState<CustomThemeSettings>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const selectedPreset = THEME_PRESETS.find(p => p.id === activeTheme) || THEME_PRESETS[0];
  const selectedFont = FONT_PAIRINGS.find(f => f.id === activeFont) || FONT_PAIRINGS[0];

  // Resolve active colors (custom override or preset default)
  const effectivePrimary = customSettings.primaryColor || selectedPreset.primary;
  const effectiveSecondary = customSettings.secondaryColor || selectedPreset.secondary;
  const effectiveBgDark = customSettings.bgDark || selectedPreset.bgDark;
  const effectiveBgLight = customSettings.bgLight || selectedPreset.bgLight;
  const effectiveRadius = customSettings.borderRadius || '8px';

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        
        let safeTheme = data.theme || 'theme-ivy-league';
        if (safeTheme.startsWith('{')) safeTheme = 'theme-ivy-league';
        setActiveTheme(safeTheme);
        setActiveFont(data.fontPairing || 'pairing-classic');

        if (data.themeCustom) {
          try {
            const parsed = typeof data.themeCustom === 'string' ? JSON.parse(data.themeCustom) : data.themeCustom;
            setCustomSettings(parsed);
          } catch {}
        }
      }
    } catch {
      toast.error('Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTheme(); }, [fetchTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: activeTheme,
          fontPairing: activeFont,
          themeCustom: JSON.stringify(customSettings)
        }),
      });
      if (res.ok) {
        toast.success('Theme & Appearance saved successfully!');
      } else {
        toast.error('Failed to save appearance settings');
      }
    } catch {
      toast.error('Network error saving theme');
    } finally {
      setSaving(false);
    }
  };

  const handleResetCustomColors = () => {
    setCustomSettings(prev => ({
      ...prev,
      primaryColor: undefined,
      secondaryColor: undefined,
      bgDark: undefined,
      bgLight: undefined,
      headingColor: undefined,
      bodyColor: undefined,
    }));
    toast.info('Colors reset to preset defaults');
  };

  const filteredPresets = categoryFilter === 'All'
    ? THEME_PRESETS
    : THEME_PRESETS.filter(p => p.category === categoryFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 gap-2 text-slate-400 font-sans">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading Appearance Studio…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm text-white">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">Appearance & Theme Studio</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Global branding, 20+ prestige colorways, typography & layout styling</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-blue-500/10 hover:shadow disabled:opacity-60 cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Publishing Changes…' : 'Publish Appearance'}
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="px-6 border-b border-slate-200 bg-white shrink-0">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'presets', label: 'Colorway Presets (20)', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'typography', label: 'Typography & Fonts', icon: <Type className="w-3.5 h-3.5" /> },
            { id: 'colors', label: 'Granular Color Studio', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'shapes', label: 'Cards & Geometry', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'css', label: 'Custom CSS Code', icon: <Code2 className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Layout: Controls Left + Live Interactive Preview Right ── */}
      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* ── Left Settings Form (7 cols on XL) ── */}
        <div className="xl:col-span-7 space-y-6">

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', 'Prestige', 'Classic', 'Ceremonial', 'Modern', 'Earthy'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{filteredPresets.length} Themes available</span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredPresets.map((preset) => {
                  const isSelected = activeTheme === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setActiveTheme(preset.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                          {preset.description}
                        </p>
                      </div>

                      {/* 5-Color Swatch Strip */}
                      <div className="flex items-center gap-1 h-5 rounded-md overflow-hidden p-0.5 bg-slate-100/80 border border-slate-200/60">
                        {preset.colors.map((hex, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full rounded-sm transition-transform hover:scale-110"
                            style={{ background: hex }}
                            title={hex}
                          />
                        ))}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Typography Hierarchy</h3>
                <div className="grid grid-cols-1 gap-3">
                  {FONT_PAIRINGS.map((pairing) => {
                    const isSelected = activeFont === pairing.id;
                    return (
                      <div
                        key={pairing.id}
                        onClick={() => setActiveFont(pairing.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{pairing.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({pairing.headingFamily} + {pairing.bodyFamily})</span>
                          </div>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                              <CheckCircle2 className="w-4 h-4" /> Active Pairing
                            </span>
                          )}
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-slate-100 my-2">
                          <p
                            className="text-lg font-bold text-slate-900 leading-snug"
                            style={{ fontFamily: pairing.headingFont }}
                          >
                            {pairing.sampleHeading}
                          </p>
                          <p
                            className="text-xs text-slate-600 mt-1 leading-relaxed"
                            style={{ fontFamily: pairing.bodyFont }}
                          >
                            The 19th Convocation of Ganpat University celebrates undergraduate, postgraduate and doctoral graduates.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRANULAR COLOR STUDIO */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Custom Color Palette Overrides</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Customize individual brand colors or restore preset defaults</p>
                  </div>
                  <button
                    onClick={handleResetCustomColors}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset to Preset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-700">Primary Brand Accent</label>
                    <p className="text-[10px] text-slate-400">Buttons, active tabs, major headers</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={effectivePrimary}
                        onChange={(e) => setCustomSettings({ ...customSettings, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={customSettings.primaryColor || selectedPreset.primary}
                        onChange={(e) => setCustomSettings({ ...customSettings, primaryColor: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono bg-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Secondary Gold Color */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-700">Secondary Gold Foil Accent</label>
                    <p className="text-[10px] text-slate-400">Champagne gold highlights, badges & borders</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={effectiveSecondary}
                        onChange={(e) => setCustomSettings({ ...customSettings, secondaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={customSettings.secondaryColor || selectedPreset.secondary}
                        onChange={(e) => setCustomSettings({ ...customSettings, secondaryColor: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono bg-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Dark Canvas / Hero Background */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-700">Dark Canvas / Hero Navy</label>
                    <p className="text-[10px] text-slate-400">Hero background, footer & top bar backdrop</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={effectiveBgDark}
                        onChange={(e) => setCustomSettings({ ...customSettings, bgDark: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={customSettings.bgDark || selectedPreset.bgDark}
                        onChange={(e) => setCustomSettings({ ...customSettings, bgDark: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono bg-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Light Surface Background */}
                  <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-700">Light Surface / Background</label>
                    <p className="text-[10px] text-slate-400">Page background and light content sections</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        value={effectiveBgLight}
                        onChange={(e) => setCustomSettings({ ...customSettings, bgLight: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={customSettings.bgLight || selectedPreset.bgLight}
                        onChange={(e) => setCustomSettings({ ...customSettings, bgLight: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CARDS & GEOMETRY */}
          {activeTab === 'shapes' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Corner Radiuses & Card Geometry</h3>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Global Border Radius</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {RADIUS_OPTIONS.map((opt) => {
                      const isSelected = (customSettings.borderRadius || '8px') === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setCustomSettings({ ...customSettings, borderRadius: opt.value })}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                            <p className="text-[10px] text-slate-400">{opt.desc}</p>
                          </div>
                          <div
                            className="w-7 h-7 bg-slate-200 border border-slate-400 flex items-center justify-center shrink-0"
                            style={{ borderRadius: opt.value }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM CSS */}
          {activeTab === 'css' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Custom CSS Stylesheet</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inject bespoke CSS rules directly into the live website &lt;head&gt;</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 bg-slate-100 rounded text-slate-600">Pure CSS</span>
                </div>

                <textarea
                  value={customSettings.customCss || ''}
                  onChange={(e) => setCustomSettings({ ...customSettings, customCss: e.target.value })}
                  placeholder={`/* Add custom CSS rules here */\n.custom-glow {\n  box-shadow: 0 0 20px rgba(200, 158, 76, 0.4);\n}`}
                  rows={10}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs font-mono bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />

                {/* Quick Snippets */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Snippet Presets</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const snippet = `\n/* Subtle Gold Glow on Hover */\n.hover-gold-glow:hover {\n  box-shadow: 0 10px 25px -5px rgba(200, 158, 76, 0.35);\n}\n`;
                        setCustomSettings({ ...customSettings, customCss: (customSettings.customCss || '') + snippet });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      + Gold Glow Hover
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const snippet = `\n/* High-Legibility Typography Antialiasing */\nbody, html {\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-rendering: optimizeLegibility;\n}\n`;
                        setCustomSettings({ ...customSettings, customCss: (customSettings.customCss || '') + snippet });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      + Font Smoothing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const snippet = `\n/* Hide Default Browser Scrollbars */\n::-webkit-scrollbar {\n  width: 6px;\n}\n::-webkit-scrollbar-thumb {\n  background: rgba(200, 158, 76, 0.4);\n  border-radius: 4px;\n}\n`;
                        setCustomSettings({ ...customSettings, customCss: (customSettings.customCss || '') + snippet });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      + Custom Gold Scrollbar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Right Interactive Live Preview Canvas (5 cols on XL) ── */}
        <div className="xl:col-span-5">
          <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Window Chrome Header */}
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-slate-600 ml-2">Live Theme Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200 text-[10px] font-semibold text-slate-600">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2 py-0.5 rounded ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2 py-0.5 rounded ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Mock Website Canvas Container */}
            <div
              className={`transition-all duration-300 mx-auto overflow-y-auto max-h-[700px] ${
                previewMode === 'mobile' ? 'max-w-[340px] border-x border-slate-200 my-3 rounded-xl shadow-inner' : 'w-full'
              }`}
              style={{ background: effectiveBgLight }}
            >
              {/* Mock Top Bar */}
              <div
                className="py-1.5 px-4 text-[9px] font-semibold flex items-center justify-between text-white"
                style={{ background: effectiveBgDark, borderBottom: `1px solid ${effectiveSecondary}40` }}
              >
                <span className="truncate">19th Convocation Ceremony – Registrations Live</span>
                <span
                  className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                  style={{ background: effectiveSecondary, color: effectiveBgDark }}
                >
                  Live Webcast
                </span>
              </div>

              {/* Mock Hero Section */}
              <div
                className="p-6 relative overflow-hidden text-white"
                style={{ background: `linear-gradient(135deg, ${effectiveBgDark} 0%, ${effectivePrimary} 100%)` }}
              >
                {/* Slanted Accent Stripe */}
                <div
                  className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20 transform -skew-x-12"
                  style={{ background: effectiveSecondary }}
                />

                <div className="relative z-10 space-y-3">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase"
                    style={{ background: `${effectiveSecondary}25`, color: effectiveSecondary, border: `1px solid ${effectiveSecondary}50` }}
                  >
                    <Award className="w-3 h-3" />
                    Ganpat University
                  </div>

                  <h2
                    className="text-2xl font-bold leading-tight"
                    style={{ fontFamily: selectedFont.headingFont }}
                  >
                    19th Annual Convocation 2026
                  </h2>

                  <p
                    className="text-xs text-white/80 leading-relaxed"
                    style={{ fontFamily: selectedFont.bodyFont }}
                  >
                    Conferring degrees upon distinguished graduates, university gold medalists, and Ph.D. scholars.
                  </p>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <button
                      className="px-4 py-2 text-xs font-bold transition-transform shadow-md cursor-pointer"
                      style={{
                        background: effectiveSecondary,
                        color: effectiveBgDark,
                        borderRadius: effectiveRadius
                      }}
                    >
                      View Schedule
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-bold border transition-colors cursor-pointer"
                      style={{
                        borderColor: `${effectiveSecondary}80`,
                        color: '#ffffff',
                        borderRadius: effectiveRadius
                      }}
                    >
                      Medalists
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock Content Card */}
              <div className="p-5 space-y-4">
                <div
                  className="p-4 bg-white border border-slate-200/80 shadow-sm space-y-2"
                  style={{ borderRadius: effectiveRadius }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ceremony Details</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: effectiveSecondary }} />
                  </div>
                  <h4
                    className="text-base font-bold text-slate-900"
                    style={{ fontFamily: selectedFont.headingFont }}
                  >
                    Presidential Address & Conferral
                  </h4>
                  <p
                    className="text-xs text-slate-600 leading-relaxed"
                    style={{ fontFamily: selectedFont.bodyFont }}
                  >
                    Join us on campus at the Ganpat University Convocation Amphitheatre.
                  </p>
                </div>

                {/* Mock Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="p-3 bg-white border border-slate-200 text-center"
                    style={{ borderRadius: effectiveRadius }}
                  >
                    <p className="text-lg font-bold" style={{ color: effectivePrimary }}>4,500+</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Graduates</p>
                  </div>
                  <div
                    className="p-3 bg-white border border-slate-200 text-center"
                    style={{ borderRadius: effectiveRadius }}
                  >
                    <p className="text-lg font-bold" style={{ color: effectiveSecondary }}>128</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Gold Medalists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 font-medium">
                Active Theme: <strong className="text-slate-800">{selectedPreset.name}</strong> • Font: <strong className="text-slate-800">{selectedFont.name}</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
