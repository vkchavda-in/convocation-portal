import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getPageBySlug = cache(async (slug: string) => {
  try {
    return await prisma.page.findUnique({ where: { slug } });
  } catch (error) {
    console.error(`Error querying page by slug "${slug}":`, error);
    return null;
  }
});
