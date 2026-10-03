import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const UpdateUserSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128).optional().or(z.literal('')),
  name: z.string().trim().min(1).max(60).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
  if (!auth.authorized || !auth.user) return auth.response!;

  try {
    const { id } = await params;
    const rawData = await request.json();
    const validation = UpdateUserSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid user data' },
        { status: 400 }
      );
    }

    const { username, password, name, role, isActive } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role escalation check: Only SUPER_ADMIN can grant or revoke SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admins can assign the SUPER_ADMIN role' }, { status: 403 });
    }

    if (existingUser.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admins can alter a SUPER_ADMIN account' }, { status: 403 });
    }

    // Protect against deactivating the last active SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN' && isActive === false) {
      const activeSuperAdmins = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
      if (activeSuperAdmins <= 1) {
        return NextResponse.json({ error: 'Cannot deactivate the last active Super Admin' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (password && password.trim().length >= 8) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireRole(request, ['SUPER_ADMIN']);
  if (!auth.authorized || !auth.user) return auth.response!;

  try {
    const { id } = await params;

    // Prevent self-deletion
    if (auth.user.userId === id) {
      return NextResponse.json({ error: 'Cannot delete your own active account' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect against deleting the last SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only remaining Super Admin' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
