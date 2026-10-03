'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const THEMES = [
  { id: 'theme-ivy-league', name: 'Ivy League Crimson', description: 'Classical burgundy & warm ivory', colors: ['#3A0E15', '#611C24', '#C89E4C', '#FCFAF5', '#24060A'] },
  { id: 'theme-midnight-navy', name: 'Classic Midnight Navy', description: 'Original navy & champagne gold styling', colors: ['#08172D', '#103C75', '#CBA85A', '#FAFAF8', '#07111F'] },
  { id: 'theme-emerald-legacy', name: 'Emerald Legacy', description: 'Scholarly forest green & gold', colors: ['#0A2419', '#123F2B', '#C89E4C', '#F6F8F5', '#05130D'] },
  { id: 'theme-slate-charcoal', name: 'Slate & Charcoal', description: 'Sleek slate-gray & gold', colors: ['#161719', '#2C2D31', '#D8B467', '#F5F5F5', '#0D0E0F'] },
  { id: 'theme-imperial-violet', name: 'Imperial Violet', description: 'Dignified deep plum & gold', colors: ['#28143A', '#422060', '#C89E4C', '#F8F5FA', '#190C25'] },
  { id: 'theme-oxford-prestige', name: 'Oxford Prestige', description: 'Oxford blue & bright gold', colors: ['#0A1C36', '#1A365D', '#D4AF37', '#F7F9FB', '#050E1B'] },
  { id: 'theme-bronze-amber', name: 'Bronze & Amber', description: 'Espresso brown, ivory & amber gold', colors: ['#2C1E17', '#4A3528', '#D49D42', '#FAF8F5', '#1B120E'] },
  { id: 'theme-minimalist-editorial', name: 'Minimalist Editorial', description: 'Fine warm gray, taupe & alabaster', colors: ['#1A1A1A', '#404040', '#9A8470', '#FAF9F6', '#121212'] },
  { id: 'theme-teal-scholar', name: 'Teal Scholar', description: 'Modern academic teal & gold', colors: ['#0A2B30', '#154850', '#D4AF37', '#F5F8F8', '#05181C'] },
  { id: 'theme-cambridge-blue', name: 'Cambridge Blue', description: 'Sage blue, navy & soft champagne', colors: ['#0F1E26', '#3B5B66', '#C5A059', '#F4F7F6', '#071015'] },
  { id: 'theme-bordeaux-velvet', name: 'Bordeaux Velvet', description: 'Claret red & soft gold', colors: ['#2D0B13', '#541524', '#CBB07B', '#FAF6F7', '#1C060B'] },
  { id: 'theme-sandalwood-gold', name: 'Sandalwood Gold', description: 'Sandalwood brown & sand gold', colors: ['#2E2218', '#543F30', '#D4AB70', '#FBF9F6', '#1D140E'] },
  { id: 'theme-nordic-spruce', name: 'Nordic Spruce', description: 'Clean spruce green & champagne gold', colors: ['#0E2329', '#1E3F47', '#E6C594', '#F4F8F9', '#071317'] },
  { id: 'theme-desert-sage', name: 'Desert Sage', description: 'Sage green & warm amber', colors: ['#222D29', '#3E4D47', '#DCA462', '#FAF9F6', '#141C19'] },
  { id: 'theme-tuscan-sun', name: 'Tuscan Sienna', description: 'Sienna brown, ochre red & honey gold', colors: ['#2B1D15', '#593627', '#E5AC44', '#FDFBF7', '#1A100B'] },
  { id: 'theme-royal-plum', name: 'Royal Plum', description: 'Aubergine & amber gold', colors: ['#230B21', '#471A43', '#D4AC6E', '#FCF6FC', '#140513'] },
  { id: 'theme-steel-platinum', name: 'Steel & Platinum', description: 'Steel blue & platinum silver', colors: ['#1C2430', '#384556', '#B8C5D6', '#F4F7FA', '#0F151E'] },
  { id: 'theme-earthy-clay', name: 'Earthy Clay', description: 'Terracotta, clay & umber brown', colors: ['#2B231F', '#59453C', '#D9967E', '#FAF7F5', '#1B1512'] },
  { id: 'theme-classic-mahogany', name: 'Classic Mahogany', description: 'Mahogany redwood & bronze', colors: ['#31140F', '#5C2820', '#CCA677', '#FCFAF7', '#1F0B08'] },
  { id: 'theme-sahara-gold', name: 'Sahara Sand', description: 'Sahara sand gold & warm ochre', colors: ['#2E2519', '#564431', '#CCA26A', '#FAF9F5', '#1E170F'] }
];

