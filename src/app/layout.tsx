import type { Metadata } from 'next';
import { Inter, Playfair_Display, Outfit } from 'next/font/google';
import { prisma } from '@/lib/prisma';
import '@/styles/fonts.css';
import '@/styles/globals.css';
import SmoothScroll from '@/app/components/SmoothScroll';
import ScrollToTop from '@/app/components/shared/ScrollToTop';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Outfit is the default heading font (pairing-modern-sans) — always preloaded
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

// Playfair Display is only used in the non-default 'pairing-classic' mode — not preloaded
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'app_settings' },
    });
    if (setting) {
      const appSettings = JSON.parse(setting.value);
      return {
        title: {
          default: appSettings.defaultMetaTitle || '19th Convocation - Ganpat University',
          template: `%s | ${appSettings.siteName || '19th Convocation'}`,
        },
        description: appSettings.defaultMetaDescription || 'Official portal for the 19th Convocation of Ganpat University. Schedules, awardee guidelines, guest profiles, and ceremony details.',
        icons: {
          icon: appSettings.faviconUrl || '/favicon.ico',
        },
        keywords: ['Convocation', '19th Convocation', 'Ganpat University', 'GUNI', 'Awardees', 'Gold Medalists', 'Graduation Ceremony 2026'],
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata:', error);
  }

  return {
    title: {
      default: '19th Convocation - Ganpat University',
      template: '%s | 19th Convocation Ganpat University',
    },
    description:
      'Official portal for the 19th Convocation of Ganpat University. Schedules, awardee guidelines, guest profiles, and ceremony details.',
    icons: {
      icon: '/favicon.ico',
    },
    keywords: ['Convocation', '19th Convocation', 'Ganpat University', 'GUNI', 'Awardees', 'Gold Medalists', 'Graduation Ceremony 2026'],
  };
}

export const revalidate = 10; // Cache and revalidate settings every 10 seconds for speed

async function getThemeAndFont() {
  try {
    const [themeSetting, fontSetting, themeCustomSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'theme' } }),
      prisma.setting.findUnique({ where: { key: 'fontPairing' } }),
      prisma.setting.findUnique({ where: { key: 'theme_custom' } }),
    ]);

    let themeCustom = null;
    if (themeCustomSetting?.value) {
      try {
        themeCustom = JSON.parse(themeCustomSetting.value);
      } catch {}
    }

    return {
      theme: themeSetting?.value || 'theme-ivy-league',
      fontPairing: fontSetting?.value || 'pairing-classic',
      themeCustom,
    };
  } catch (error) {
    console.error('Failed to get theme and font settings:', error);
    return {
      theme: 'theme-ivy-league',
      fontPairing: 'pairing-classic',
      themeCustom: null,
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let { theme, fontPairing, themeCustom } = await getThemeAndFont();
  if (theme.startsWith('{')) theme = 'theme-ivy-league';
  if (fontPairing.startsWith('{')) fontPairing = 'pairing-classic';

  const isModernFont = fontPairing === 'pairing-modern-sans';

  const inlineStyles: Record<string, string> = {
    '--font-heading': isModernFont ? "var(--font-outfit), sans-serif" : "var(--font-playfair), serif",
    '--font-body': "var(--font-inter), sans-serif",
  };

  if (themeCustom) {
    if (themeCustom.primaryColor) {
      inlineStyles['--primary'] = themeCustom.primaryColor;
      inlineStyles['--slate-blue'] = themeCustom.primaryColor;
      inlineStyles['--royal-blue'] = themeCustom.primaryColor;
    }
    if (themeCustom.secondaryColor) {
      inlineStyles['--secondary'] = themeCustom.secondaryColor;
      inlineStyles['--champagne-gold'] = themeCustom.secondaryColor;
      inlineStyles['--gold'] = themeCustom.secondaryColor;
    }
    if (themeCustom.bgDark) {
      inlineStyles['--navy-dark'] = themeCustom.bgDark;
      inlineStyles['--midnight-navy'] = themeCustom.bgDark;
      inlineStyles['--abyss'] = themeCustom.bgDark;
      inlineStyles['--ink'] = themeCustom.bgDark;
    }
    if (themeCustom.bgLight) {
      inlineStyles['--warm-white'] = themeCustom.bgLight;
      inlineStyles['--parchment'] = themeCustom.bgLight;
    }
    if (themeCustom.headingColor) {
      inlineStyles['--heading-color'] = themeCustom.headingColor;
    }
    if (themeCustom.bodyColor) {
      inlineStyles['--slate-text'] = themeCustom.bodyColor;
    }
    if (themeCustom.borderRadius) {
      inlineStyles['--radius'] = themeCustom.borderRadius;
    }
  }

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfairDisplay.variable} ${outfit.variable} ${theme}`}
      style={inlineStyles as React.CSSProperties}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var RELOAD_KEY = '__chunk_reload_ts';
  function tryReload(reason) {
    try {
      var last = parseInt(sessionStorage.getItem(RELOAD_KEY) || '0', 10);
      var now = Date.now();
      if (now - last > 10000) {
        sessionStorage.setItem(RELOAD_KEY, now.toString());
        console.warn('[ChunkRecovery] Stale/missing chunk detected (' + reason + '). Auto-refreshing...');
        window.location.reload();
      }
    } catch(e) {}
  }

  window.addEventListener('error', function(e) {
    if (!e) return;
    var target = e.target;
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      var url = target.src || target.href || '';
      if (url.indexOf('/_next/static/') !== -1) {
        tryReload('Resource 404: ' + url);
      }
    } else if (e.message) {
      var m = (e.message || '').toLowerCase();
      if (
        m.indexOf('loading chunk') !== -1 ||
        m.indexOf('chunkloaderror') !== -1 ||
        m.indexOf('failed to fetch dynamically imported module') !== -1 ||
        m.indexOf('text/plain') !== -1
      ) {
        tryReload(e.message);
      }
    }
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    if (!e || !e.reason) return;
    var r = ((e.reason && e.reason.message) || e.reason + '').toLowerCase();
    if (
      r.indexOf('loading chunk') !== -1 ||
      r.indexOf('chunkloaderror') !== -1 ||
      r.indexOf('failed to fetch dynamically imported module') !== -1 ||
      r.indexOf('text/plain') !== -1
    ) {
      tryReload(r);
    }
  });
})();
`,
          }}
        />
        {themeCustom?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: themeCustom.customCss }} />
        )}
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
