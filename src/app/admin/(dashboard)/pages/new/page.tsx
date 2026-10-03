import type { Metadata } from 'next';
import PageEditClient from '@/components/admin/PageEditClient';

export const metadata: Metadata = { title: 'New Page' };

export default function NewPageRoute() {
  return (
    <PageEditClient
      slug=""
      isNew={true}
      initialBlocks={[]}
      pageTitle="New Page"
      pageMetaTitle=""
      pageMetaDescription=""
      isPublished={true}
    />
  );
}
