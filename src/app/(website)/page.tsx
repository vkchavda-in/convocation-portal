import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlockRenderer from '@/components/cms/BlockRenderer';
import MaintenanceView from '@/components/shared/MaintenanceView';
import type { CMSBlock } from '@/types/cms';

export const revalidate = 10; // Enable ISR for instant page load

async function getHomePageData() {
  const page = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (!page) {
    return notFound();
  }
  if (!page.isPublished) {
    return notFound();
  }
  return page;
}

export default async function HomePage() {
  const page = await getHomePageData();
  const rawSections = page.sections;
  const sections: CMSBlock[] = Array.isArray(rawSections)
    ? (rawSections as unknown as CMSBlock[])
    : typeof rawSections === 'string'
    ? (JSON.parse(rawSections) as CMSBlock[])
    : [];

  if (page.isMaintenance) {
    return (
      <main>
        <MaintenanceView pageTitle={page.title} isHome />
      </main>
    );
  }

  return (
    <main>
      <BlockRenderer sections={sections} />
    </main>
  );
}
