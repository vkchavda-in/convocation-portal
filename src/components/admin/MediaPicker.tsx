'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Upload, Search, Image as ImageIcon, FileText, Film, File, Loader2, Check, Folder, FolderOpen } from 'lucide-react';
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

interface Props {
  onSelect: (url: string, item?: MediaItem) => void;
  onClose: () => void;
  filter?: 'image' | 'video' | 'all';
}

function MediaIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType.startsWith('video/')) return <Film className={className} />;
  if (mimeType.includes('pdf')) return <FileText className={className} />;
  return <File className={className} />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function MediaPicker({ onSelect, onClose, filter = 'all' }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) setMedia(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const allFolders = Array.from(
    new Set(['All', '2026', '2025', '2024', '2023', '2022', '2021', 'Dignitaries', 'Awardees', 'General', ...media.map((m) => m.folder || 'General')])
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('folder', activeFolder === 'All' ? 'General' : activeFolder);
    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      if (res.ok) {
        const item = await res.json();
        toast.success('File uploaded');
        await fetchMedia();
        setSelected(item.id);
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = media.filter((m) => {
    const matchSearch = m.originalName.toLowerCase().includes(search.toLowerCase()) || (m.alt || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'image' ? m.mimeType.startsWith('image/') :
      filter === 'video' ? m.mimeType.startsWith('video/') : true;
    const matchFolder = activeFolder === 'All' ? true : (m.folder || 'General') === activeFolder;
    return matchSearch && matchFilter && matchFolder;
  });

  const selectedItem = media.find((m) => m.id === selected);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        style={{ width: '840px', height: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Choose Media Asset</h2>
            {filter !== 'all' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold capitalize">
                {filter}s only
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-600 cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={filter === 'image' ? 'image/*' : filter === 'video' ? 'video/*' : '*'}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folders Bar */}
        <div className="px-5 py-2 bg-slate-900 text-white flex items-center gap-1.5 overflow-x-auto select-none shrink-0 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Folders:
          </span>
          {allFolders.map((f) => {
            const isActive = activeFolder === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFolder(f)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {isActive ? <FolderOpen size={12} /> : <Folder size={12} className="text-slate-400" />}
                {f}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Loading media...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <Folder className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">{search ? 'No files match your search' : `No files in "${activeFolder}"`}</p>
                <label className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">
                  Upload file here
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                </label>
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(selected === item.id ? null : item.id)}
                    className="relative rounded-xl overflow-hidden border-2 transition-all text-left group cursor-pointer bg-white shadow-xs"
                    style={{
                      borderColor: selected === item.id ? '#eab308' : 'rgba(226, 232, 240, 0.8)',
                    }}
                  >
                    <div className="aspect-square flex items-center justify-center bg-slate-900 overflow-hidden">
                      {item.mimeType.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.alt} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <MediaIcon mimeType={item.mimeType} className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    {selected === item.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-slate-950 font-bold" />
                      </div>
                    )}
                    <p className="px-1.5 py-1 text-[10px] font-semibold text-slate-700 truncate">{item.originalName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — selected info */}
          {selectedItem && (
            <div className="w-56 border-l border-slate-200 p-4 flex-shrink-0 overflow-y-auto bg-white flex flex-col justify-between">
              <div>
                <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden mb-3 shadow-inner">
                  {selectedItem.mimeType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedItem.url} alt={selectedItem.alt} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MediaIcon mimeType={selectedItem.mimeType} className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-800 truncate mb-1" title={selectedItem.originalName}>
                  {selectedItem.originalName}
                </p>
                <div className="space-y-1 text-[10px] text-slate-500 font-medium">
                  <p>📁 Folder: <span className="font-bold text-slate-700">{selectedItem.folder || 'General'}</span></p>
                  <p>📦 Size: {formatSize(selectedItem.size)}</p>
                  <p>🗓️ {new Date(selectedItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="text-[10px] font-mono text-slate-500 break-all mt-2 p-1.5 bg-slate-50 rounded border border-slate-200 select-all">
                  {selectedItem.url}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelect(selectedItem.url, selectedItem)}
                className="w-full mt-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Use Selected Image
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-white flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} file{filtered.length !== 1 ? 's' : ''} in {activeFolder}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && selectedItem && onSelect(selectedItem.url, selectedItem)}
              disabled={!selected}
              className="px-4 py-1.5 text-xs text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-40 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-sm"
            >
              Select File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
