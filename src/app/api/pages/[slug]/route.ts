import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { sanitizeSlug } from '@/lib/security';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/pages/[slug] - Get a single page by slug (Public read)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);
    const page = await prisma.page.findUnique({ where: { slug: cleanSlug } });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('GET /api/pages/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

// PUT /api/pages/[slug] - Update a page (Protected)
export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);
    const body = await request.json();
    const { title, metaTitle, metaDescription, sections, isPublished, isMaintenance, lastUpdatedAt } = body;

    // Concurrency conflict check
    if (lastUpdatedAt) {
      const existing = await prisma.page.findUnique({
        where: { slug: cleanSlug },
        select: { updatedAt: true },
      });
      if (existing) {
        const dbTime = new Date(existing.updatedAt).getTime();
        const clientTime = new Date(lastUpdatedAt).getTime();

        if (dbTime > clientTime) {
          return NextResponse.json(
            { error: 'This page was recently updated by another user. Save cancelled to prevent overwrite. Please reload and re-apply.' },
            { status: 409 }
          );
        }
      }
    }

    const page = await prisma.page.update({
      where: { slug: cleanSlug },
      data: {
        ...(title !== undefined && { title: String(title).slice(0, 150) }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle ? String(metaTitle).slice(0, 150) : null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription ? String(metaDescription).slice(0, 300) : null }),
        ...(sections !== undefined && { sections }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
        ...(isMaintenance !== undefined && { isMaintenance: Boolean(isMaintenance) }),
      },
    });

    if (cleanSlug === 'home') {
      revalidatePath('/');
    } else {
      revalidatePath(`/${cleanSlug}`);
    }
    revalidatePath('/', 'layout');

    return NextResponse.json(page);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    console.error('PUT /api/pages/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE /api/pages/[slug] - Delete a page (Protected)
export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);

    // Prevent deletion of homepage
    if (cleanSlug === 'home') {
      return NextResponse.json({ error: 'Cannot delete default home page' }, { status: 400 });
    }

    await prisma.page.delete({ where: { slug: cleanSlug } });
    revalidatePath(`/${cleanSlug}`);
    revalidatePath('/', 'layout');
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    console.error('DELETE /api/pages/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
