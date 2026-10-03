import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await request.json();
    const { variant, subpageHeight, subpageAlign, lightBgStyle, lightGradientPos } = body;

    if (!variant || typeof variant !== 'string') {
      return NextResponse.json({ error: 'variant is required' }, { status: 400 });
    }

    const pages = await prisma.page.findMany();
    let updatedCount = 0;

    for (const page of pages) {
      if (page.slug === 'home') continue;

      let sections: any[] = [];
      if (typeof page.sections === 'string') {
        try {
          sections = JSON.parse(page.sections);
        } catch {
          sections = [];
        }
      } else if (Array.isArray(page.sections)) {
        sections = page.sections as any[];
      }

      let updated = false;

      const newSections = sections.map((section) => {
        if (section.type === 'hero') {
          updated = true;
          return {
            ...section,
            data: {
              ...section.data,
              variant: String(variant).slice(0, 50),
              subpageHeight: String(subpageHeight || 'medium').slice(0, 50),
              subpageAlign: String(subpageAlign || 'left').slice(0, 50),
              lightBgStyle: String(lightBgStyle || 'grid-dots').slice(0, 50),
              lightGradientPos: String(lightGradientPos || 'none').slice(0, 50),
              isSubpage: true,
            },
          };
        }
        return section;
      });

      if (updated) {
        await prisma.page.update({
          where: { id: page.id },
          data: {
            sections: newSections,
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully synced layout settings to ${updatedCount} subpages.` });
  } catch (error) {
    console.error('POST /api/pages/sync-hero error:', error);
    return NextResponse.json({ error: 'Failed to sync layout settings to subpages' }, { status: 500 });
  }
}
