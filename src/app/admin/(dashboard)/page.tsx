import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FileText, Eye, PenLine, Plus, Activity } from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const [totalPages, publishedPages, recentPages] = await Promise.all([
      prisma.page.count(),
      prisma.page.count({ where: { isPublished: true } }),
      prisma.page.findMany({
        take: 8,
        orderBy: { updatedAt: 'desc' },
        select: { slug: true, title: true, updatedAt: true, isPublished: true },
      }),
    ]);
    return { totalPages, publishedPages, recentPages, draftPages: totalPages - publishedPages };
  } catch {
    return { totalPages: 0, publishedPages: 0, draftPages: 0, recentPages: [] };
  }
}

export default async function AdminDashboard() {
  const { totalPages, publishedPages, draftPages, recentPages } = await getStats();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <h1 className="text-sm font-semibold text-slate-800">Dashboard</h1>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          style={{ background: '#2563eb' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Page
        </Link>
      </div>

      <div className="px-6 py-4 flex-1">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Pages', value: totalPages, icon: FileText, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Published', value: publishedPages, icon: Eye, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Drafts', value: draftPages, icon: PenLine, color: '#d97706', bg: '#fffbeb' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 leading-none">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-5 gap-4">
          {/* Recent pages — takes 3 cols */}
          <div className="col-span-3 bg-white border border-slate-200 rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Recently Updated</p>
              <Link href="/admin/pages" className="text-xs text-blue-600 hover:text-blue-700">
                All pages →
              </Link>
            </div>
            {recentPages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No pages yet.{' '}
                <Link href="/admin/pages/new" className="text-blue-600 hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {recentPages.map((page) => (
                    <tr key={page.slug} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-2">
                        <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]">{page.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">/{page.slug}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={
                            page.isPublished
                              ? { background: '#dcfce7', color: '#15803d' }
                              : { background: '#fef3c7', color: '#b45309' }
                          }
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-[10px] text-slate-400">
                          {new Date(page.updatedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/admin/pages/${page.slug}/edit`}
                          className="text-[10px] text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick links — takes 2 cols */}
          <div className="col-span-2 space-y-3">
            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Quick Actions</p>
              </div>
              <div className="p-2">
                {[
                  { href: '/admin/pages/new', label: 'Create new page', desc: 'Add page with blocks' },
                  { href: '/admin/media', label: 'Media Library', desc: 'Upload & manage files' },
                  { href: '/admin/global', label: 'Edit header/footer', desc: 'Navigation & links' },
                  { href: '/admin/settings', label: 'Site settings', desc: 'Maintenance, SEO & more' },
                  { href: '/admin/theme', label: 'Appearance', desc: 'Colors & typography' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-700">{action.label}</p>
                      <p className="text-[10px] text-slate-400">{action.desc}</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-500 text-xs transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* System status */}
            <div className="bg-white border border-slate-200 rounded px-4 py-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">System</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Database</span>
                  <span className="flex items-center gap-1 text-[10px] text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    PostgreSQL
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">ORM</span>
                  <span className="text-[10px] text-slate-500">Prisma</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Framework</span>
                  <span className="text-[10px] text-slate-500">Next.js 16</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
