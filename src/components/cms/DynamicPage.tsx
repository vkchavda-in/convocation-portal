import { getPageBySlug } from '@/lib/cms/page';
import BlockRenderer from '@/components/cms/BlockRenderer';
import ContactCTA from '@/app/components/shared/ContactCTA';
import MaintenanceView from '@/components/shared/MaintenanceView';
import type { CMSBlock } from '@/types/cms';
import type { PageData } from '@/types/cms';

interface DynamicPageProps {
  slug: string;
  staticData: PageData;
  showContactCTA?: boolean;
}

export async function DynamicPage({ slug, staticData, showContactCTA = false }: DynamicPageProps) {
  let sections: CMSBlock[] = staticData.sections;
  let isUnderMaintenance = false;
  let pageTitle = staticData.title;

  try {
    const page = await getPageBySlug(slug);
    if (page && page.isPublished) {
      sections = (page.sections as unknown as CMSBlock[]) || [];
      isUnderMaintenance = page.isMaintenance;
      pageTitle = page.title;
    }
  } catch (e) {
    console.warn(`[DynamicPage:${slug}] DB fetch failed, using static data:`, e);
  }

  if (isUnderMaintenance) {
    return (
      <main>
        <MaintenanceView pageTitle={pageTitle} />
      </main>
    );
  }

  return (
    <main>
      <BlockRenderer sections={sections} />
      {showContactCTA && <ContactCTA />}
    </main>
  );
}
