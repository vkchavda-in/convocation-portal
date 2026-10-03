import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageEditClient from '@/components/admin/PageEditClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit: ${slug}` };
}

export const dynamic = 'force-dynamic';

export default async function EditPageRoute({ params }: PageProps) {
  const { slug } = await params;

  let page;
  try {
    page = await prisma.page.findUnique({ where: { slug } });
  } catch (e) {
    console.error('Failed to fetch page:', e);
  }

  if (!page) return notFound();

  return (
    <PageEditClient
      slug={page.slug}
      isNew={false}
      initialBlocks={(page.sections as object[]) as Array<{ id: string; type: string; data: object }>}
      pageTitle={page.title}
      pageMetaTitle={page.metaTitle || ''}
      pageMetaDescription={page.metaDescription || ''}
      isPublished={page.isPublished}
      initialUpdatedAt={page.updatedAt.toISOString()}
    />
  );
}
