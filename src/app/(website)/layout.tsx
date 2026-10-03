import { cache } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { prisma } from '@/lib/prisma';
import MaintenanceView from '@/components/shared/MaintenanceView';
import SiteLoader from '@/components/shared/SiteLoader';

export const revalidate = 10; // Enable ISR for global settings

const getGlobalSettings = cache(async () => {
  try {
    const [headerSetting, footerSetting, appSettingsRecord] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'global_header' } }),
      prisma.setting.findUnique({ where: { key: 'global_footer' } }),
      prisma.setting.findUnique({ where: { key: 'app_settings' } }),
    ]);

    const appSettings = appSettingsRecord ? JSON.parse(appSettingsRecord.value) : {};

    const defaultHeader = {
      siteName: '',
      logoUrl: '',
      navLinks: [],
      ctaLabel: '',
      ctaUrl: '',
    };

    const defaultFooter = {
      tagline: '',
      copyright: '',
      columns: [],
      socials: [],
    };

    return {
      header: headerSetting ? JSON.parse(headerSetting.value) : defaultHeader,
      footer: footerSetting ? JSON.parse(footerSetting.value) : defaultFooter,
      maintenanceMode: appSettings.maintenanceMode === true,
      maintenanceMessage: appSettings.maintenanceMessage || 'We are currently undergoing scheduled maintenance. Please check back soon.',
      siteName: appSettings.siteName || '19th Convocation',
      defaultMetaTitle: appSettings.defaultMetaTitle || '19th Convocation | Ganpat University',
      defaultMetaDescription: appSettings.defaultMetaDescription || 'Official portal for the 19th Convocation of Ganpat University. Schedules, awardee guidelines, guest profiles, and ceremony details.',
    };
  } catch (err) {
    console.error('Failed to get global settings', err);
    return { header: null, footer: null, maintenanceMode: false, maintenanceMessage: '', siteName: '', defaultMetaTitle: '', defaultMetaDescription: '' };
  }
});

export async function generateMetadata() {
  const { defaultMetaTitle, defaultMetaDescription, siteName } = await getGlobalSettings();
  return {
    title: {
      template: `%s | ${siteName}`,
      default: defaultMetaTitle,
    },
    description: defaultMetaDescription,
  };
}

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { header, footer, maintenanceMode, maintenanceMessage } = await getGlobalSettings();
  const logoUrl = header?.logoUrl || '';
  // Determine if logo is a local upload (for preload as image vs external)
  const isLocalLogo = logoUrl.startsWith('/uploads/') || logoUrl.startsWith('/assets/');

  if (maintenanceMode) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <MaintenanceView pageTitle="Website" isHome message={maintenanceMessage} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)] text-[var(--midnight-navy)]">
      <SiteLoader />
      {/*
        LCP PRELOAD: Emit a <link rel="preload"> for the logo in the SSR HTML <head>.
        This tells the browser to start fetching the logo immediately — before any JS
        runs — reducing LCP by up to 1-2 seconds on mobile.
        Next.js hoists <link> elements from layout JSX into <head> automatically.
      */}
      {logoUrl && (
        <link
          rel="preload"
          as="image"
          href={logoUrl}
          // If the logo is served from our OptimizedImage pipeline with AVIF variants,
          // hint the browser about the correct MIME type.
          type={isLocalLogo ? 'image/avif' : undefined}
        />
      )}
      <Navbar headerData={header} />
      {children}
      <Footer footerData={footer} />
    </div>
  );
}
