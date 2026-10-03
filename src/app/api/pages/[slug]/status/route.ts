import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { updatedAt: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ updatedAt: page.updatedAt.toISOString() });
  } catch (error) {
    console.error('GET /api/pages/[slug]/status error:', error);
    return NextResponse.json({ error: 'Failed to fetch page status' }, { status: 500 });
  }
}
