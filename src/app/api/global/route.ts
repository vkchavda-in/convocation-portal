import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/global - Get header and footer settings (Public read)
export async function GET() {
  try {
    const [headerSetting, footerSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'global_header' } }),
      prisma.setting.findUnique({ where: { key: 'global_footer' } }),
    ]);

    const defaultHeader = {
      siteName: '',
      subheading: '19th Convocation • Ganpat University',
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

    const safeParse = (value: string | undefined, defaultVal: any) => {
      if (!value) return defaultVal;
      try {
        return JSON.parse(value);
      } catch (e) {
        return defaultVal;
      }
    };

    return NextResponse.json(
      {
        header: safeParse(headerSetting?.value, defaultHeader),
        footer: safeParse(footerSetting?.value, defaultFooter),
        lastUpdatedHeader: headerSetting?.updatedAt?.toISOString() || null,
        lastUpdatedFooter: footerSetting?.updatedAt?.toISOString() || null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/global error:', error);
    return NextResponse.json({ error: 'Failed to fetch global settings' }, { status: 500 });
  }
}

// PUT /api/global - Update header and/or footer settings (Requires ADMIN / SUPER_ADMIN)
export async function PUT(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await request.json();
    const { header, footer, lastUpdatedHeader, lastUpdatedFooter } = body;

    // Concurrency conflict check
    if (header !== undefined && lastUpdatedHeader) {
      const existingHeader = await prisma.setting.findUnique({
        where: { key: 'global_header' },
        select: { updatedAt: true },
      });
      if (existingHeader) {
        const dbTime = new Date(existingHeader.updatedAt).getTime();
        const clientTime = new Date(lastUpdatedHeader).getTime();
        if (dbTime > clientTime) {
          return NextResponse.json(
            { error: 'Header settings were modified by another session. Save cancelled to prevent overwrite. Please reload and try again.' },
            { status: 409 }
          );
        }
      }
    }

    if (footer !== undefined && lastUpdatedFooter) {
      const existingFooter = await prisma.setting.findUnique({
        where: { key: 'global_footer' },
        select: { updatedAt: true },
      });
      if (existingFooter) {
        const dbTime = new Date(existingFooter.updatedAt).getTime();
        const clientTime = new Date(lastUpdatedFooter).getTime();
        if (dbTime > clientTime) {
          return NextResponse.json(
            { error: 'Footer settings were modified by another session. Save cancelled to prevent overwrite. Please reload and try again.' },
            { status: 409 }
          );
        }
      }
    }

    const updates = [];

    if (header !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'global_header' },
          update: { value: JSON.stringify(header) },
          create: { key: 'global_header', value: JSON.stringify(header) },
        })
      );
    }

    if (footer !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'global_footer' },
          update: { value: JSON.stringify(footer) },
          create: { key: 'global_footer', value: JSON.stringify(footer) },
        })
      );
    }

    await Promise.all(updates);

    const [newHeader, newFooter] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'global_header' }, select: { updatedAt: true } }),
      prisma.setting.findUnique({ where: { key: 'global_footer' }, select: { updatedAt: true } }),
    ]);

    revalidatePath('/', 'layout');
    return NextResponse.json({
      success: true,
      lastUpdatedHeader: newHeader?.updatedAt?.toISOString() || null,
      lastUpdatedFooter: newFooter?.updatedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('PUT /api/global error:', error);
    return NextResponse.json({ error: 'Failed to update global settings' }, { status: 500 });
  }
}
