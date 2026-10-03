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
    const [themeSetting, fontSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'theme' } }),
      prisma.setting.findUnique({ where: { key: 'fontPairing' } }),
    ]);
    return {
      theme: themeSetting?.value || 'theme-convocation',
      fontPairing: fontSetting?.value || 'pairing-modern-sans',
    };
  } catch (error) {
    console.error('Failed to get theme and font settings:', error);
    return {
      theme: 'theme-convocation',
      fontPairing: 'pairing-modern-sans',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let { theme, fontPairing } = await getThemeAndFont();
  if (theme.startsWith('{')) theme = 'theme-ivy-league';
  if (fontPairing.startsWith('{')) fontPairing = 'pairing-classic';

  const isModernFont = fontPairing === 'pairing-modern-sans';

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfairDisplay.variable} ${outfit.variable} ${theme}`}
      style={{
        '--font-heading': isModernFont ? "var(--font-outfit), sans-serif" : "var(--font-playfair), serif",
        '--font-body': "var(--font-inter), sans-serif",
      } as React.CSSProperties}
    >
      <body className="antialiased">
        <SmoothScroll />
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
