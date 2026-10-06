'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Upload, Search, Loader2, ChevronRight, Copy, Check, Image as ImageIcon, Home
} from 'lucide-react';
import { toast } from './AdminToaster';
import { 
  WindowsFolderIcon, FilePlaceholder, FolderCard, FileCard, MediaFolder, MediaItem 
} from './MediaGridItems';

interface MediaExplorerDialogProps {
  mode: 'move' | 'pick';
  initialFolderId?: string | null;
  currentUrl?: string | null;
  initialUrl?: string | null;
  moveItemCount?: number; // only for 'move' mode
  filter?: 'image' | 'video' | 'all'; // only for 'pick' mode
  allowMultiple?: boolean;
  onClose: () => void;
  onConfirm?: (targetFolderId: string | null) => void; // only for 'move' mode
  onSelect?: (url: string, item?: MediaItem) => void; // only for 'pick' mode
  onSelectMultiple?: (urls: string[], items?: MediaItem[]) => void;
}

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function MediaExplorerDialog({
  mode,
  initialFolderId = null,
  currentUrl = null,
  initialUrl = null,
  moveItemCount = 0,
  filter = 'all',
  allowMultiple = false,
  onClose,
  onConfirm,
  onSelect,
  onSelectMultiple
}: MediaExplorerDialogProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
  
  const [dialogSearch, setDialogSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>(
    filter === 'all' ? 'all' : filter === 'image' ? 'image' : 'video'
  );
  
  // Selection states
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set(['pages']));

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Position and Size states
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [dialogSize, setDialogSize] = useState({ width: 860, height: 500 });
  const [isDialogDragging, setIsDialogDragging] = useState(false);
  const [isDialogResizing, setIsDialogResizing] = useState(false);
  const [dialogReady, setDialogReady] = useState(false);
  
  const dialogDragOffset = useRef({ x: 0, y: 0 });
  const dialogResizeEdge = useRef<string>('');
  const dialogResizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Center window on mount, then reveal after position is set
  useEffect(() => {
    const w = 860;
    const h = 500;
    setDialogSize({ width: w, height: h });
    setDialogPosition({
      x: (window.innerWidth - w) / 2,
      y: (window.innerHeight - h) / 2
    });
    requestAnimationFrame(() => setDialogReady(true));
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/media/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
        return data;
      }
    } catch {}
    return [];
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        return data;
      }
    } catch {}
    return [];
  }, []);

  const initData = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'pick') {
        const [foldersData, filesData] = await Promise.all([
          fetch('/api/media/folders').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/media').then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        setFolders(foldersData);
        setFiles(filesData);

        const targetUrl = (currentUrl || initialUrl || '').trim();
        if (targetUrl && Array.isArray(filesData) && filesData.length > 0) {
          const matched = filesData.find((f: MediaItem) => 
            f.url === targetUrl ||
            (f.url && targetUrl.endsWith(f.url)) ||
            (f.filename && targetUrl.includes(f.filename)) ||
            (f.originalName && targetUrl.includes(encodeURIComponent(f.originalName)))
          );

          if (matched) {
            const folderId = matched.folderId || null;
            setSelectedFileId(matched.id);
            setCurrentFolderId(folderId);
            setSelectedFolderId(folderId);

            if (folderId && Array.isArray(foldersData)) {
              const expanded = new Set<string>(['pages']);
              let curr = foldersData.find((f: MediaFolder) => f.id === folderId);
              while (curr) {
                expanded.add(curr.id);
                if (curr.parentId) expanded.add(curr.parentId);
                curr = foldersData.find((f: MediaFolder) => f.id === curr?.parentId);
              }
              setExpandedFolderIds(expanded);
            }
          } else if (initialFolderId !== undefined) {
            setCurrentFolderId(initialFolderId);
            setSelectedFolderId(initialFolderId);
          } else {
            setCurrentFolderId(null);
            setSelectedFolderId(null);
          }
        } else if (initialFolderId !== undefined) {
          setCurrentFolderId(initialFolderId);
          setSelectedFolderId(initialFolderId);
        } else {
          setCurrentFolderId(null);
          setSelectedFolderId(null);
        }
      } else {
        const foldersData = await fetch('/api/media/folders').then(r => r.ok ? r.json() : []).catch(() => []);
        setFolders(foldersData);
        setCurrentFolderId(initialFolderId);
        setSelectedFolderId(initialFolderId);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, currentUrl, initialUrl, initialFolderId]);

  useEffect(() => {
    initData();
  }, [initData]);

  // Dialog drag effect
  useEffect(() => {
    if (!isDialogDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setDialogPosition({
        x: Math.max(0, Math.min(window.innerWidth - dialogSize.width, e.clientX - dialogDragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - dialogSize.height, e.clientY - dialogDragOffset.current.y)),
      });
    };
    const handleMouseUp = () => setIsDialogDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDialogDragging, dialogSize]);

  // Dialog resize effect
  useEffect(() => {
    if (!isDialogResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { x: sx, y: sy, w: sw, h: sh, px, py } = dialogResizeStart.current;
      const edge = dialogResizeEdge.current;
      let dx = e.clientX - sx, dy = e.clientY - sy;
      let nw = sw, nh = sh, nx = px, py2 = py;
      if (edge.includes('e')) nw = Math.max(500, sw + dx);
      if (edge.includes('s')) nh = Math.max(350, sh + dy);
      if (edge.includes('w')) { nw = Math.max(500, sw - dx); nx = px + sw - nw; }
      if (edge.includes('n')) { nh = Math.max(350, sh - dy); py2 = py + sh - nh; }
      setDialogSize({ width: nw, height: nh });
      setDialogPosition({ x: nx, y: py2 });
    };
    const handleMouseUp = () => setIsDialogResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDialogResizing]);

  const handleDialogResizeMouseDown = (e: React.MouseEvent, edge: string) => {
    e.stopPropagation(); e.preventDefault();
    dialogResizeEdge.current = edge;
    dialogResizeStart.current = { x: e.clientX, y: e.clientY, w: dialogSize.width, h: dialogSize.height, px: dialogPosition.x, py: dialogPosition.y };
    setIsDialogResizing(true);
  };

  const handleDialogTitleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    dialogDragOffset.current = { x: e.clientX - dialogPosition.x, y: e.clientY - dialogPosition.y };
    setIsDialogDragging(true);
  };

  const handleUpload = async (filesList: FileList | null) => {
    if (!filesList?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', filesList[0]);
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }
    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('File uploaded');
        setSelectedFileId(null);
        await fetchMedia();
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFolder = (id: string | null) => {
    setSelectedFolderId(id);
    if (mode === 'move') {
      setSelectedFileId(null);
    }
  };

  const handleEnterFolder = (id: string | null) => {
    setCurrentFolderId(id);
    setSelectedFolderId(id);
    if (id) {
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        let curr = folders.find(f => f.id === id);
        while (curr) {
          if (curr.parentId) next.add(curr.parentId);
          curr = folders.find(f => f.id === curr?.parentId);
        }
        return next;
      });
    }
  };

  // Filter folders in directory
  const currentFolders = folders.filter(f => f.parentId === currentFolderId && f.name.toLowerCase().includes(dialogSearch.toLowerCase()));

  // Filter files based on search, type option, and folder nesting
  const filteredFiles = files.filter(file => {
    const isSearchMatched = file.originalName.toLowerCase().includes(dialogSearch.toLowerCase());
    
    let isTypeMatched = true;
    if (typeFilter === 'image') isTypeMatched = file.mimeType.startsWith('image/');
    else if (typeFilter === 'video') isTypeMatched = file.mimeType.startsWith('video/');
    else if (typeFilter === 'document') isTypeMatched = !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/');
    
    // Directory nesting check:
    // When searching, search across all files. Otherwise, show files in the current folder (or root files at Home).
    const isFolderMatched = dialogSearch.trim() !== '' 
      ? true 
      : (currentFolderId === null ? (!file.folderId || true) : file.folderId === currentFolderId);

    return isSearchMatched && isTypeMatched && isFolderMatched;
  });

  const selectedFile = files.find(f => f.id === selectedFileId);
  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose} />
      
      {/* Resizable & Draggable Dialog Window */}
      <div
        className={`absolute bg-white rounded-lg shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-slate-700 select-none transition-opacity duration-75 ${dialogReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: dialogPosition.x, top: dialogPosition.y, width: dialogSize.width, height: dialogSize.height }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div
          className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-3 shrink-0 cursor-move"
          onMouseDown={handleDialogTitleMouseDown}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4h8v8H4V6h5.17l2 2H20v2z"/>
            </svg>
            <span className="text-xs font-semibold text-slate-700">
              {mode === 'move' 
                ? `Select Folder — Move ${moveItemCount} item${moveItemCount !== 1 ? 's' : ''}` 
                : 'Select File — File Manager'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-500 hover:text-white rounded text-slate-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation & Address Bar */}
        <div className="h-10 border-b border-slate-200 flex items-center gap-2 px-3 shrink-0 bg-slate-50/50">
          {/* Back up arrow */}
          <button 
            disabled={currentFolderId === null}
            onClick={() => {
              const current = folders.find(f => f.id === currentFolderId);
              const parent = current ? (current.parentId ?? null) : null;
              handleEnterFolder(parent);
            }}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
            title="Up to parent folder"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>

          {/* Breadcrumb Path Address Bar */}
          <div className="flex-1 h-7 border border-slate-200 rounded bg-white px-2 flex items-center gap-1 text-xs text-slate-600 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-slate-400 text-xs">This PC</span>
            <ChevronRight className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            <button onClick={() => handleEnterFolder(null)} className="hover:text-blue-600 text-xs font-medium">Home</button>
            {currentFolderId && (() => {
              const path: MediaFolder[] = [];
              let currId: string | null | undefined = currentFolderId;
              while (currId) {
                const currentFolder = folders.find(f => f.id === currId);
                if (!currentFolder) break;
                path.unshift(currentFolder);
                currId = currentFolder.parentId;
              }
              return path.map(f => (
                <React.Fragment key={f.id}>
                  <ChevronRight className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                  <button onClick={() => handleEnterFolder(f.id)} className="hover:text-blue-600 text-xs font-medium truncate max-w-[100px]">{f.name}</button>
                </React.Fragment>
              ));
            })()}
          </div>

          {/* Search files */}
          <div className="relative w-40 shrink-0">
            <Search className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={mode === 'move' ? "Search folders..." : "Search files..."}
              value={dialogSearch}
              onChange={e => setDialogSearch(e.target.value)}
              className="w-full h-7 pl-2 pr-8 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-slate-400 bg-white"
            />
          </div>

          {/* Upload directly (only in pick mode) */}
          {mode === 'pick' && (
            <label className="h-7 px-2.5 flex items-center gap-1 text-xs font-medium border border-slate-200 rounded text-slate-600 bg-white hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-colors shrink-0 select-none">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => handleUpload(e.target.files)}
              />
            </label>
          )}
        </div>

        {/* Workspace Panel */}
        <div className="flex-1 flex min-h-0">
          
          {/* Left Navigation pane */}
          <div className="w-44 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2 shrink-0 select-none">
            <div className="mb-3">
              <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Quick Access</p>
              <button 
                onClick={() => handleEnterFolder(null)}
                className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors rounded-none ${
                  currentFolderId === null ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="truncate">Home</span>
              </button>
            </div>
            <div>
              <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Folders</p>
              <div className="space-y-0.5">
                {folders.filter(f => !f.parentId).map(folder => {
                  const childFolders = folders.filter(f => f.parentId === folder.id);
                  const hasChildren = childFolders.length > 0;
                  const isExpanded = expandedFolderIds.has(folder.id);
                  const isCurrent = currentFolderId === folder.id;

                  return (
                    <div key={folder.id} className="flex flex-col">
                      <div
                        onClick={() => handleEnterFolder(folder.id)}
                        className={`w-full group flex items-center gap-1.5 px-2.5 py-1 text-left text-xs transition-colors cursor-pointer rounded-none ${
                          isCurrent ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {hasChildren ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFolderIds(prev => {
                                const next = new Set(prev);
                                if (next.has(folder.id)) next.delete(folder.id);
                                else next.add(folder.id);
                                return next;
                              });
                            }}
                            className="p-0.5 -ml-1 text-slate-400 hover:text-slate-700 rounded transition-transform"
                          >
                            <ChevronRight className={`h-3 w-3 transition-transform duration-150 ${isExpanded ? 'rotate-90 text-slate-600' : ''}`} />
                          </button>
                        ) : (
                          <span className="w-2.5 shrink-0" />
                        )}

                        <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-4 h-3.5 shrink-0" />
                        <span className="truncate flex-1">{folder.name}</span>
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="flex flex-col pl-3 ml-3.5 border-l border-slate-200/80 space-y-0.5 my-0.5">
                          {childFolders.map(child => {
                            const isChildCurrent = currentFolderId === child.id;
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleEnterFolder(child.id)}
                                className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors rounded-none ${
                                  isChildCurrent ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                              >
                                <WindowsFolderIcon color={child.color} icon={child.icon} className="w-3.5 h-3 shrink-0" />
                                <span className="truncate flex-1">{child.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right main grid area */}
          <div className="flex-1 bg-white overflow-y-auto p-3 flex min-h-0 flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 select-none py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-xs">Loading explorer data...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {/* 1. Folders loop */}
                {(mode === 'move' || currentFolders.length > 0) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Folders</p>
                    {mode === 'move' && currentFolderId && (
                      <div 
                        onClick={() => {
                          const current = folders.find(f => f.id === currentFolderId);
                          const parent = current ? (current.parentId ?? null) : null;
                          handleEnterFolder(parent);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer select-none mb-2"
                      >
                        <div className="w-7 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">.. (Up)</span>
                      </div>
                    )}
                    {currentFolders.length === 0 && mode === 'move' ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-12 select-none">
                        <p className="text-xs font-medium">No folders found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {currentFolders.map(folder => {
                          const isSelected = selectedFolderId === folder.id;
                          return (
                            <div 
                              key={folder.id}
                              onClick={() => handleSelectFolder(folder.id)}
                              onDoubleClick={() => handleEnterFolder(folder.id)}
                              className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer select-none transition-all ${
                                isSelected 
                                  ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-200' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-7 h-6 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-700 truncate">{folder.name}</p>
                                <p className="text-[9px] text-slate-400">{folder.fileCount} item{folder.fileCount !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Files loop (only in pick mode) */}
                {mode === 'pick' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Files {allowMultiple && selectedFileIds.size > 0 && `(${selectedFileIds.size} selected)`}
                      </p>
                      {allowMultiple && filteredFiles.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFileIds(new Set(filteredFiles.map(f => f.id)));
                              if (filteredFiles.length > 0) setSelectedFileId(filteredFiles[0].id);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          {selectedFileIds.size > 0 && (
                            <>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFileIds(new Set());
                                  setSelectedFileId(null);
                                }}
                                className="text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {filteredFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-12 select-none">
                        <ImageIcon className="w-10 h-10 text-slate-200 mb-2" />
                        <p className="text-xs font-medium">No files found</p>
                      </div>
                    ) : (
                      <div className="grid gap-x-3 gap-y-2.5 w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}>
                        {filteredFiles.map(file => {
                          const isSelected = allowMultiple 
                            ? selectedFileIds.has(file.id) 
                            : selectedFileId === file.id;
                          return (
                            <FileCard 
                              key={file.id}
                              file={file}
                              isSelected={isSelected}
                              size="large"
                              onClick={() => {
                                if (allowMultiple) {
                                  setSelectedFileIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(file.id)) next.delete(file.id);
                                    else next.add(file.id);
                                    return next;
                                  });
                                  setSelectedFileId(file.id);
                                } else {
                                  setSelectedFileId(isSelected ? null : file.id);
                                }
                              }}
                              onDoubleClick={() => {
                                if (allowMultiple) {
                                  const targetIds = new Set(selectedFileIds);
                                  targetIds.add(file.id);
                                  const selectedItems = files.filter(f => targetIds.has(f.id));
                                  const selectedUrls = selectedItems.map(f => f.url);
                                  onSelectMultiple?.(selectedUrls, selectedItems);
                                  onSelect?.(file.url, file);
                                } else {
                                  onSelect?.(file.url, file);
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details Sidebar (only in pick mode and when file selected) */}
          {mode === 'pick' && selectedFile && (
            <div className="w-52 border-l border-slate-200 p-3 shrink-0 overflow-y-auto bg-slate-50 flex flex-col select-none">
              <div className="aspect-square bg-white border border-slate-200 rounded overflow-hidden mb-3 flex items-center justify-center">
                {selectedFile.mimeType.startsWith('image/') ? (
                  <img src={selectedFile.url} alt={selectedFile.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <FilePlaceholder mimeType={selectedFile.mimeType} className="w-12 h-16" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-700 truncate mb-1">{selectedFile.originalName}</p>
              <div className="space-y-1 text-[9px] text-slate-400 font-medium">
                <p>Type: <span className="text-slate-600">{selectedFile.mimeType}</span></p>
                <p>Size: <span className="text-slate-600">{formatSize(selectedFile.size)}</span></p>
                <p>Added: <span className="text-slate-600">{new Date(selectedFile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
              </div>
              
              <div className="mt-3 flex gap-1 bg-white border border-slate-200 rounded p-1">
                <input readOnly value={selectedFile.url} className="flex-1 min-w-0 text-[9px] font-mono text-slate-500 focus:outline-none truncate" />
                <button onClick={() => { navigator.clipboard.writeText(window.location.origin + selectedFile.url); toast.success('URL copied'); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 shrink-0">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
            <span className="text-xs text-slate-500 shrink-0">
              {mode === 'move' ? 'Folder:' : 'File name:'}
            </span>
            <input 
              type="text" 
              readOnly 
              value={mode === 'move' 
                ? (selectedFolderId === null ? 'Home' : (selectedFolder ? selectedFolder.name : '')) 
                : allowMultiple 
                ? (selectedFileIds.size > 0 ? `${selectedFileIds.size} file${selectedFileIds.size !== 1 ? 's' : ''} selected` : 'No files selected')
                : (selectedFile ? selectedFile.originalName : '')}
              className="flex-1 h-7 px-2 border border-slate-200 rounded bg-slate-100 text-xs text-slate-600 focus:outline-none select-none truncate font-medium"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* File type filter select (only in pick mode) */}
            {mode === 'pick' && (
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="h-7 px-2 border border-slate-200 rounded bg-white text-xs text-slate-600 focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All Files (*.*)</option>
                <option value="image">Images (*.jpg;*.png;*.webp;*.ico)</option>
                <option value="video">Videos (*.mp4;*.webm;*.ogg)</option>
                <option value="document">Documents (*.pdf;*.docx;*.xls)</option>
              </select>
            )}

            <button 
              onClick={onClose}
              className="h-8 px-4 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (mode === 'move') {
                  onConfirm?.(selectedFolderId);
                } else if (allowMultiple) {
                  const selectedItems = files.filter(f => selectedFileIds.has(f.id));
                  const selectedUrls = selectedItems.map(f => f.url);
                  if (selectedUrls.length > 0) {
                    onSelectMultiple?.(selectedUrls, selectedItems);
                    if (onSelect) onSelect(selectedUrls[0], selectedItems[0]);
                  }
                } else {
                  if (selectedFile) {
                    onSelect?.(selectedFile.url, selectedFile);
                  }
                }
              }}
              disabled={mode === 'move' ? false : allowMultiple ? selectedFileIds.size === 0 : !selectedFile}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {mode === 'move' 
                ? 'Move Here' 
                : allowMultiple 
                ? `Add Selected (${selectedFileIds.size})` 
                : 'Open'}
            </button>
          </div>
        </div>

        {/* Resize Handles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'n')} />
          <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 's')} />
          <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'w')} />
          <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'e')} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'se')} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'sw')} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'ne')} />
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize pointer-events-auto" onMouseDown={e => handleDialogResizeMouseDown(e, 'nw')} />
        </div>

      </div>
    </div>
  );
}
