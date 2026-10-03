import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://convocation.ganpatuniversity.ac.in';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const urlPrefix = appUrl ? `http://${appUrl}` : baseUrl;

  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    return pages.map((page) => ({
      url: `${urlPrefix}${page.slug === 'home' ? '' : `/${page.slug}`}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: page.slug === 'home' ? 1.0 : 0.8,
    }));
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return [
      {
        url: urlPrefix,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }
}
