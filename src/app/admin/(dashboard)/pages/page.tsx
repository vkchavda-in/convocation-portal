'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink,
  FileText, ChevronUp, ChevronDown, Copy, Search, Loader2, Wrench
} from 'lucide-react';
import { toast } from 'sonner';

interface Page {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  isPublished: boolean;
  isMaintenance: boolean;
  updatedAt: string;
}

export const dynamic = 'force-dynamic';

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Page | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const moveRow = async (index: number, dir: 'up' | 'down') => {
    const newPages = [...pages];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newPages.length) return;
    [newPages[index], newPages[target]] = [newPages[target], newPages[index]];
    setPages(newPages);
    try {
      await fetch('/api/pages/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newPages.map((p, i) => ({ id: p.id, index: i })) }),
      });
    } catch { /* silent */ }
  };

  const togglePublish = async (page: Page) => {
    try {
      const res = await fetch(`/api/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });
      if (res.ok) {
        setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p));
        toast.success(page.isPublished ? 'Page unpublished' : 'Page published');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggleMaintenance = async (page: Page) => {
    try {
      const res = await fetch(`/api/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMaintenance: !page.isMaintenance }),
      });
      if (res.ok) {
        setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, isMaintenance: !p.isMaintenance } : p));
        toast.success(page.isMaintenance ? 'Maintenance mode disabled' : 'Maintenance mode enabled');
      }
    } catch {
      toast.error('Failed to update maintenance status');
    }
  };

  const duplicatePage = async (page: Page) => {
    const newSlug = `${page.slug}-copy-${Date.now().toString(36)}`;
    try {
      const srcRes = await fetch(`/api/pages/${page.slug}`);
      const src = await srcRes.json();
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug,
          title: `${src.title} (Copy)`,
          metaTitle: src.metaTitle,
          metaDescription: src.metaDescription,
          sections: src.sections,
          isPublished: false,
        }),
      });
      if (res.ok) {
        toast.success('Page duplicated');
        fetchPages();
      }
    } catch {
      toast.error('Failed to duplicate page');
    }
  };

  const deletePage = async (page: Page) => {
    setDeletingId(page.id);
    try {
      const res = await fetch(`/api/pages/${page.slug}`, { method: 'DELETE' });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== page.id));
        toast.success('Page deleted');
        setConfirmDelete(null);
      } else {
        toast.error('Failed to delete page');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h1 className="text-sm font-semibold text-slate-800">Pages</h1>
          </div>
          {!loading && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
              {pages.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all w-48"
            />
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
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1">
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading pages…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">
                {search ? 'No pages match your search' : 'No pages yet'}
              </p>
              {!search && (
                <Link
                  href="/admin/pages/new"
                  className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded mt-3"
                  style={{ background: '#2563eb' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create first page
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-8" />
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Page</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Slug</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Updated</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page, index) => (
                  <tr 
                    key={page.id} 
                    onClick={() => router.push(`/admin/pages/${page.slug}/edit`)}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Reorder */}
                    <td className="px-2 py-2 w-8">
                      <div 
                        className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => moveRow(index, 'up')}
                          disabled={index === 0}
                          className="text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveRow(index, 'down')}
                          disabled={index === filtered.length - 1}
                          className="text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    {/* Title */}
                    <td className="px-3 py-2">
                      <p className="text-xs font-medium text-slate-800">{page.title}</p>
                      {page.metaTitle && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{page.metaTitle}</p>
                      )}
                    </td>
                    {/* Slug */}
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        /{page.slug}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={
                            page.isPublished
                              ? { background: '#dcfce7', color: '#15803d' }
                              : { background: '#fef3c7', color: '#b45309' }
                          }
                        >
                          {page.isPublished ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {page.isMaintenance && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-50 text-red-600 border border-red-100"
                          >
                            <Wrench className="w-2.5 h-2.5" />
                            Maintenance ON
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Updated */}
                    <td className="px-3 py-2 text-[10px] text-slate-400">
                      {new Date(page.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div 
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`/${page.slug === 'home' ? '' : page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="View live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => togglePublish(page)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title={page.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {page.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => toggleMaintenance(page)}
                          className={`p-1.5 rounded transition-colors ${
                            page.isMaintenance
                              ? 'text-red-500 hover:text-red-700 hover:bg-red-50 bg-red-50/50'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={page.isMaintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicatePage(page)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/admin/pages/${page.slug}/edit`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(page)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete page?</h3>
            <p className="text-xs text-slate-500 mb-4">
              <strong>&quot;{confirmDelete.title}&quot;</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePage(confirmDelete)}
                disabled={!!deletingId}
                className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {deletingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
