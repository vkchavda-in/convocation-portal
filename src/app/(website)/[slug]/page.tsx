import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/cms/page';
import { DynamicPage } from '@/components/cms/DynamicPage';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 10; // Enable ISR for dynamic pages

export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isPublished: true,
        NOT: { slug: 'home' }
      },
      select: { slug: true }
    });
    return pages.map((page) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPageBySlug(slug);
    if (!page || !page.isPublished) return {};
    
    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
    };
  } catch {
    return {};
  }
}

export default async function GenericPage({ params }: PageProps) {
  const { slug } = await params;
  
  if (slug === 'home') {
    return notFound();
  }

  try {
    const page = await getPageBySlug(slug);
    
    if (!page || !page.isPublished) {
      return notFound();
    }

    return (
      <DynamicPage 
        slug={slug} 
        staticData={{
          id: page.id,
          title: page.title,
          metaTitle: page.metaTitle || '',
          metaDescription: page.metaDescription || '',
          sections: page.sections as any
        }} 
      />
    );
  } catch (e) {
    console.error(`[slug] page error:`, e);
    return notFound();
  }
}
