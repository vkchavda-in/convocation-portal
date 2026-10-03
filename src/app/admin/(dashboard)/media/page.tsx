'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, Search, Image as ImageIcon, FileText, Film, File,
  Loader2, Copy, Trash2, LayoutGrid, List, FolderPlus, Folder, FolderOpen,
  Check, MoveRight, Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string;
  folder?: string;
  createdAt: string;
}

const DEFAULT_FOLDERS = ['All', '2026', '2025', '2024', '2023', '2022', '2021', 'Dignitaries', 'Awardees', 'General'];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function MediaIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType.startsWith('video/')) return <Film className={className} />;
  if (mimeType.includes('pdf')) return <FileText className={className} />;
  return <File className={className} />;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Folder Modal
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Detail Modal & Replacement states
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingAlt, setEditingAlt] = useState('');
  const [editingFolder, setEditingFolder] = useState('General');
  const [savingDetails, setSavingDetails] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Compute all available unique folders
  const allFolders = Array.from(
    new Set([
      ...DEFAULT_FOLDERS,
      ...customFolders,
      ...media.map((m) => m.folder || 'General'),
    ])
  );

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data: MediaItem[] = await res.json();
        setMedia(data);
      }
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleSaveDetails = async () => {
    if (!selectedItem) return;
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/media/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt: editingAlt, folder: editingFolder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMedia((prev) => prev.map((m) => (m.id === selectedItem.id ? updated : m)));
        setSelectedItem(updated);
        toast.success('Media details updated successfully');
      } else {
        toast.error('Failed to update media');
      }
    } catch {
      toast.error('Network error. Failed to save changes.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    if (!customFolders.includes(trimmed)) {
      setCustomFolders((prev) => [...prev, trimmed]);
    }
    setActiveFolder(trimmed);
    setNewFolderName('');
    setNewFolderOpen(false);
    toast.success(`Folder "${trimmed}" created`);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);

    let successCount = 0;
    const targetFolder = activeFolder === 'All' ? 'General' : activeFolder;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('folder', targetFolder);
      try {
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        if (res.ok) successCount++;
      } catch (e) {
        console.error('Upload failed for', files[i].name, e);
      }
    }

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file${successCount !== 1 ? 's' : ''} to folder "${targetFolder}"`);
      await fetchMedia();
    } else {
      toast.error('Upload failed');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplace = async (files: FileList | null) => {
    if (!selectedItem || !files?.length) return;
    setReplacing(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    try {
      const res = await fetch(`/api/media/${selectedItem.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMedia((prev) => prev.map((m) => (m.id === selectedItem.id ? data : m)));
        setSelectedItem(data);
        toast.success('File replaced successfully');
      } else {
        toast.error(data.error || 'Failed to replace file');
      }
    } catch {
      toast.error('Network error. Failed to replace file.');
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedia(media.filter((m) => m.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        toast.success('File deleted');
      } else {
        toast.error('Failed to delete file');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast.success('URL copied to clipboard');
  };

  const filtered = media.filter((m) => {
    const matchSearch = m.originalName.toLowerCase().includes(search.toLowerCase()) || (m.alt || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'image'
        ? m.mimeType.startsWith('image/')
        : filter === 'video'
        ? m.mimeType.startsWith('video/')
        : m.mimeType.includes('pdf') || m.mimeType.includes('document');

    const itemFolder = m.folder || 'General';
    const matchFolder = activeFolder === 'All' ? true : itemFolder === activeFolder;

    return matchSearch && matchFilter && matchFolder;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="sticky top-0 z-20 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <h1 className="text-sm font-semibold text-slate-800">Media Library</h1>
          </div>
          {!loading && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
              {filtered.length} of {media.length} files
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            New Folder
          </button>
          <label
            className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3.5 py-1.5 rounded cursor-pointer transition-colors shadow-sm"
            style={{ background: '#2563eb' }}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading...' : `Upload to ${activeFolder === 'All' ? 'General' : activeFolder}`}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Folders Bar & Quick Switcher */}
      <div className="px-6 py-2.5 bg-slate-900 text-white border-b border-slate-800 flex items-center gap-2 overflow-x-auto select-none scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mr-1 shrink-0">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          Folders:
        </span>
        <div className="flex items-center gap-1.5">
          {allFolders.map((f) => {
            const isActive = activeFolder === f;
            const count = f === 'All' ? media.length : media.filter((m) => (m.folder || 'General') === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFolder(f)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {isActive ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5 text-slate-400" />}
                <span>{f}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-700/60 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-400/90 hover:text-amber-300 border border-dashed border-amber-400/30 hover:border-amber-400 transition-colors shrink-0"
          >
            <FolderPlus className="w-3 h-3" />
            <span>Add Year/Custom</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
          {(['all', 'image', 'video', 'document'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-52 transition-all"
            />
          </div>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setView('grid')}
              className={`p-1 rounded cursor-pointer ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1 rounded cursor-pointer ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm">Loading media library...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
            <Folder className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-1">
              {search
                ? 'No files match your search'
                : activeFolder !== 'All'
                ? `No files in folder "${activeFolder}" yet`
                : 'Media Library is empty'}
            </p>
            <p className="text-xs text-slate-400 mb-4 max-w-sm text-center">
              Upload images, videos, and documents to organize and use across your convocation portal.
            </p>
            <label
              className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-sm"
              style={{ background: '#2563eb' }}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Files to {activeFolder === 'All' ? 'General' : activeFolder}
              <input type="file" className="hidden" multiple onChange={(e) => handleUpload(e.target.files)} />
            </label>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setEditingAlt(item.alt || '');
                  setEditingFolder(item.folder || 'General');
                }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  {item.mimeType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <MediaIcon mimeType={item.mimeType} className="w-10 h-10 text-slate-400" />
                  )}

                  {/* Folder Tag Badge */}
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-amber-400 backdrop-blur-sm border border-white/10">
                    {item.folder || 'General'}
                  </span>

                  {/* Hover Actions */}
                  <div
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-800 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-50">
                    <span className="text-[9px] text-slate-400 font-medium">{formatSize(item.size)}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">{item.mimeType.split('/')[1] || 'file'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-12">File</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Folder</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setEditingAlt(item.alt || '');
                      setEditingFolder(item.folder || 'General');
                    }}
                    className="border-b border-slate-50 hover:bg-amber-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.mimeType.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                        ) : (
                          <MediaIcon mimeType={item.mimeType} className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-xs font-medium text-slate-700 truncate max-w-xs" title={item.originalName}>{item.originalName}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs font-mono">{item.url}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        <Folder className="w-2.5 h-2.5 text-amber-500" />
                        {item.folder || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500 font-mono">{formatSize(item.size)}</td>
                    <td className="px-4 py-2 text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyUrl(item.url)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {newFolderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setNewFolderOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <FolderPlus size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Create New Media Folder</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter a year (e.g. <strong>2021</strong>, <strong>2020</strong>) or category name for grouping files.
            </p>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. 2021, Dignitaries, Gold Medals"
                autoFocus
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewFolderOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Edit Folder Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col md:flex-row max-h-[90vh] border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Preview Panel */}
            <div className="md:w-1/2 bg-slate-950 flex items-center justify-center p-6 min-h-[240px] relative">
              {selectedItem.mimeType.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedItem.url}
                  alt={selectedItem.alt}
                  className="max-w-full max-h-[350px] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center text-white/50 space-y-2">
                  <MediaIcon mimeType={selectedItem.mimeType} className="w-16 h-16 mx-auto opacity-40 text-white" />
                  <p className="text-xs uppercase tracking-wider">{selectedItem.mimeType}</p>
                </div>
              )}
            </div>

            {/* Right Details Panel */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-none">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 truncate" title={selectedItem.originalName}>
                    {selectedItem.originalName}
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                {/* Metadata list */}
                <div className="space-y-3 text-xs mb-5">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">File URL</span>
                    <div className="flex items-center gap-1.5 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-[10px] text-slate-600 truncate">
                      <span className="truncate flex-1">{selectedItem.url}</span>
                      <button
                        onClick={() => copyUrl(selectedItem.url)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                        title="Copy URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Folder Switcher */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Folder / Category
                    </span>
                    <select
                      value={editingFolder}
                      onChange={(e) => setEditingFolder(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {allFolders.filter((f) => f !== 'All').map((f) => (
                        <option key={f} value={f}>
                          📁 {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</span>
                      <span className="block mt-1 font-semibold text-slate-700">{formatSize(selectedItem.size)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                      <span className="block mt-1 font-semibold text-slate-700 uppercase">{selectedItem.mimeType.split('/')[1] || 'Unknown'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded On</span>
                    <span className="block mt-1 font-medium text-slate-700">
                      {new Date(selectedItem.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Alt text field */}
                <div className="mb-4 pt-3 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Alt Text (SEO description)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingAlt}
                      onChange={(e) => setEditingAlt(e.target.value)}
                      placeholder="Describe this image..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      onClick={handleSaveDetails}
                      disabled={savingDetails}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      {savingDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently delete this media file?')) {
                      handleDelete(selectedItem.id);
                      setSelectedItem(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete File
                </button>

                <div>
                  <button
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={replacing}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {replacing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {replacing ? 'Replacing...' : 'Replace File'}
                  </button>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    onChange={(e) => handleReplace(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
