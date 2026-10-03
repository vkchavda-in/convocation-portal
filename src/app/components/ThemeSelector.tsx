import { useState, useEffect, useRef } from 'react';
import { Palette, X, Check, ChevronDown } from 'lucide-react';

const THEMES = [
  {
    id: 'theme-ivy-league',
    name: 'Ivy League Crimson',
    description: 'Classical burgundy & warm ivory',
    colors: ['#3A0E15', '#611C24', '#C89E4C', '#FCFAF5', '#24060A']
  },
  {
    id: 'theme-midnight-navy',
    name: 'Classic Midnight Navy',
    description: 'Original navy & champagne gold styling',
    colors: ['#08172D', '#103C75', '#CBA85A', '#FAFAF8', '#07111F']
  },
  {
    id: 'theme-emerald-legacy',
    name: 'Emerald Legacy',
    description: 'Scholarly forest green & gold',
    colors: ['#0A2419', '#123F2B', '#C89E4C', '#F6F8F5', '#05130D']
  },
  {
    id: 'theme-slate-charcoal',
    name: 'Slate & Charcoal',
    description: 'Sleek slate-gray & gold',
    colors: ['#161719', '#2C2D31', '#D8B467', '#F5F5F5', '#0D0E0F']
  },
  {
    id: 'theme-imperial-violet',
    name: 'Imperial Violet',
    description: 'Dignified deep plum & gold',
    colors: ['#28143A', '#422060', '#C89E4C', '#F8F5FA', '#190C25']
  },
  {
    id: 'theme-oxford-prestige',
    name: 'Oxford Prestige',
    description: 'Oxford blue & bright gold',
    colors: ['#0A1C36', '#1A365D', '#D4AF37', '#F7F9FB', '#050E1B']
  },
  {
    id: 'theme-bronze-amber',
    name: 'Bronze & Amber',
    description: 'Espresso brown, ivory & amber gold',
    colors: ['#2C1E17', '#4A3528', '#D49D42', '#FAF8F5', '#1B120E']
  },
  {
    id: 'theme-minimalist-editorial',
    name: 'Minimalist Editorial',
    description: 'Fine warm gray, taupe & alabaster',
    colors: ['#1A1A1A', '#404040', '#9A8470', '#FAF9F6', '#121212']
  },
  {
    id: 'theme-teal-scholar',
    name: 'Teal Scholar',
    description: 'Modern academic teal & gold',
    colors: ['#0A2B30', '#154850', '#D4AF37', '#F5F8F8', '#05181C']
  },
  {
    id: 'theme-cambridge-blue',
    name: 'Cambridge Blue',
    description: 'Sage blue, navy & soft champagne',
    colors: ['#0F1E26', '#3B5B66', '#C5A059', '#F4F7F6', '#071015']
  },
  {
    id: 'theme-bordeaux-velvet',
    name: 'Bordeaux Velvet',
    description: 'Claret red & soft gold',
    colors: ['#2D0B13', '#541524', '#CBB07B', '#FAF6F7', '#1C060B']
  },
  {
    id: 'theme-sandalwood-gold',
    name: 'Sandalwood Gold',
    description: 'Sandalwood brown & sand gold',
    colors: ['#2E2218', '#543F30', '#D4AB70', '#FBF9F6', '#1D140E']
  },
  {
    id: 'theme-nordic-spruce',
    name: 'Nordic Spruce',
    description: 'Clean spruce green & champagne gold',
    colors: ['#0E2329', '#1E3F47', '#E6C594', '#F4F8F9', '#071317']
  },
  {
    id: 'theme-desert-sage',
    name: 'Desert Sage',
    description: 'Sage green & warm amber',
    colors: ['#222D29', '#3E4D47', '#DCA462', '#FAF9F6', '#141C19']
  },
  {
    id: 'theme-tuscan-sun',
    name: 'Tuscan Sienna',
    description: 'Sienna brown, ochre red & honey gold',
    colors: ['#2B1D15', '#593627', '#E5AC44', '#FDFBF7', '#1A100B']
  },
  {
    id: 'theme-royal-plum',
    name: 'Royal Plum',
    description: 'aubergine & amber gold',
    colors: ['#230B21', '#471A43', '#D4AC6E', '#FCF6FC', '#140513']
  },
  {
    id: 'theme-steel-platinum',
    name: 'Steel & Platinum',
    description: 'steel blue & platinum silver',
    colors: ['#1C2430', '#384556', '#B8C5D6', '#F4F7FA', '#0F151E']
  },
  {
    id: 'theme-earthy-clay',
    name: 'Earthy Clay',
    description: 'Terracotta, clay & umber brown',
    colors: ['#2B231F', '#59453C', '#D9967E', '#FAF7F5', '#1B1512']
  },
  {
    id: 'theme-classic-mahogany',
    name: 'Classic Mahogany',
    description: 'mahogany redwood & bronze',
    colors: ['#31140F', '#5C2820', '#CCA677', '#FCFAF7', '#1F0B08']
  },
  {
    id: 'theme-sahara-gold',
    name: 'Sahara Sand',
    description: 'Sahara sand gold & warm ochre',
    colors: ['#2E2519', '#564431', '#CCA26A', '#FAF9F5', '#1E170F']
  }
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

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('theme-ivy-league');
  const [activeFont, setActiveFont] = useState('pairing-classic');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load state on mount
  useEffect(() => {
    // Load Active Theme
    const savedTheme = localStorage.getItem('executive-theme') || 'theme-ivy-league';
    setActiveTheme(savedTheme);
    applyBuiltinTheme(savedTheme);

    // Load Active Font
    const savedFont = localStorage.getItem('executive-font-pairing') || 'pairing-classic';
    setActiveFont(savedFont);
    const pMatch = FONT_PAIRINGS.find((p) => p.id === savedFont) || FONT_PAIRINGS[0];
    applyFontPairing(pMatch);
  }, []);

  // Lock body scroll when drawer is open to prevent double scrollbars
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if ((window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [isOpen]);

  const applyBuiltinTheme = (themeId: string) => {
    const docEl = document.documentElement;
    THEMES.forEach((t) => docEl.classList.remove(t.id));
    docEl.classList.add(themeId);
    localStorage.setItem('executive-theme', themeId);
    setActiveTheme(themeId);
  };

  const applyFontPairing = (pairing: typeof FONT_PAIRINGS[0]) => {
    const docEl = document.documentElement;
    docEl.style.setProperty('--font-heading', pairing.headingFont);
    docEl.style.setProperty('--font-body', pairing.bodyFont);
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pairingId = e.target.value;
    const pairing = FONT_PAIRINGS.find((p) => p.id === pairingId) || FONT_PAIRINGS[0];
    applyFontPairing(pairing);
    localStorage.setItem('executive-font-pairing', pairingId);
    setActiveFont(pairingId);
  };

  return (
    <>
      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[var(--midnight-navy)] text-[var(--warm-white)] rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all border border-[var(--champagne-gold)]/30 group"
        title="Style Dashboard Overlay"
      >
        <Palette size={22} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* OVERLAY PANEL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col z-10 border-l border-black/10 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-[var(--midnight-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Style Dashboard
                </h3>
                <p className="text-xs text-gray-500 mt-1">Configure colors & typography</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* TYPOGRAPHY SELECTOR */}
            <div className="mb-6" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Typography Pairing
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--royal-blue)] font-medium text-[var(--midnight-navy)] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>
                    {FONT_PAIRINGS.find((p) => p.id === activeFont)?.name || FONT_PAIRINGS[0].name}
                  </span>
                  <ChevronDown
                    className={`text-gray-500 transition-transform duration-200 ${
                      showFontDropdown ? 'rotate-180' : ''
                    }`}
                    size={16}
                  />
                </button>

                {showFontDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {FONT_PAIRINGS.map((pairing) => {
                      const isSelected = pairing.id === activeFont;
                      return (
                        <button
                          key={pairing.id}
                          type="button"
                          onClick={() => {
                            applyFontPairing(pairing);
                            localStorage.setItem('executive-font-pairing', pairing.id);
                            setActiveFont(pairing.id);
                            setShowFontDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[var(--midnight-navy)]/5 text-[var(--midnight-navy)] font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span>{pairing.name}</span>
                          {isSelected && <Check size={14} className="text-[var(--royal-blue)]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* PRESET THEME COLORS LIST */}
            <div className="space-y-4 flex-1 pr-1">
              <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">
                Preset Color Palettes
              </h4>
              {THEMES.map((theme) => {
                const isActive = theme.id === activeTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => applyBuiltinTheme(theme.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'border-[var(--midnight-navy)] bg-[var(--midnight-navy)]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm text-[var(--midnight-navy)]">
                        {theme.name}
                      </span>
                      {isActive && <Check size={14} className="text-[var(--royal-blue)]" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                      {theme.description}
                    </p>
                    <div className="flex items-center space-x-1">
                      {theme.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Brand */}
            <div className="border-t border-black/10 pt-4 mt-6 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-sans">
                19th Convocation Platform
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
