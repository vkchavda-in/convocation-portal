import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const { order } = await request.json();

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    // Validate structure of order entries
    const safeOrder = order
      .filter((item: any) => typeof item?.id === 'string' && typeof item?.index === 'number')
      .map((item: any) => ({
        id: String(item.id),
        index: Math.max(0, Math.min(10000, Number(item.index))),
      }));

    // Perform all updates in a transaction for safety
    await prisma.$transaction(
      safeOrder.map((item) =>
        prisma.page.update({
          where: { id: item.id },
          data: { order: item.index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/pages/reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder pages' }, { status: 500 });
  }
}