const FONT_PAIRINGS = [
  {
    id: 'pairing-classic',
    name: 'Classic Editorial (Playfair Display + Inter)',
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    description: 'Playfair Display + Inter'
  },
  {
    id: 'pairing-modern-sans',
    name: 'Modern Sans (Outfit + Inter)',
    headingFont: "'Outfit', sans-serif",
    bodyFont: "'Inter', sans-serif",
    description: 'Outfit + Inter'
  }
];

export default function ThemeSettingsPage() {
  const [activeTheme, setActiveTheme] = useState('theme-ivy-league');
  const [activeFont, setActiveFont] = useState('pairing-classic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        
        // Handle potentially corrupted JSON strings from previous iterations
        let safeTheme = data.theme || 'theme-ivy-league';
        if (safeTheme.startsWith('{')) safeTheme = 'theme-ivy-league';
        
        setActiveTheme(safeTheme);
        setActiveFont(data.fontPairing || 'pairing-classic');
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
        body: JSON.stringify({ theme: activeTheme, fontPairing: activeFont }),
      });
      if (res.ok) {
        toast.success('Theme saved successfully! Refresh page to see changes globally.');
      } else {
        toast.error('Failed to save theme');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading theme settings...</span>
      </div>
    );
  }

  const activeThemeData = THEMES.find(t => t.id === activeTheme) || THEMES[0];
  const activeFontData = FONT_PAIRINGS.find(f => f.id === activeFont) || FONT_PAIRINGS[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400" />
          <h1 className="text-sm font-semibold text-slate-800">Appearance & Theme</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-60"
            style={{ background: '#2563eb' }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 p-6 gap-6 max-w-[1200px]">
        {/* Left Col - Selection */}
        <div className="w-2/3 space-y-6">
          
          {/* Typography */}
          <section>
            <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Typography Pairing</h2>
            <div className="grid grid-cols-2 gap-4">
              {FONT_PAIRINGS.map((pairing) => (
                <button
                  key={pairing.id}
                  onClick={() => setActiveFont(pairing.id)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${
                    activeFont === pairing.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-sm text-slate-800">{pairing.name}</span>
                    {activeFont === pairing.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500">{pairing.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Presets */}
          <section>
            <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Preset Color Palettes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {THEMES.map((theme) => {
                const isActive = theme.id === activeTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-xs text-slate-800 line-clamp-1">{theme.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {theme.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Col - Live Preview */}
        <div className="w-1/3">
          <div className="sticky top-16">
            <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Theme Preview</h2>
            <div 
              className={`border border-slate-200 shadow-sm overflow-hidden flex flex-col ${activeTheme}`}
              style={{
                backgroundColor: 'var(--background, #fff)',
                borderRadius: '0.6rem',
                color: 'var(--text, #000)',
                height: '400px'
              }}
            >
              {/* Preview Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: activeThemeData.colors[0] }}
              >
                <div 
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: activeFontData.headingFont }}
                >
                  Dr. Sharma
                </div>
                <div className="flex gap-3 text-[10px] text-white/80">
                  <span>About</span>
                  <span>Vision</span>
                </div>
              </div>
              
              {/* Preview Body */}
              <div className="p-5 flex-1 flex flex-col gap-4 bg-[var(--background)]">
                <h1 
                  className="text-xl font-bold"
                  style={{ fontFamily: activeFontData.headingFont, color: activeThemeData.colors[0] }}
                >
                  Educational Visionary
                </h1>
                
                <p className="text-xs leading-relaxed" style={{ fontFamily: activeFontData.bodyFont, color: activeThemeData.colors[4] }}>
                  This is a preview of the <strong>{activeThemeData.name}</strong> theme combined with the <strong>{activeFontData.name}</strong> typography.
                </p>
                
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 rounded"
                    style={{ backgroundColor: activeThemeData.colors[1], fontFamily: activeFontData.bodyFont }}
                  >
                    Primary Action
                  </button>
                  <button 
                    className="px-3 py-1.5 text-xs font-medium rounded"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: `1px solid ${activeThemeData.colors[2]}`,
                      color: activeThemeData.colors[4],
                      fontFamily: activeFontData.bodyFont
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Settings apply globally to all public pages.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
