import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_FOLDERS = [
  { name: 'Banners & Heroes',         slug: 'banners-heroes',      icon: 'image',       color: '#2563EB', mimeMatch: (m: string) => m.startsWith('image/') },
  { name: 'Videos',                   slug: 'videos',              icon: 'film',        color: '#7C3AED', mimeMatch: (m: string) => m.startsWith('video/') },
  { name: 'Documents & PDFs',         slug: 'documents-pdfs',      icon: 'file-text',   color: '#DC2626', mimeMatch: (m: string) => m.includes('pdf') || m.includes('document') || m.includes('word') || m.includes('sheet') },
  { name: 'Faculty & Staff',          slug: 'faculty-staff',       icon: 'users',       color: '#059669', mimeMatch: () => false },
  { name: 'Events & Gallery',         slug: 'events-gallery',      icon: 'camera',      color: '#D97706', mimeMatch: () => false },
  { name: 'Logos & Branding',         slug: 'logos-branding',      icon: 'badge-check', color: '#4F46E5', mimeMatch: () => false },
  { name: 'Campus & Infrastructure',  slug: 'campus',              icon: 'building-2',  color: '#0D9488', mimeMatch: () => false },
];

// POST /api/media/folders/seed — seed default folders and auto-categorize files by MIME
export async function POST() {
  try {
    const created: Record<string, string> = {};

    // Create folders if not exists
    for (const f of DEFAULT_FOLDERS) {
      let folder = await (prisma as any).mediaFolder.findUnique({ where: { slug: f.slug } });
      if (!folder) {
        folder = await (prisma as any).mediaFolder.create({
          data: { name: f.name, slug: f.slug, icon: f.icon, color: f.color },
        });
      }
      created[f.slug] = folder.id;
    }

    // Auto-categorize existing files by MIME type
    const allMedia = await (prisma as any).media.findMany({ where: { folderId: null } });
    let moved = 0;

    for (const media of allMedia) {
      for (const f of DEFAULT_FOLDERS) {
        if (f.mimeMatch(media.mimeType)) {
          await (prisma as any).media.update({
            where: { id: media.id },
            data: { folderId: created[f.slug] },
          });
          moved++;
          break;
        }
      }
    }

    return NextResponse.json({ success: true, foldersCreated: Object.keys(created).length, filesMoved: moved });
  } catch (error) {
    console.error('POST /api/media/folders/seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
