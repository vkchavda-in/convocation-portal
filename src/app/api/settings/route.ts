import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/settings - Publicly fetch current theme and typography config
export async function GET() {
  try {
    const [themeSetting, fontSetting, appSettingsSetting, themeCustomSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'theme' } }),
      prisma.setting.findUnique({ where: { key: 'fontPairing' } }),
      prisma.setting.findUnique({ where: { key: 'app_settings' } }),
      prisma.setting.findUnique({ where: { key: 'theme_custom' } }),
    ]);

    return NextResponse.json(
      {
        theme: themeSetting?.value || 'theme-ivy-league',
        fontPairing: fontSetting?.value || 'pairing-classic',
        appSettings: appSettingsSetting?.value || null,
        themeCustom: themeCustomSetting?.value || null,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update site theme and typography (requires ADMIN / SUPER_ADMIN)
export async function PUT(request: Request) {
  const auth = await requireRole(request, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await request.json();
    const { theme, fontPairing, appSettings, themeCustom } = body;

    const updates = [];

    if (theme !== undefined && typeof theme === 'string') {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'theme' },
          update: { value: theme.slice(0, 100) },
          create: { key: 'theme', value: theme.slice(0, 100) },
        })
      );
    }

    if (fontPairing !== undefined && typeof fontPairing === 'string') {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'fontPairing' },
          update: { value: fontPairing.slice(0, 100) },
          create: { key: 'fontPairing', value: fontPairing.slice(0, 100) },
        })
      );
    }

    if (appSettings !== undefined && typeof appSettings === 'string') {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'app_settings' },
          update: { value: appSettings.slice(0, 50000) },
          create: { key: 'app_settings', value: appSettings.slice(0, 50000) },
        })
      );
    }

    if (themeCustom !== undefined && typeof themeCustom === 'string') {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'theme_custom' },
          update: { value: themeCustom.slice(0, 50000) },
          create: { key: 'theme_custom', value: themeCustom.slice(0, 50000) },
        })
      );
    }

    await Promise.all(updates);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
