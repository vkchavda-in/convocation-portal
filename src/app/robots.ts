import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://convocation.ganpatuniversity.ac.in';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const urlPrefix = appUrl ? `http://${appUrl}` : baseUrl;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${urlPrefix}/sitemap.xml`,
  };
}
