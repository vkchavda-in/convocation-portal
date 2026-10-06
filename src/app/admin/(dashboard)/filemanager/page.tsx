'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Folder, FolderOpen, Image as ImageIcon, Film, FileText, File as FileIcon,
  Users, Camera, BadgeCheck, Building2, Star, Heart, Upload, Search,
  LayoutGrid, List, Columns, ChevronRight, Plus, Trash2, Copy, Scissors, Clipboard,
  Edit2, FolderInput, X, HardDrive, SortAsc, SortDesc, Loader2,
  FolderPlus, RefreshCw, ExternalLink, Check, AlertCircle, Home, ChevronDown, ChevronUp, Pin, History,
  Minus, Square, Printer, Share2, RotateCw, RotateCcw, ZoomIn, ZoomOut, Info, CheckCircle2, UploadCloud
} from 'lucide-react';
import { toast } from '@/components/admin/AdminToaster';
import { FolderCard, FileCard } from '@/components/admin/MediaGridItems';
import MediaExplorerDialog from '@/components/admin/MediaExplorerDialog';

interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  parentId?: string | null;
  fileCount: number;
  totalSize: number;
  createdAt: string;
}

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string;
  folderId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const getMediaUrl = (url: string, updatedAt?: string) => {
  if (!url) return '';
  if (!updatedAt) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${new Date(updatedAt).getTime()}`;
};

interface Stats {
  totalSize: number;
  totalFiles: number;
  byType: { images: number; videos: number; documents: number };
  rootFiles: number;
}

type ViewType = 'details' | 'list' | 'tiles' | 'content' | 'small-icons' | 'medium-icons' | 'large-icons' | 'extra-large-icons';

const VIEW_ORDER: ViewType[] = [
  'details',
  'list',
  'tiles',
  'content',
  'small-icons',
  'medium-icons',
  'large-icons',
  'extra-large-icons'
];

const PRESET_COLORS = [
  { value: '#2563EB', bg: 'bg-blue-600' },
  { value: '#10B981', bg: 'bg-emerald-500' },
  { value: '#EF4444', bg: 'bg-red-500' },
  { value: '#F59E0B', bg: 'bg-amber-500' },
  { value: '#8B5CF6', bg: 'bg-purple-500' },
  { value: '#14B8A6', bg: 'bg-teal-500' },
];

const PRESET_ICONS = ['folder', 'image', 'film', 'file-text', 'users', 'camera', 'badge-check', 'building-2', 'star', 'heart'];

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
}
function getFolderPath(folderId: string | null | undefined, folders: MediaFolder[]): string {
  if (!folderId) return 'Home';
  const path: string[] = [];
  let currId: string | null | undefined = folderId;
  const visited = new Set<string>();
  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const f = folders.find(folder => folder.id === currId);
    if (!f) break;
    path.unshift(f.name);
    currId = f.parentId;
  }
  return ['Home', ...path].join('\\');
}
function FluentHomeIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 12H5V20H10V14H14V20H19V12H22L12 3Z" fill="#2563EB" />
    </svg>
  );
}

function FluentRecycleBinIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="#EF4444" />
    </svg>
  );
}

function FolderIcon({ icon, className = '' }: { icon: string; className?: string }) {
  switch (icon) {
    case 'image': return <ImageIcon className={className} />;
    case 'film': return <Film className={className} />;
    case 'file-text': return <FileText className={className} />;
    case 'users': return <Users className={className} />;
    case 'camera': return <Camera className={className} />;
    case 'badge-check': return <BadgeCheck className={className} />;
    case 'building-2': return <Building2 className={className} />;
    case 'star': return <Star className={className} />;
    case 'heart': return <Heart className={className} />;
    default: return <Folder className={className} />;
  }
}

function FolderOverlayIcon({ name, x = 24, y = 23, width = 16, height = 16, className = "text-white" }: { name: string; x?: number; y?: number; width?: number; height?: number; className?: string }) {
  const props = { x, y, width, height, className, strokeWidth: 2.2 };
  switch (name) {
    case 'image': return <ImageIcon {...props} />;
    case 'film': return <Film {...props} />;
    case 'file-text': return <FileText {...props} />;
    case 'users': return <Users {...props} />;
    case 'camera': return <Camera {...props} />;
    case 'badge-check': return <BadgeCheck {...props} />;
    case 'building-2': return <Building2 {...props} />;
    case 'star': return <Star {...props} />;
    case 'heart': return <Heart {...props} />;
    default: return null;
  }
}

function WindowsFolderIcon({ color, icon, className = "w-14 h-12" }: { color: string; icon: string; className?: string }) {
  // Classic Windows 11 style folder with fluent gradients & flat clean appearance (no shadows).
  // Pinned/colored folders use their color, default folders use the legacy yellow (#EAB308)
  const isDefaultColor = color === '#2563EB';
  const folderColor = isDefaultColor ? '#EAB308' : color;
  
  return (
    <svg viewBox="0 0 64 52" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`back-${folderColor.replace('#', '')}`} x1="0" y1="0" x2="64" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={folderColor} stopOpacity={0.88} />
          <stop offset="100%" stopColor={folderColor} stopOpacity={0.72} />
        </linearGradient>
        <linearGradient id={`front-${folderColor.replace('#', '')}`} x1="0" y1="12" x2="64" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={folderColor} stopOpacity={1} />
          <stop offset="100%" stopColor={folderColor} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      
      {/* Folder Back Body */}
      <path 
        d="M2 7C2 5.34315 3.34315 4 5 4H20.5C21.84 4 23.04 4.7 23.7 5.86L26.8 11.29C27.13 11.87 27.73 12.22 28.4 12.22H59C60.6569 12.22 62 13.5631 62 15.22V45C62 46.6569 60.6569 48 59 48H5C3.34315 48 2 46.6569 2 45V7Z" 
        fill={`url(#back-${folderColor.replace('#', '')})`} 
      />
      
      {/* Protruding Files/Papers (only show for special folders, i.e., icon !== 'folder') */}
      {icon !== 'folder' && (
        <>
          <rect x="8" y="7.5" width="48" height="23" rx="2" fill="#FFFFFF" opacity="0.95" />
          <line x1="14" y1="12.5" x2="30" y2="12.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="16.5" x2="44" y2="16.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="20.5" x2="38" y2="20.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
 
      {/* Folder Front Flap */}
      <path 
        d="M2 15.5C2 13.567 3.567 12 5.5 12H58.5C60.433 12 62 13.567 62 15.5V45.5C62 47.433 60.433 49 57.5 49H6.5C4.567 49 2 47.433 2 45.5V15.5Z" 
        fill={`url(#front-${folderColor.replace('#', '')})`}
      />
      
      {/* Front Accent Highlight */}
      <path 
        d="M5.5 12.5H58.5C59.3284 12.5 60 13.1716 60 14C60 14.8284 59.3284 15.5 58.5 15.5H5.5C4.67157 15.5 4 14.8284 4 14C4 13.1716 4.67157 12.5 5.5 12.5Z" 
        fill="#FFFFFF" 
        opacity="0.18" 
      />

      {/* Overlay Icon */}
      <FolderOverlayIcon name={icon} x={24} y={23} width={16} height={16} />
    </svg>
  );
}

function FileTypeIcon({ mimeType, className = '' }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType.startsWith('video/')) return <Film className={className} />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) return <FileText className={className} />;
  return <FileIcon className={className} />;
}

function FilePlaceholder({ mimeType, className = "w-full h-full" }: { mimeType: string; className?: string }) {
  let category: 'pdf' | 'doc' | 'xls' | 'video' | 'audio' | 'code' | 'zip' | 'generic' = 'generic';
  let color = '#64748B'; 
  let label = 'FILE';

  const mime = mimeType.toLowerCase();
  if (mime.includes('pdf')) {
    category = 'pdf';
    color = '#EF4444'; 
    label = 'PDF';
  } else if (mime.includes('word') || mime.includes('document') || mime.includes('officedocument.wordprocessingml')) {
    category = 'doc';
    color = '#2563EB'; 
    label = 'DOC';
  } else if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('officedocument.spreadsheetml') || mime.includes('csv')) {
    category = 'xls';
    color = '#10B981'; 
    label = 'XLS';
  } else if (mime.startsWith('video/')) {
    category = 'video';
    color = '#8B5CF6'; 
    label = 'VID';
  } else if (mime.startsWith('audio/')) {
    category = 'audio';
    color = '#EC4899'; 
    label = 'AUD';
  } else if (mime.includes('zip') || mime.includes('tar') || mime.includes('rar') || mime.includes('gzip')) {
    category = 'zip';
    color = '#F59E0B'; 
    label = 'ZIP';
  } else if (mime.startsWith('text/') || mime.includes('javascript') || mime.includes('json') || mime.includes('html')) {
    category = 'code';
    color = '#06B6D4'; 
    label = 'CODE';
  }

  return (
    <svg className={className} viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="page-shadow" x="-4" y="-2" width="64" height="72" filterUnits="userSpaceOnUse">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.08" />
      </filter>
      
      {/* Page Sheet */}
      <path 
        d="M6 3C6 1.89543 6.89543 1 8 1H38L50 13V61C50 62.1046 49.1046 63 48 63H8C6.89543 63 6 62.1046 6 61V3Z" 
        fill="#FFFFFF" 
        stroke="#E2E8F0"
        strokeWidth="1.25"
        filter="url(#page-shadow)"
      />
      
      {/* Folded Corner */}
      <path 
        d="M38 1V13H50L38 1Z" 
        fill="#F1F5F9" 
        stroke="#E2E8F0"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Styled Mock Document Content Lines (above banner) */}
      <g opacity="0.45" stroke="#94A3B8" strokeWidth="1.25" strokeLinecap="round">
        {category === 'video' ? (
          <path d="M22 8L34 14L22 20V8Z" fill={color} stroke="none" />
        ) : category === 'audio' ? (
          <path d="M24 6V16C24 16.8 23.3 17.5 22.5 17.5C21.7 17.5 21 16.8 21 16C21 15.2 21.7 14.5 22.5 14.5C23 14.5 23.3 14.7 23.5 15V8.5L28.5 7.2V13.5C28.5 14.3 27.8 15 27 15C26.2 15 25.5 14.3 25.5 13.5C25.5 12.7 26.2 12 27 12C27.5 12 27.8 12.2 28 12.5V7.2C28 7.1 27.9 7 27.8 7L24 6Z" fill={color} stroke="none" />
        ) : (
          <>
            <line x1="12" y1="6" x2="30" y2="6" />
            <line x1="12" y1="10" x2="30" y2="10" />
            <line x1="12" y1="14" x2="44" y2="14" />
            <line x1="12" y1="18" x2="44" y2="18" />
          </>
        )}
      </g>

      {/* Full-bleed belt/banner wrapper */}
      <rect x="5.25" y="24" width="45.5" height="18" fill={color} />
      <text 
        x="28" 
        y="36.5" 
        fill="#FFFFFF" 
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="10" 
        fontWeight="900" 
        textAnchor="middle"
        letterSpacing="0.75"
      >
        {label}
      </text>

      {/* Styled Mock Document Content Lines (below banner) */}
      <g opacity="0.45" stroke="#94A3B8" strokeWidth="1.25" strokeLinecap="round">
        <line x1="12" y1="48" x2="44" y2="48" />
        <line x1="12" y1="52" x2="44" y2="52" />
        <line x1="12" y1="56" x2="36" y2="56" />
      </g>
    </svg>
  );
}


export default function MediaLibraryPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [view, setView] = useState<ViewType>('large-icons');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'size' | 'date' | 'manual'>('manual');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MediaItem | MediaFolder | null; type: 'file' | 'folder' | 'background' } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const skipBlurRef = useRef(false);
  const [sidebarPinnedFolderIds, setSidebarPinnedFolderIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('media_sidebar_pinned_folders') || '[]')); } catch { return new Set(); }
  });
  const [quickAccessPinnedFolderIds, setQuickAccessPinnedFolderIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('media_qa_pinned_folders') || '[]')); } catch { return new Set(); }
  });
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#2563EB');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaItem | null>(null);
  const [altValue, setAltValue] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trashedFolders, setTrashedFolders] = useState<MediaFolder[]>([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [savingAlt, setSavingAlt] = useState(false);

  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set(['pages']));
  const [quickAccessExpanded, setQuickAccessExpanded] = useState(true);
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [recentTab, setRecentTab] = useState<'recent' | 'favorites' | 'shared'>('recent');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingItems, setDraggingItems] = useState<{ id: string; name: string; isFolder: boolean }[] | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  // Custom confirmation modals state
  const [confirmMove, setConfirmMove] = useState<{
    items: { id: string; name: string; isFolder: boolean }[];
    targetFolderId: string | null;
    targetFolderName: string;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'folder' | 'items';
    folderId?: string;
    folderName?: string;
    items?: { id: string; name: string; isFolder: boolean }[];
  } | null>(null);

  const [viewerFile, setViewerFile] = useState<MediaItem | null>(null);
  const [viewerMaximized, setViewerMaximized] = useState(false);
  const [viewerZoom, setViewerZoom] = useState(100);
  const [viewerRotation, setViewerRotation] = useState(0);
  const [viewerPosition, setViewerPosition] = useState({ x: 100, y: 50 });
  const [viewerSize, setViewerSize] = useState({ width: 900, height: 600 });
  const [viewerReady, setViewerReady] = useState(false);
  const [imgDimensions, setImgDimensions] = useState('');
  const [isDraggingViewer, setIsDraggingViewer] = useState(false);
  const [isResizingViewer, setIsResizingViewer] = useState(false);
  const viewerResizeEdge = useRef<string>('');
  const viewerResizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });



  const dragStartOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (viewerFile) {
      const w = Math.min(window.innerWidth * 0.85, 1000);
      const h = Math.min(window.innerHeight * 0.85, 700);
      setViewerSize({ width: w, height: h });
      setViewerPosition({
        x: (window.innerWidth - w) / 2,
        y: (window.innerHeight - h) / 2,
      });
      setViewerMaximized(false);
      setViewerZoom(100);
      setViewerRotation(0);
      setImgDimensions('');
      // Use rAF to ensure position is applied before making visible
      requestAnimationFrame(() => setViewerReady(true));
    } else {
      setViewerReady(false);
    }
  }, [viewerFile]);

  useEffect(() => {
    if (!isDraggingViewer) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - dragStartOffset.current.x;
      let newY = e.clientY - dragStartOffset.current.y;
      newX = Math.max(-viewerSize.width + 100, Math.min(window.innerWidth - 100, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 50, newY));
      setViewerPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingViewer(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingViewer, viewerSize]);

  // Viewer resize
  useEffect(() => {
    if (!isResizingViewer) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { x: sx, y: sy, w: sw, h: sh, px, py } = viewerResizeStart.current;
      const edge = viewerResizeEdge.current;
      let dx = e.clientX - sx;
      let dy = e.clientY - sy;
      let nw = sw, nh = sh, nx = px, ny = py;
      if (edge.includes('e')) nw = Math.max(480, sw + dx);
      if (edge.includes('s')) nh = Math.max(320, sh + dy);
      if (edge.includes('w')) { nw = Math.max(480, sw - dx); nx = px + sw - nw; }
      if (edge.includes('n')) { nh = Math.max(320, sh - dy); ny = py + sh - nh; }
      setViewerSize({ width: nw, height: nh });
      setViewerPosition({ x: nx, y: ny });
    };
    const handleMouseUp = () => setIsResizingViewer(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizingViewer]);

  const handleViewerResizeMouseDown = (e: React.MouseEvent, edge: string) => {
    e.stopPropagation(); e.preventDefault();
    viewerResizeEdge.current = edge;
    viewerResizeStart.current = { x: e.clientX, y: e.clientY, w: viewerSize.width, h: viewerSize.height, px: viewerPosition.x, py: viewerPosition.y };
    setIsResizingViewer(true);
  };



  const handleViewerMouseDown = (e: React.MouseEvent) => {
    if (viewerMaximized) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    setIsDraggingViewer(true);
    dragStartOffset.current = {
      x: e.clientX - viewerPosition.x,
      y: e.clientY - viewerPosition.y,
    };
  };

  const handleViewerWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    setViewerZoom(prev => {
      const step = 10;
      const next = delta < 0 ? prev + step : prev - step;
      return Math.max(10, Math.min(500, next));
    });
  };

  const [isEditingViewer, setIsEditingViewer] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [savingCrop, setSavingCrop] = useState(false);

  const startMousePos = useRef({ x: 0, y: 0 });
  const startCropRect = useRef({ x: 10, y: 10, w: 80, h: 80 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation(); e.preventDefault();
    setActiveHandle(handle);
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startCropRect.current = { ...cropRect };
  };

  useEffect(() => {
    if (!activeHandle || !imgRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const imgEl = imgRef.current;
      if (!imgEl) return;
      const imgWidth = imgEl.clientWidth || imgEl.offsetWidth || 1;
      const imgHeight = imgEl.clientHeight || imgEl.offsetHeight || 1;

      // Project screen delta into rotated coordinate space of the image container
      const rad = (-viewerRotation * Math.PI) / 180;
      const screenDx = e.clientX - startMousePos.current.x;
      const screenDy = e.clientY - startMousePos.current.y;
      const rotDx = screenDx * Math.cos(rad) - screenDy * Math.sin(rad);
      const rotDy = screenDx * Math.sin(rad) + screenDy * Math.cos(rad);

      const dx = (rotDx / imgWidth) * 100;
      const dy = (rotDy / imgHeight) * 100;

      setCropRect(prev => {
        let { x, y, w, h } = startCropRect.current;

        if (activeHandle === 'move') {
          x = Math.max(0, Math.min(100 - w, x + dx));
          y = Math.max(0, Math.min(100 - h, y + dy));
        } else if (activeHandle === 'tl') {
          const newX = Math.max(0, Math.min(x + w - 5, x + dx));
          const newY = Math.max(0, Math.min(y + h - 5, y + dy));
          w = w - (newX - x);
          h = h - (newY - y);
          x = newX;
          y = newY;
        } else if (activeHandle === 'tr') {
          const newW = Math.max(5, Math.min(100 - x, w + dx));
          const newY = Math.max(0, Math.min(y + h - 5, y + dy));
          h = h - (newY - y);
          w = newW;
          y = newY;
        } else if (activeHandle === 'bl') {
          const newX = Math.max(0, Math.min(x + w - 5, x + dx));
          const newH = Math.max(5, Math.min(100 - y, h + dy));
          w = w - (newX - x);
          x = newX;
          h = newH;
        } else if (activeHandle === 'br') {
          w = Math.max(5, Math.min(100 - x, w + dx));
          h = Math.max(5, Math.min(100 - y, h + dy));
        }

        return { x, y, w, h };
      });
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeHandle, viewerRotation]);

  const handleSaveCrop = async (saveAsCopy: boolean) => {
    if (!viewerFile || !imgRef.current) return;
    setSavingCrop(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const cleanUrl = viewerFile.url;
      img.src = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}crop_ts=${Date.now()}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for cropping'));
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const is90 = viewerRotation % 180 !== 0;
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const rotW = is90 ? origH : origW;
      const rotH = is90 ? origW : origH;

      const cropX = Math.max(0, (cropRect.x / 100) * rotW);
      const cropY = Math.max(0, (cropRect.y / 100) * rotH);
      const cropW = Math.max(1, Math.min(rotW - cropX, (cropRect.w / 100) * rotW));
      const cropH = Math.max(1, Math.min(rotH - cropY, (cropRect.h / 100) * rotH));

      canvas.width = Math.round(cropW);
      canvas.height = Math.round(cropH);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.save();
      ctx.translate(-cropX, -cropY);

      if (viewerRotation !== 0) {
        ctx.translate(rotW / 2, rotH / 2);
        ctx.rotate((viewerRotation * Math.PI) / 180);
        ctx.translate(-origW / 2, -origH / 2);
      }

      ctx.drawImage(img, 0, 0);
      ctx.restore();

      let mimeType = viewerFile.mimeType || 'image/png';
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        mimeType = 'image/png';
      }

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          b => {
            if (b) resolve(b);
            else reject(new Error('Canvas conversion to blob failed'));
          },
          mimeType,
          0.92
        );
      });

      const baseOriginal = viewerFile.originalName.replace(/\.[^/.]+$/, '');
      const finalExt = mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/webp' ? '.webp' : '.png';
      const fileName = saveAsCopy 
        ? `cropped-${Date.now()}-${baseOriginal}${finalExt}` 
        : `${baseOriginal}${finalExt}`;
      
      const fileObj = new File([blob], fileName, { type: mimeType });
      const fd = new FormData();
      fd.append('file', fileObj);
      if (viewerFile.folderId) fd.append('folderId', viewerFile.folderId);

      if (saveAsCopy) {
        const r = await fetch('/api/media', { method: 'POST', body: fd });
        if (r.ok) {
          const newMedia = await r.json();
          toast.success('Cropped copy saved successfully!');
          setIsEditingViewer(false);
          setViewerRotation(0);
          setCropRect({ x: 10, y: 10, w: 80, h: 80 });
          setViewerFile(newMedia);
          await Promise.all([fetchFiles(currentFolderId), fetchStats()]);
        } else {
          const err = await r.json().catch(() => ({}));
          toast.error(err.error || 'Failed to save cropped copy');
        }
      } else {
        const r = await fetch(`/api/media/${viewerFile.id}`, { method: 'PUT', body: fd });
        if (r.ok) {
          const updated = await r.json();
          toast.success('Image updated successfully!');
          setIsEditingViewer(false);
          setViewerRotation(0);
          setCropRect({ x: 10, y: 10, w: 80, h: 80 });
          const refreshed = { ...updated, updatedAt: new Date().toISOString() };
          setViewerFile(refreshed);
          setFiles(prev => prev.map(f => f.id === updated.id ? refreshed : f));
          await Promise.all([fetchStats(), fetchFolders()]);
        } else {
          const err = await r.json().catch(() => ({}));
          toast.error(err.error || 'Failed to save cropped image');
        }
      }
    } catch (err) {
      console.error('Error cropping image:', err);
      toast.error('Cropping error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSavingCrop(false);
    }
  };

  const navigateToFolder = useCallback((folderId: string | null) => {
    if (folderId === currentFolderId) {
      // Toggle expansion if it's a folder in sidebar
      if (folderId && folderId !== 'trash') {
        setExpandedFolderIds(prev => {
          const next = new Set(prev);
          if (next.has(folderId)) next.delete(folderId);
          else next.add(folderId);
          return next;
        });
      }
      return;
    }

    setFolderLoading(true);
    setFiles([]);
    setSelectedIds(new Set());
    setSelectedFile(null);
    setSearch('');
    setCurrentFolderId(folderId);

    // If entering a subfolder, auto-expand its ancestors so it remains visible in the tree
    if (folderId && folderId !== 'trash') {
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        let curr = folders.find(f => f.id === folderId);
        while (curr) {
          if (curr.parentId) next.add(curr.parentId);
          curr = folders.find(f => f.id === curr?.parentId);
        }
        next.add(folderId);
        return next;
      });
    }
  }, [folders, currentFolderId]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`media-manual-order-${currentFolderId || 'root'}`);
      if (stored) setManualOrder(JSON.parse(stored));
      else setManualOrder([]);
    } catch {
      setManualOrder([]);
    }
  }, [currentFolderId]);

  const saveManualOrder = useCallback((order: string[]) => {
    setManualOrder(order);
    try {
      localStorage.setItem(`media-manual-order-${currentFolderId || 'root'}`, JSON.stringify(order));
    } catch {}
  }, [currentFolderId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setCtrlPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control') setCtrlPressed(false); };
    const handleBlur = () => setCtrlPressed(false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('media-favorites');
      if (stored) setFavoritedIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoritedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('media-favorites', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ─── API ───────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try { const r = await fetch('/api/media/stats'); if (r.ok) setStats(await r.json()); } catch {}
  }, []);

  const fetchFolders = useCallback(async (): Promise<MediaFolder[]> => {
    try {
      const r = await fetch('/api/media/folders');
      if (r.ok) { const d = await r.json(); setFolders(d); return d; }
    } catch {}
    return [];
  }, []);

  const fetchFiles = useCallback(async (folderId: string | null = null) => {
    setFolderLoading(true);
    try {
      if (folderId === 'trash') {
        const [filesRes, foldersRes] = await Promise.all([
          fetch('/api/media?trash=true'),
          fetch('/api/media/folders?trash=true'),
        ]);
        if (filesRes.ok) setFiles(await filesRes.json());
        if (foldersRes.ok) setTrashedFolders(await foldersRes.json());
      } else {
        setTrashedFolders([]);
        const url = folderId === null ? '/api/media' : `/api/media?folderId=${folderId}`;
        const r = await fetch(url);
        if (r.ok) setFiles(await r.json());
      }
    } catch {}
    finally {
      setFolderLoading(false);
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      let foldersData = await fetchFolders();
      if (foldersData.length === 0) {
        setSeeding(true);
        try {
          const r = await fetch('/api/media/folders/seed', { method: 'POST' });
          if (r.ok) {
            const result = await r.json();
            toast.success(`Library initialized — ${result.filesMoved ?? 0} files organised`);
            foldersData = await fetchFolders();
          }
        } catch { /* seed optional */ }
        finally { setSeeding(false); }
      }
      await Promise.all([fetchFiles(currentFolderId), fetchStats()]);
    } finally {
      setLoading(false);
    }
  }, [fetchFolders, fetchFiles, fetchStats]);

  const handleRefresh = useCallback(async () => {
    setFolderLoading(true);
    try {
      await Promise.all([fetchFolders(), fetchFiles(currentFolderId), fetchStats()]);
    } finally {
      setFolderLoading(false);
    }
  }, [currentFolderId, fetchFolders, fetchFiles, fetchStats]);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (loading) return;
    fetchFiles(currentFolderId);
  }, [currentFolderId]); // eslint-disable-line

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const parentId = currentFolderId !== 'trash' ? currentFolderId : null;
      const r = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newFolderName.trim(), 
          icon: newFolderIcon, 
          color: newFolderColor,
          parentId
        }),
      });
      if (r.ok) {
        toast.success('Folder created');
        setShowNewFolderModal(false);
        setNewFolderName('');
        await fetchFolders();
      } else toast.error('Failed to create folder');
    } catch { toast.error('Error creating folder'); }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    // If a re-render just displaced focus (e.g. after fetchFolders), skip the blur-triggered save
    if (skipBlurRef.current) return;
    if (!newName.trim()) { setRenamingId(null); return; }
    
    const currentFolderToRename = folders.find(f => f.id === id);
    if (!currentFolderToRename) { setRenamingId(null); return; }
    
    const siblingFolders = folders.filter(f => f.parentId === currentFolderToRename.parentId && f.id !== id);
    const existingFolderNames = siblingFolders.map(f => f.name);
    
    const uniqueName = getUniqueFolderName(newName.trim(), existingFolderNames);
    
    try {
      const r = await fetch(`/api/media/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: uniqueName }),
      });
      if (r.ok) { 
        toast.success(uniqueName !== newName.trim() ? `Renamed to "${uniqueName}"` : 'Renamed'); 
        setFolders(f => f.map(x => x.id === id ? { ...x, name: uniqueName } : x)); 
      }
      else toast.error('Failed to rename');
    } catch { toast.error('Rename error'); }
    finally { setRenamingId(null); }
  };

  const toggleSidebarPin = (id: string) => {
    const isPinned = sidebarPinnedFolderIds.has(id);
    const next = new Set(sidebarPinnedFolderIds);
    if (isPinned) {
      next.delete(id);
      toast.success('Unpinned from Sidebar');
    } else {
      next.add(id);
      toast.success('Pinned to Sidebar');
    }
    setSidebarPinnedFolderIds(next);
    try {
      localStorage.setItem('media_sidebar_pinned_folders', JSON.stringify([...next]));
    } catch {}
  };

  const toggleQuickAccessPin = (id: string) => {
    const isPinned = quickAccessPinnedFolderIds.has(id);
    const next = new Set(quickAccessPinnedFolderIds);
    if (isPinned) {
      next.delete(id);
      toast.success('Unpinned from Quick access');
    } else {
      next.add(id);
      toast.success('Pinned to Quick access');
    }
    setQuickAccessPinnedFolderIds(next);
    try {
      localStorage.setItem('media_qa_pinned_folders', JSON.stringify([...next]));
    } catch {}
  };

  const promptDeleteFolder = (id: string, name?: string) => {
    const folder = folders.find(f => f.id === id) || trashedFolders.find(f => f.id === id);
    const folderName = name || folder?.name || 'Folder';
    setConfirmDelete({
      type: 'folder',
      folderId: id,
      folderName,
    });
  };

  const promptDeleteItems = (ids: string[]) => {
    if (!ids.length) return;
    const itemsToDelete = ids.map(id => {
      const folder = folders.find(f => f.id === id) || trashedFolders.find(f => f.id === id);
      if (folder) {
        return { id, name: folder.name, isFolder: true };
      }
      const file = files.find(f => f.id === id);
      if (file) {
        return { id, name: file.originalName || file.filename, isFolder: false };
      }
      const comb = combinedItems.find(x => x.id === id);
      if (comb) {
        return { id, name: comb.name, isFolder: comb.isFolder };
      }
      return { id, name: 'Item', isFolder: false };
    });

    setConfirmDelete({
      type: 'items',
      items: itemsToDelete,
    });
  };

  const getUniqueFileName = (originalName: string, existingNames: string[]): string => {
    if (!existingNames.includes(originalName)) return originalName;
    
    const extIndex = originalName.lastIndexOf('.');
    const base = extIndex !== -1 ? originalName.substring(0, extIndex) : originalName;
    const ext = extIndex !== -1 ? originalName.substring(extIndex) : '';
    
    let counter = 1;
    while (true) {
      const candidate = `${base} (${counter})${ext}`;
      if (!existingNames.includes(candidate)) {
        return candidate;
      }
      counter++;
    }
  };

  const getUniqueFolderName = (baseName: string, existingNames: string[]): string => {
    if (!existingNames.includes(baseName)) return baseName;
    let counter = 2;
    while (true) {
      const candidate = `${baseName} (${counter})`;
      if (!existingNames.includes(candidate)) {
        return candidate;
      }
      counter++;
    }
  };

  const handleCreateNewFolderDirect = async (parentOverride?: string | null | any) => {
    // Only accept explicit string or null for parentOverride (ignore MouseEvents)
    const targetParentId = (typeof parentOverride === 'string' || parentOverride === null)
      ? parentOverride
      : (currentFolderId && currentFolderId !== 'trash' ? currentFolderId : null);

    const existingFolderNames = folders
      .filter(f => f.parentId === targetParentId)
      .map(f => f.name);
      
    const uniqueName = getUniqueFolderName('New folder', existingFolderNames);
    
    try {
      const r = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: uniqueName, 
          icon: 'folder', 
          color: '#2563EB',
          parentId: targetParentId || null
        }),
      });

      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        toast.error(errData.error || 'Failed to create folder');
        return;
      }

      const newFolder = await r.json();
      
      // Lock blur handler so the re-render from fetchFolders doesn't auto-submit rename
      skipBlurRef.current = true;
      if (targetParentId) {
        setExpandedFolderIds(prev => new Set(prev).add(targetParentId));
      }

      await fetchFolders();

      if (newFolder?.id) {
        setRenameValue(uniqueName);
        setRenamingId(newFolder.id);
      }

      // Allow blur after the re-render and DOM updates have completed
      setTimeout(() => {
        skipBlurRef.current = false;
      }, 200);
    } catch (err) {
      console.error('Create folder error:', err);
      toast.error('Error creating folder');
    }
  };

  const handleUpload = async (filesList: FileList | null) => {
    if (!filesList?.length) return;
    setUploading(true);
    let ok = 0;
    const totalFiles = filesList.length;
    const uploadToastId = toast.upload(
      totalFiles === 1 
        ? `Uploading "${filesList[0].name}"...`
        : `Uploading ${totalFiles} items...`
    );

    const existingFileNames = [...files.map(f => f.originalName)];
    
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const uniqueName = getUniqueFileName(file.name, existingFileNames);
      existingFileNames.push(uniqueName);
      
      const fd = new FormData();
      const renamedFile = new File([file], uniqueName, { type: file.type });
      fd.append('file', renamedFile);
      if (currentFolderId) fd.append('folderId', currentFolderId);
      try { 
        const r = await fetch('/api/media', { method: 'POST', body: fd }); 
        if (r.ok) ok++; 
      } catch {}
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (ok > 0) {
      toast.success(
        ok === 1
          ? '1 upload complete'
          : `${ok} uploads complete`,
        { id: uploadToastId }
      );
      await Promise.all([fetchFiles(currentFolderId), fetchStats(), fetchFolders()]);
    } else {
      toast.error('Upload failed', { id: uploadToastId });
    }
  };

  const handleReplaceFile = async (files: FileList | null) => {
    if (!files?.length || !selectedFile) return;
    setReplacing(true);
    try {
      const fd = new FormData();
      fd.append('file', files[0]);
      const r = await fetch(`/api/media/${selectedFile.id}`, { method: 'PUT', body: fd });
      if (r.ok) {
        const updated = await r.json();
        toast.success('File content replaced');
        setSelectedFile(updated);
        setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
        await Promise.all([fetchFiles(currentFolderId), fetchStats(), fetchFolders()]);
      } else toast.error('Replace failed');
    } catch { toast.error('Replace error'); }
    finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleMove = async (targetFolderId: string | null) => {
    const fileIds = Array.from(selectedIds).filter(id => files.some(f => f.id === id));
    const folderIds = Array.from(selectedIds).filter(id => folders.some(f => f.id === id));
    if (!fileIds.length && !folderIds.length) return;
    let ok = 0;
    for (const id of fileIds) {
      try {
        const r = await fetch(`/api/media/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderId: targetFolderId }) });
        if (r.ok) ok++;
      } catch {}
    }
    for (const id of folderIds) {
      try {
        const r = await fetch(`/api/media/folders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: targetFolderId }) });
        if (r.ok) ok++;
      } catch {}
    }
    setShowMoveModal(false);
    setSelectedIds(new Set());
    if (ok > 0) {
      const targetName = targetFolderId ? (folders.find(f => f.id === targetFolderId)?.name || 'folder') : 'Home';
      toast.success(`Moved ${ok} item${ok > 1 ? 's' : ''} to "${targetName}"`);
      await Promise.all([fetchFiles(currentFolderId), fetchFolders(), fetchStats()]);
    }
  };

  const executeMoveItems = async () => {
    if (!confirmMove) return;
    const { items, targetFolderId, targetFolderName } = confirmMove;
    setConfirmMove(null);

    let ok = 0;
    for (const item of items) {
      try {
        if (item.isFolder) {
          const r = await fetch(`/api/media/folders/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentId: targetFolderId }),
          });
          if (r.ok) ok++;
        } else {
          const r = await fetch(`/api/media/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId: targetFolderId }),
          });
          if (r.ok) ok++;
        }
      } catch {}
    }

    setSelectedIds(new Set());
    if (ok > 0) {
      toast.success(`Moved ${ok} item${ok > 1 ? 's' : ''} to "${targetFolderName}"`);
      await Promise.all([fetchFiles(currentFolderId), fetchFolders(), fetchStats()]);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { type, folderId, items } = confirmDelete;
    const isPermanent = currentFolderId === 'trash';
    setConfirmDelete(null);

    if (type === 'folder' && folderId) {
      try {
        const url = isPermanent 
          ? `/api/media/folders/${folderId}?permanent=true` 
          : `/api/media/folders/${folderId}`;
        const r = await fetch(url, { method: 'DELETE' });
        if (r.ok) {
          toast.delete(isPermanent ? 'Deleted folder forever' : 'Moved folder and files to Trash');
          const next = currentFolderId === folderId ? null : currentFolderId;
          navigateToFolder(next);
          await Promise.all([fetchFolders(), fetchFiles(next), fetchStats()]);
        } else toast.error('Failed to delete folder');
      } catch { toast.error('Error deleting folder'); }
    } else if (type === 'items' && items) {
      let ok = 0;
      for (const item of items) {
        try {
          if (item.isFolder) {
            const url = isPermanent 
              ? `/api/media/folders/${item.id}?permanent=true` 
              : `/api/media/folders/${item.id}`;
            const r = await fetch(url, { method: 'DELETE' });
            if (r.ok) ok++;
          } else {
            const url = isPermanent 
              ? `/api/media/${item.id}?permanent=true` 
              : `/api/media/${item.id}`;
            const r = await fetch(url, { method: 'DELETE' });
            if (r.ok) ok++;
          }
        } catch {}
      }
      setSelectedIds(new Set());
      if (selectedFile && items.some(x => x.id === selectedFile.id)) setSelectedFile(null);
      if (ok > 0) {
        toast.delete(
          isPermanent
            ? (ok === 1 ? 'Deleted 1 item forever' : `Deleted ${ok} items forever`)
            : (ok === 1 ? 'Moved 1 item to Trash' : `Moved ${ok} items to Trash`)
        );
        await Promise.all([fetchFiles(currentFolderId), fetchFolders(), fetchStats()]);
      }
    }
  };

  const handleRestore = async (ids: string[]) => {
    if (!ids.length) return;
    let ok = 0;
    for (const id of ids) {
      const isFold = trashedFolders.some(f => f.id === id);
      try {
        if (isFold) {
          const r = await fetch(`/api/media/folders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restore: true }),
          });
          if (r.ok) ok++;
        } else {
          const r = await fetch(`/api/media/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restore: true }),
          });
          if (r.ok) ok++;
        }
      } catch {}
    }
    setSelectedIds(new Set());
    if (ok > 0) {
      toast.success(ok === 1 ? 'Restored 1 item' : `Restored ${ok} items`);
      await Promise.all([fetchFiles('trash'), fetchFolders(), fetchStats()]);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const r = await fetch('/api/media/empty-trash', { method: 'POST' });
      if (r.ok) {
        setSelectedIds(new Set());
        toast.success('Trash emptied');
        await Promise.all([fetchFiles('trash'), fetchFolders(), fetchStats()]);
      } else {
        toast.error('Failed to empty trash');
      }
    } catch {
      toast.error('Error emptying trash');
    }
  };

  const handleSaveAlt = async () => {
    if (!selectedFile) return;
    setSavingAlt(true);
    try {
      const r = await fetch(`/api/media/${selectedFile.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alt: altValue }) });
      if (r.ok) { toast.success('Alt text saved'); setSelectedFile(prev => prev ? { ...prev, alt: altValue } : null); setFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, alt: altValue } : f)); }
      else toast.error('Save failed');
    } catch { toast.error('Error saving'); }
    finally { setSavingAlt(false); }
  };



  // ─── Selection & Drag & Drop ───────────────────────────────────────────────

  const getFolderDescendantIds = useCallback((folderId: string): Set<string> => {
    const descendants = new Set<string>();
    const stack = [folderId];
    while (stack.length > 0) {
      const parentId = stack.pop()!;
      for (const f of folders) {
        if (f.parentId === parentId && !descendants.has(f.id)) {
          descendants.add(f.id);
          stack.push(f.id);
        }
      }
    }
    return descendants;
  }, [folders]);

  const canDropOnFolder = useCallback((targetFolderId: string | null, draggedList = draggingItems): boolean => {
    if (!draggedList || draggedList.length === 0) return false;
    for (const item of draggedList) {
      if (item.isFolder) {
        if (item.id === targetFolderId) return false;
        if (targetFolderId && getFolderDescendantIds(item.id).has(targetFolderId)) return false;
        const folderObj = folders.find(f => f.id === item.id);
        if (folderObj && (folderObj.parentId ?? null) === targetFolderId) return false;
      } else {
        const fileObj = files.find(f => f.id === item.id);
        if (fileObj && (fileObj.folderId ?? null) === targetFolderId) return false;
      }
    }
    return true;
  }, [draggingItems, folders, files, getFolderDescendantIds]);

  const handleItemClick = (e: React.MouseEvent, id: string, item: MediaItem | MediaFolder, isFolder: boolean) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const s = new Set(selectedIds);
      if (s.has(id)) s.delete(id); else s.add(id);
      setSelectedIds(s);
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemDragStart = (e: React.DragEvent, id: string, name: string, isFolder: boolean) => {
    e.stopPropagation();
    let itemsToDrag: { id: string; name: string; isFolder: boolean }[] = [];
    if (selectedIds.has(id) && selectedIds.size > 1) {
      itemsToDrag = combinedItems
        .filter(item => selectedIds.has(item.id))
        .map(item => ({ id: item.id, name: item.name, isFolder: item.isFolder }));
    } else {
      itemsToDrag = [{ id, name, isFolder }];
    }
    setDraggingItems(itemsToDrag);
    setDraggingId(id);
    e.dataTransfer.setData('application/json', JSON.stringify(itemsToDrag));
    e.dataTransfer.effectAllowed = 'move';

    // Custom Windows-style Drag Ghost Image
    try {
      const ghost = document.createElement('div');
      ghost.style.position = 'absolute';
      ghost.style.top = '-9999px';
      ghost.style.left = '-9999px';
      ghost.style.zIndex = '9999';
      ghost.style.pointerEvents = 'none';
      ghost.style.display = 'flex';
      ghost.style.alignItems = 'center';
      ghost.style.gap = '8px';
      ghost.style.padding = '6px 12px';
      ghost.style.background = 'rgba(255, 255, 255, 0.88)';
      ghost.style.backdropFilter = 'blur(10px)';
      ghost.style.border = '1px solid rgba(59, 130, 246, 0.5)';
      ghost.style.borderRadius = '8px';
      ghost.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 8px -2px rgba(0, 0, 0, 0.1)';
      ghost.style.color = '#0f172a';
      ghost.style.fontSize = '12px';
      ghost.style.fontWeight = '600';
      ghost.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      const countBadge = itemsToDrag.length > 1 
        ? `<span style="background:#2563eb;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:9999px;margin-left:4px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${itemsToDrag.length}</span>` 
        : '';

      const iconSvg = isFolder
        ? `<svg width="20" height="18" viewBox="0 0 24 24" fill="#EAB308" stroke="#CA8A04" stroke-width="1.5"><path d="M2 7C2 5.34315 3.34315 4 5 4H9.5C10.84 4 12.04 4.7 12.7 5.86L13.8 7.5H20C21.1 7.5 22 8.4 22 9.5V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V7Z"/></svg>`
        : `<svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;

      ghost.innerHTML = `${iconSvg} <span style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</span> ${countBadge}`;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 24, 18);
      setTimeout(() => {
        if (document.body.contains(ghost)) document.body.removeChild(ghost);
      }, 0);
    } catch {}
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDraggingItems(null);
    setDragOverTargetId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string | null, targetFolderName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTargetId(null);
    setDraggingId(null);

    let itemsToMove = draggingItems;
    if (!itemsToMove || itemsToMove.length === 0) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) itemsToMove = JSON.parse(raw);
      } catch {}
    }
    if (!itemsToMove || itemsToMove.length === 0) return;

    if (!canDropOnFolder(targetFolderId, itemsToMove)) {
      toast.error('Cannot move item(s) to this location');
      setDraggingItems(null);
      return;
    }

    setConfirmMove({
      items: itemsToMove,
      targetFolderId,
      targetFolderName,
    });
    setDraggingItems(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!draggedId || draggedId === targetId) return;

    const list = combinedItems.map(item => ({ id: item.id }));
    const draggedIdx = list.findIndex(x => x.id === draggedId);
    const targetIdx = list.findIndex(x => x.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newList = [...list];
    const [removed] = newList.splice(draggedIdx, 1);
    newList.splice(targetIdx, 0, removed);

    const newOrder = newList.map(x => x.id);
    saveManualOrder(newOrder);
    setSort('manual');
    setDraggingId(null);
  };

  const handleItemDoubleClick = (id: string, isFolder: boolean) => {
    if (isFolder) navigateToFolder(id);
    else {
      const f = files.find(f => f.id === id);
      if (f) {
        if (f.mimeType.startsWith('image/')) {
          setViewerFile(f);
        } else {
          window.open(f.url, '_blank');
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: MediaItem | MediaFolder | null, type: 'file' | 'folder' | 'background') => {
    e.preventDefault(); e.stopPropagation();
    if (item && !selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
    }
    setSelectedFile(null);
    
    const container = e.currentTarget.closest('.media-library-root');
    const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const menuWidth = 176;
    const menuHeight = 220;
    
    const boundedX = Math.min(x, rect.width - menuWidth - 10);
    const boundedY = Math.min(y, rect.height - menuHeight - 10);
    
    setContextMenu({ x: Math.max(0, boundedX), y: Math.max(0, boundedY), item, type });
  };

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') { setSelectedIds(new Set()); setSelectedFile(null); setContextMenu(null); setRenamingId(null); }
      if (e.key === 'Delete' && selectedIds.size > 0) {
        promptDeleteItems(Array.from(selectedIds));
      }

      if (e.key === 'F2' && selectedIds.size === 1) {
        const id = Array.from(selectedIds)[0];
        const folder = folders.find(f => f.id === id);
        if (folder) { setRenamingId(id); setRenameValue(folder.name); }
        else { const file = files.find(f => f.id === id); if (file) { setSelectedFile(file); setAltValue(file.alt || ''); } }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, files, folders, currentFolderId]); // eslint-disable-line

  useEffect(() => {
    const close = () => {
      setTimeout(() => setContextMenu(null), 10);
    };
    window.addEventListener('click', close, { capture: true });
    return () => window.removeEventListener('click', close, { capture: true });
  }, []);

  useEffect(() => {
    if (!ctrlPressed || currentFolderId === null) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setView(prev => {
          const idx = VIEW_ORDER.indexOf(prev);
          if (idx === -1) return prev;
          if (e.deltaY < 0) {
            const nextIdx = Math.min(idx + 1, VIEW_ORDER.length - 1);
            return VIEW_ORDER[nextIdx];
          } else {
            const nextIdx = Math.max(idx - 1, 0);
            return VIEW_ORDER[nextIdx];
          }
        });
      }
    };
    const el = contentRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (el) el.removeEventListener('wheel', handleWheel);
    };
  }, [ctrlPressed, currentFolderId]);

  // ─── Computed ──────────────────────────────────────────────────────────────

  const filteredFiles = useMemo(() => {
    let r = [...files];
    if (search) r = r.filter(f => f.originalName.toLowerCase().includes(search.toLowerCase()));
    r.sort((a, b) => {
      if (sort === 'manual') return 0;
      const cmp = sort === 'name' ? a.originalName.localeCompare(b.originalName) : sort === 'size' ? a.size - b.size : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    if (currentFolderId === null && !search) {
      return r.slice(0, 12);
    }
    return r;
  }, [files, search, sort, sortDir, currentFolderId]);

  const visibleFolders = useMemo(() => {
    if (currentFolderId === 'trash') {
      if (search) return trashedFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
      return trashedFolders;
    }
    if (search) return folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    let r = folders.filter(f => f.parentId === currentFolderId);
    r.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'date') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });
    return r;
  }, [folders, trashedFolders, currentFolderId, search, sort]);

  const combinedItems = useMemo(() => {
    const foldersList = visibleFolders.map(f => ({ ...f, isFolder: true as const }));
    const filesList = filteredFiles.map(f => ({ ...f, isFolder: false as const }));
    let list = [...foldersList, ...filesList];
    
    if (sort === 'manual' && manualOrder.length > 0) {
      const orderMap = new Map(manualOrder.map((id, idx) => [id, idx]));
      list.sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return idxA - idxB;
      });
    }
    return list;
  }, [visibleFolders, filteredFiles, sort, manualOrder]);

  const currentFolder = currentFolderId && currentFolderId !== 'trash' ? folders.find(f => f.id === currentFolderId) ?? null : null;

  const breadcrumbs = useMemo(() => {
    if (!currentFolderId) return [];
    if (currentFolderId === 'trash') return [{ id: 'trash', name: 'Trash' } as any];
    
    const crumbs = [];
    let curId: string | null | undefined = currentFolderId;
    while (curId) {
      const folder = folders.find(f => f.id === curId);
      if (folder) {
        crumbs.unshift(folder);
        curId = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  }, [folders, currentFolderId]);

  const rootFolders = useMemo(() => {
    const rf = folders.filter(f => !f.parentId);
    return [...rf].sort((a, b) => {
      const aPin = sidebarPinnedFolderIds.has(a.id) ? 0 : 1;
      const bPin = sidebarPinnedFolderIds.has(b.id) ? 0 : 1;
      return aPin - bPin;
    });
  }, [folders, sidebarPinnedFolderIds]);

  const quickAccessFolders = useMemo(() => {
    return folders.filter(f => quickAccessPinnedFolderIds.has(f.id));
  }, [folders, quickAccessPinnedFolderIds]);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading || seeding) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">{seeding ? 'Organising your media library…' : 'Loading files…'}</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="media-library-root relative flex flex-col h-full bg-white overflow-hidden text-sm select-none cursor-default" onClick={() => { setSelectedIds(new Set()); setSelectedFile(null); setContextMenu(null); }}>

      {/* Toolbar / Header (full width of page!) */}
      <header className="h-12 border-b border-slate-200 flex items-center gap-3 px-6 shrink-0 bg-white select-none cursor-default" onClick={e => e.stopPropagation()}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
          <button 
            onClick={() => navigateToFolder(null)} 
            className={`font-semibold transition-colors ${currentFolderId ? 'text-slate-500 hover:text-blue-600' : 'text-slate-800'}`}
          >
            Home
          </button>
          {breadcrumbs.map((crumb: any, idx: number) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-slate-800 truncate">{crumb.name}</span>
                ) : (
                  <button 
                    onClick={() => navigateToFolder(crumb.id)} 
                    className="font-medium text-slate-500 hover:text-blue-600 truncate"
                  >
                    {crumb.name}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Search files…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs w-44 bg-white focus:outline-none focus:border-slate-400 transition-all shadow-none"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Sort Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(prev => !prev)}
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium shadow-none transition-colors"
              title="Sort files"
            >
              {sortDir === 'asc' ? <SortAsc className="h-3.5 w-3.5 text-slate-500" /> : <SortDesc className="h-3.5 w-3.5 text-slate-500" />}
              <span className="capitalize">{sort === 'manual' ? 'Manual' : sort}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {showSortDropdown && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-xl border border-slate-200 py-1 text-[11px] text-slate-700 z-50 animate-fade-in">
                  <button onClick={() => { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {sortDir === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>{sortDir === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                  
                  <button onClick={() => { setSort('manual'); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {sort === 'manual' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Manual</span>
                  </button>
                  <button onClick={() => { setSort('date'); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {sort === 'date' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Date</span>
                  </button>
                  <button onClick={() => { setSort('name'); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {sort === 'name' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Name</span>
                  </button>
                  <button onClick={() => { setSort('size'); setShowSortDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {sort === 'size' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Size</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* View Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setShowViewDropdown(prev => !prev)}
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-none transition-colors"
              title="Change layout view"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
              <span>View</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {showViewDropdown && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowViewDropdown(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-xl border border-slate-200 py-1 text-[11px] text-slate-700 z-50 animate-fade-in">
                  <button onClick={() => { setView('extra-large-icons'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'extra-large-icons' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Extra large icons</span>
                  </button>
                  <button onClick={() => { setView('large-icons'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'large-icons' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Large icons</span>
                  </button>
                  <button onClick={() => { setView('medium-icons'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'medium-icons' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Medium icons</span>
                  </button>
                  <button onClick={() => { setView('small-icons'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'small-icons' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Small icons</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={() => { setView('list'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'list' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>List</span>
                  </button>
                  <button onClick={() => { setView('details'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'details' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Details</span>
                  </button>
                  <button onClick={() => { setView('tiles'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'tiles' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Tiles</span>
                  </button>
                  <button onClick={() => { setView('content'); setShowViewDropdown(false); }} className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      {view === 'content' && <Check className="h-3 w-3 text-blue-600" />}
                    </span>
                    <span>Content</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          <button onClick={() => Promise.all([fetchFiles(currentFolderId), fetchFolders(), fetchStats()])} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            disabled={uploading}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-none transition-colors"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
        </div>
      </header>



      {/* Main split pane */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none cursor-default" onClick={e => e.stopPropagation()}>
          <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {/* Quick Access */}
            <div className="mb-3">
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quick Access</p>
              <button
                onClick={() => navigateToFolder(null)}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(null)) setDragOverTargetId('root'); }}
                onDragLeave={(e) => { e.stopPropagation(); setDragOverTargetId(prev => prev === 'root' ? null : prev); }}
                onDrop={(e) => handleFolderDrop(e, null, 'Home')}
                className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors rounded-none ${
                  dragOverTargetId === 'root'
                    ? 'bg-blue-100 ring-2 ring-blue-500 font-semibold text-blue-800'
                    : currentFolderId === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 -ml-1 shrink-0" />
                <span className="shrink-0 flex items-center">
                  <FluentHomeIcon className="w-4 h-4" />
                </span>
                <span className="flex-1 truncate text-xs">Home</span>
              </button>
              <button
                onClick={() => navigateToFolder('trash')}
                className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors rounded-none ${
                  currentFolderId === 'trash' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 -ml-1 shrink-0" />
                <span className="shrink-0 flex items-center">
                  <FluentRecycleBinIcon className="w-4 h-4" />
                </span>
                <span className="flex-1 truncate text-xs">Trash</span>
              </button>
            </div>

            {/* Folders Tree with Nested Children Support */}
            <div className="mb-3">
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Folders</p>
                <button
                  onClick={() => handleCreateNewFolderDirect(null)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                  title="New Folder at root"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {rootFolders.map(folder => {
                  const childFolders = folders.filter(f => f.parentId === folder.id);
                  const hasChildren = childFolders.length > 0;
                  const isExpanded = expandedFolderIds.has(folder.id);
                  const isCurrent = currentFolderId === folder.id;
                  const isRenaming = renamingId === folder.id;
                  const isSidebarPinned = sidebarPinnedFolderIds.has(folder.id);
                  const isTargeted = dragOverTargetId === folder.id;

                  return (
                    <div key={folder.id} className="flex flex-col">
                      <div
                        onClick={() => !isRenaming && navigateToFolder(folder.id)}
                        onContextMenu={e => handleContextMenu(e, folder, 'folder')}
                        draggable={!isRenaming}
                        onDragStart={(e) => handleItemDragStart(e, folder.id, folder.name, true)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                        onDragLeave={(e) => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                        onDrop={(e) => handleFolderDrop(e, folder.id, folder.name)}
                        className={`w-full group flex items-center gap-1.5 px-3 py-1.5 text-left transition-colors cursor-pointer rounded-none ${
                          isTargeted
                            ? 'bg-blue-100 ring-2 ring-blue-500 font-semibold text-blue-800'
                            : isCurrent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {/* Chevron toggle button */}
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
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-90 text-slate-600' : ''}`} />
                          </button>
                        ) : (
                          <span className="w-3.5 -ml-1 shrink-0" />
                        )}

                        <span className="shrink-0 flex items-center">
                          <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-4.5 h-3.5" />
                        </span>
                        
                        {isRenaming ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onFocus={e => e.target.select()}
                            onBlur={() => handleRenameFolder(folder.id, renameValue)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="flex-1 text-xs border border-blue-500 rounded px-1.5 py-0.5 focus:outline-none bg-white text-slate-900 shadow-sm"
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="flex-1 truncate text-xs">{folder.name}</span>
                        )}

                        {folder.fileCount > 0 && !isRenaming && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full shrink-0 font-normal">{folder.fileCount}</span>
                        )}
                        {isSidebarPinned && !isRenaming && (
                          <Pin className="h-2.5 w-2.5 shrink-0 text-blue-400 rotate-45" />
                        )}
                      </div>

                      {/* Render child folders if expanded */}
                      {hasChildren && isExpanded && (
                        <div className="flex flex-col pl-3.5 ml-4 border-l border-slate-200/80 space-y-0.5 my-0.5">
                          {childFolders.map(child => {
                            const isChildCurrent = currentFolderId === child.id;
                            const grandChildren = folders.filter(f => f.parentId === child.id);
                            const hasGrandChildren = grandChildren.length > 0;
                            const isChildExpanded = expandedFolderIds.has(child.id);
                            const isChildRenaming = renamingId === child.id;
                            const isChildTargeted = dragOverTargetId === child.id;

                            return (
                              <div key={child.id} className="flex flex-col">
                                <div
                                  onClick={() => !isChildRenaming && navigateToFolder(child.id)}
                                  onContextMenu={e => handleContextMenu(e, child, 'folder')}
                                  draggable={!isChildRenaming}
                                  onDragStart={(e) => handleItemDragStart(e, child.id, child.name, true)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(child.id)) setDragOverTargetId(child.id); }}
                                  onDragLeave={(e) => { e.stopPropagation(); setDragOverTargetId(prev => prev === child.id ? null : prev); }}
                                  onDrop={(e) => handleFolderDrop(e, child.id, child.name)}
                                  className={`w-full group flex items-center gap-1.5 px-2 py-1 text-left transition-colors cursor-pointer rounded-none ${
                                    isChildTargeted
                                      ? 'bg-blue-100 ring-2 ring-blue-500 font-semibold text-blue-800'
                                      : isChildCurrent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {hasGrandChildren ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedFolderIds(prev => {
                                          const next = new Set(prev);
                                          if (next.has(child.id)) next.delete(child.id);
                                          else next.add(child.id);
                                          return next;
                                        });
                                      }}
                                      className="p-0.5 -ml-0.5 text-slate-400 hover:text-slate-700 rounded transition-transform"
                                    >
                                      <ChevronRight className={`h-3 w-3 transition-transform duration-150 ${isChildExpanded ? 'rotate-90 text-slate-600' : ''}`} />
                                    </button>
                                  ) : (
                                    <span className="w-2.5 shrink-0" />
                                  )}

                                  <span className="shrink-0 flex items-center">
                                    <WindowsFolderIcon color={child.color} icon={child.icon} className="w-4 h-3" />
                                  </span>

                                  {isChildRenaming ? (
                                    <input
                                      autoFocus
                                      value={renameValue}
                                      onChange={e => setRenameValue(e.target.value)}
                                      onFocus={e => e.target.select()}
                                      onBlur={() => handleRenameFolder(child.id, renameValue)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameFolder(child.id, renameValue);
                                        if (e.key === 'Escape') setRenamingId(null);
                                      }}
                                      className="flex-1 text-xs border border-blue-500 rounded px-1.5 py-0.5 focus:outline-none bg-white text-slate-900 shadow-sm"
                                      onClick={e => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="flex-1 truncate text-xs">{child.name}</span>
                                  )}

                                  {child.fileCount > 0 && !isChildRenaming && (
                                    <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.2 rounded-full shrink-0">{child.fileCount}</span>
                                  )}
                                </div>

                                {hasGrandChildren && isChildExpanded && (
                                  <div className="flex flex-col pl-3 ml-3 border-l border-slate-200/80 space-y-0.5 my-0.5">
                                    {grandChildren.map(gc => {
                                      const isGcRenaming = renamingId === gc.id;
                                      const isGcTargeted = dragOverTargetId === gc.id;
                                      return (
                                        <div
                                          key={gc.id}
                                          onClick={() => !isGcRenaming && navigateToFolder(gc.id)}
                                          onContextMenu={e => handleContextMenu(e, gc, 'folder')}
                                          draggable={!isGcRenaming}
                                          onDragStart={(e) => handleItemDragStart(e, gc.id, gc.name, true)}
                                          onDragEnd={handleDragEnd}
                                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(gc.id)) setDragOverTargetId(gc.id); }}
                                          onDragLeave={(e) => { e.stopPropagation(); setDragOverTargetId(prev => prev === gc.id ? null : prev); }}
                                          onDrop={(e) => handleFolderDrop(e, gc.id, gc.name)}
                                          className={`w-full flex items-center gap-1.5 px-2 py-1 text-left transition-colors rounded-none cursor-pointer ${
                                            isGcTargeted
                                              ? 'bg-blue-100 ring-2 ring-blue-500 font-semibold text-blue-800'
                                              : currentFolderId === gc.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-50'
                                          }`}
                                        >
                                          <WindowsFolderIcon color={gc.color} icon={gc.icon} className="w-3.5 h-2.5 shrink-0" />
                                          {isGcRenaming ? (
                                            <input
                                              autoFocus
                                              value={renameValue}
                                              onChange={e => setRenameValue(e.target.value)}
                                              onFocus={e => e.target.select()}
                                              onBlur={() => handleRenameFolder(gc.id, renameValue)}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter') handleRenameFolder(gc.id, renameValue);
                                                if (e.key === 'Escape') setRenamingId(null);
                                              }}
                                              className="flex-1 text-xs border border-blue-500 rounded px-1.5 py-0.5 focus:outline-none bg-white text-slate-900 shadow-sm"
                                              onClick={e => e.stopPropagation()}
                                            />
                                          ) : (
                                            <span className="flex-1 truncate text-xs">{gc.name}</span>
                                          )}
                                          {gc.fileCount > 0 && !isGcRenaming && (
                                            <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.2 rounded-full shrink-0">{gc.fileCount}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* New Folder button */}
            <button
              onClick={() => handleCreateNewFolderDirect(null)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors mt-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">New Folder</span>
            </button>
          </nav>

          {/* Storage Bar */}
          {stats && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Storage</span>
                <span className="text-[10px] text-slate-400">{formatSize(stats.totalSize)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                {stats.totalSize > 0 ? (
                  <>
                    <div className="bg-blue-500 h-full" style={{ width: `${Math.max(2, (stats.byType.images / stats.totalSize) * 100)}%` }} />
                    <div className="bg-purple-500 h-full" style={{ width: `${Math.max(2, (stats.byType.videos / stats.totalSize) * 100)}%` }} />
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(2, (stats.byType.documents / stats.totalSize) * 100)}%` }} />
                  </>
                ) : <div className="bg-blue-500 h-full w-full opacity-20" />}
              </div>
              <div className="flex gap-3 mt-2 text-[9px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Images</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" /> Videos</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Docs</span>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Area ── */}
        <div className="flex flex-col flex-1 min-w-0 select-none cursor-default">
          {/* ── Trash Information Banner (in items area only) ── */}
          {currentFolderId === 'trash' && (
            <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Items in Trash are permanently deleted automatically after 30 days.</span>
              </div>
              {(files.length > 0 || trashedFolders.length > 0) && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Empty Trash
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-50/50 flex flex-col select-none cursor-default"
            onContextMenu={e => handleContextMenu(e, null, 'background')}
          >
          {folderLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center select-none py-12 animate-fade-in">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <p className="text-xs text-slate-400 mt-2 font-medium">Loading items…</p>
            </div>
          ) : (
            <>
              {/* Empty state */}
          {visibleFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center select-none animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                {currentFolderId === 'trash' ? (
                  <Trash2 className="h-8 w-8 text-slate-300" />
                ) : currentFolderId ? (
                  <Folder className="h-8 w-8 text-slate-300" />
                ) : (
                  <HardDrive className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <p className="font-semibold text-slate-600 mb-1">
                {currentFolderId === 'trash' ? 'Recycle Bin is empty' : currentFolderId ? 'This folder is empty' : 'No files found'}
              </p>
              <p className="text-xs text-slate-400 mb-5">
                {currentFolderId === 'trash' ? 'Items you delete will show up here temporarily' : search ? 'Try a different search term' : 'Upload files or refresh to load'}
              </p>
              {currentFolderId !== 'trash' && !search && (
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload Files
                  </button>
                  <button onClick={handleRefresh} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Home View Layout (Folders as Icons, Files as List) */}
          {currentFolderId === null && (quickAccessFolders.length > 0 || filteredFiles.length > 0) && (
            <div className="space-y-6 select-none">
              {/* Quick access Section - ONLY displayed if folders are pinned to Quick access */}
              {quickAccessFolders.length > 0 && (
                <section className="space-y-2">
                  <div 
                    className="flex items-center gap-2 cursor-pointer select-none group w-fit" 
                    onClick={() => setQuickAccessExpanded(!quickAccessExpanded)}
                  >
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${quickAccessExpanded ? '' : '-rotate-90'}`} />
                    <span className="font-semibold text-slate-800 text-xs tracking-wide">Quick access</span>
                  </div>
                  
                  {quickAccessExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-1 pl-6 animate-fade-in">
                      {quickAccessFolders.map(folder => {
                        const sel = selectedIds.has(folder.id);
                        const renaming = renamingId === folder.id;
                        return (
                          <div
                            key={folder.id}
                            onClick={e => handleItemClick(e, folder.id, folder, true)}
                            onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }}
                            onContextMenu={e => handleContextMenu(e, folder, 'folder')}
                            className={`group flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-slate-100/60 select-none transition-all ${
                              sel ? 'bg-blue-50/80 border border-blue-200 shadow-sm' : 'border border-transparent'
                            }`}
                          >
                            <div className="w-12 h-10 flex items-center justify-center shrink-0">
                              <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-9 h-7.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {renaming ? (
                                <input
                                  autoFocus value={renameValue}
                                  onChange={e => setRenameValue(e.target.value)}
                                  onFocus={e => e.target.select()}
                                  onBlur={() => handleRenameFolder(folder.id, renameValue)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }}
                                  className="w-full text-xs border border-blue-400 rounded px-1 py-0.5 focus:outline-none bg-white text-slate-800"
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <p className="font-semibold text-slate-750 text-xs truncate" title={folder.name}>
                                    {folder.name}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5 min-w-0">
                                    <span className="text-[9.5px] text-slate-400 font-medium truncate">
                                      {folder.description || 'File folder'}
                                    </span>
                                    <Pin className="h-2.5 w-2.5 text-blue-400 rotate-45 shrink-0" />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {quickAccessFolders.length > 0 && filteredFiles.length > 0 && (
                <div className="border-b border-slate-200/85 my-4" />
              )}

              {/* Recent Section */}
              {filteredFiles.length > 0 && (
                <section className="space-y-3">
                  <div 
                    className="flex items-center gap-3 cursor-pointer select-none group w-fit" 
                    onClick={() => setRecentExpanded(!recentExpanded)}
                  >
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${recentExpanded ? '' : '-rotate-90'}`} />
                    
                    {/* Pills Selector */}
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setRecentTab('recent')} 
                        className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold ${
                          recentTab === 'recent' 
                            ? 'bg-blue-100 text-blue-600 shadow-sm' 
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-100/50 bg-white'
                        }`}
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>Recent</span>
                      </button>
                      <button 
                        onClick={() => setRecentTab('favorites')} 
                        className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold ${
                          recentTab === 'favorites' 
                            ? 'bg-blue-100 text-blue-600 shadow-sm' 
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-100/50 bg-white'
                        }`}
                      >
                        <Star className="h-3.5 w-3.5" />
                        <span>Favorites</span>
                      </button>
                      <button 
                        onClick={() => setRecentTab('shared')} 
                        className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-semibold ${
                          recentTab === 'shared' 
                            ? 'bg-blue-100 text-blue-600 shadow-sm' 
                            : 'border border-slate-200 text-slate-500 hover:bg-slate-100/50 bg-white'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Shared</span>
                      </button>
                    </div>
                  </div>

                  {recentExpanded && (
                    <div className="pl-6 animate-fade-in">
                      {recentTab === 'recent' && (
                        <table className="w-full text-left border-collapse bg-transparent">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="px-4 py-2.5 w-10" />
                              <th className="px-4 py-2.5">Name</th>
                              <th className="px-4 py-2.5 w-48">Date accessed</th>
                              <th className="px-4 py-2.5 w-36">Account</th>
                              <th className="px-4 py-2.5 w-36">Activity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredFiles.map(file => {
                              const sel = selectedIds.has(file.id);
                              const isImg = file.mimeType.startsWith('image/');
                              const folderPath = getFolderPath(file.folderId, folders);
                              
                              return (
                                <tr 
                                  key={file.id} 
                                  onClick={e => handleItemClick(e, file.id, file, false)} 
                                  onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }} 
                                  onContextMenu={e => handleContextMenu(e, file, 'file')} 
                                  className={`cursor-pointer select-none transition-colors duration-100 ${
                                    sel ? 'bg-blue-100/60' : 'hover:bg-slate-100/60'
                                  }`}
                                >
                                  <td className="px-4 py-2">
                                    <div className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center bg-slate-100">
                                      {isImg ? <img src={getMediaUrl(file.url, file.updatedAt)} className="max-w-full max-h-full object-contain" /> : <FilePlaceholder mimeType={file.mimeType} className="w-5 h-6" />}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <p className="font-semibold text-slate-705 text-xs truncate max-w-xs">{file.originalName}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{folderPath}</p>
                                  </td>
                                  <td className="px-4 py-2 text-xs text-slate-400 font-medium">{formatDate(file.createdAt)}</td>
                                  <td className="px-4 py-2 text-xs text-slate-400 font-medium">Admin</td>
                                  <td className="px-4 py-2 text-xs text-slate-400 font-medium">Uploaded</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {recentTab === 'favorites' && (
                        (() => {
                          const favFiles = files.filter(f => favoritedIds.has(f.id));
                          if (favFiles.length === 0) {
                            return (
                              <div className="py-8 text-center text-slate-400 text-xs select-none">
                                <Star className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-500">No favorite items yet</p>
                                <p className="text-[10px] mt-0.5 text-slate-400">Right-click files or toggle the star in details panel to add favorites</p>
                              </div>
                            );
                          }
                          return (
                            <table className="w-full text-left border-collapse bg-transparent">
                              <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  <th className="px-4 py-2.5 w-10" />
                                  <th className="px-4 py-2.5">Name</th>
                                  <th className="px-4 py-2.5 w-48">Date accessed</th>
                                  <th className="px-4 py-2.5 w-36">Account</th>
                                  <th className="px-4 py-2.5 w-36">Activity</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {favFiles.map(file => {
                                  const sel = selectedIds.has(file.id);
                                  const isImg = file.mimeType.startsWith('image/');
                                  const folderPath = getFolderPath(file.folderId, folders);
                                  
                                  return (
                                    <tr 
                                      key={file.id} 
                                      onClick={e => handleItemClick(e, file.id, file, false)} 
                                      onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }} 
                                      onContextMenu={e => handleContextMenu(e, file, 'file')} 
                                      className={`cursor-pointer select-none transition-colors duration-100 ${
                                        sel ? 'bg-blue-100/60' : 'hover:bg-slate-100/60'
                                      }`}
                                    >
                                      <td className="px-4 py-2">
                                        <div className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center bg-slate-100">
                                          {isImg ? <img src={getMediaUrl(file.url, file.updatedAt)} className="max-w-full max-h-full object-contain" /> : <FilePlaceholder mimeType={file.mimeType} className="w-5 h-6" />}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        <p className="font-semibold text-slate-705 text-xs truncate max-w-xs">{file.originalName}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{folderPath}</p>
                                      </td>
                                      <td className="px-4 py-2 text-xs text-slate-400 font-medium">{formatDate(file.createdAt)}</td>
                                      <td className="px-4 py-2 text-xs text-slate-400 font-medium">Admin</td>
                                      <td className="px-4 py-2 text-xs text-slate-400 font-medium">Uploaded</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()
                      )}

                      {recentTab === 'shared' && (
                        <div className="py-8 text-center text-slate-400 text-xs select-none">
                          <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-500">No shared cloud items</p>
                          <p className="text-[10px] mt-0.5 text-slate-400">Shared cloud items & folders will appear here when connected</p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* Standard Views (only active inside folders, currentFolderId !== null) */}
          {currentFolderId !== null && (
            <>
              {/* Icon Views (Small, Medium, Large, Extra Large) */}
              {(view === 'small-icons' || view === 'medium-icons' || view === 'large-icons' || view === 'extra-large-icons') && (visibleFolders.length > 0 || filteredFiles.length > 0) && (() => {
                const isSmall = view === 'small-icons';
                const isMedium = view === 'medium-icons';
                const isLarge = view === 'large-icons';
                const widthStyle = isSmall ? '44px' : isMedium ? '68px' : isLarge ? '92px' : '148px';
                const folderIconClass = isSmall ? 'w-10 h-8 mb-0.5 shrink-0' : isMedium ? 'w-16 h-13 mb-0.5 shrink-0' : isLarge ? 'w-22 h-17 mb-0.5 shrink-0' : 'w-36 h-28 mb-0.5 shrink-0';
                
                const fileThumbClass = isSmall ? 'w-10 h-8 rounded-none overflow-hidden flex items-center justify-center relative mb-0.5 shrink-0' : isMedium ? 'w-16 h-13 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow' : isLarge ? 'w-22 h-17 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow' : 'w-36 h-28 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow';
                const fileIconClass = isSmall ? 'h-4 w-4 text-slate-400' : isMedium ? 'h-6 w-6 text-slate-400' : isLarge ? 'h-8 w-8 text-slate-400' : 'h-12 w-12 text-slate-400';
                
                const textClass = isSmall ? 'text-[9.5px]' : isMedium ? 'text-[10px]' : isLarge ? 'text-[11px]' : 'text-xs';
                
                return (
                  <div 
                    className="grid gap-x-3 gap-y-2.5 w-full"
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${widthStyle}, 1fr))` }}
                    onDragOver={handleDragOver}
                  >
                    {combinedItems.map(item => {
                      const sel = selectedIds.has(item.id);
                      
                      if ('isFolder' in item && item.isFolder) {
                        const folder = item as MediaFolder;
                        const renaming = renamingId === folder.id;
                        return (
                          <FolderCard 
                            key={folder.id}
                            folder={folder}
                            isSelected={sel}
                            isRenaming={renaming}
                            renameValue={renameValue}
                            size={view === 'small-icons' ? 'small' : view === 'medium-icons' ? 'medium' : view === 'large-icons' ? 'large' : 'xl'}
                            onRenameChange={setRenameValue}
                            onRenameBlur={() => handleRenameFolder(folder.id, renameValue)}
                            onRenameKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }}
                            onClick={(e: React.MouseEvent) => handleItemClick(e, folder.id, folder, true)}
                            onDoubleClick={(e: React.MouseEvent) => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }}
                            onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, folder, 'folder')}
                            draggable={!renaming}
                            onDragStart={(e: React.DragEvent) => handleItemDragStart(e, folder.id, folder.name, true)}
                            onDragOver={(e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                            onDragLeave={(e: React.DragEvent) => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                            onDrop={(e: React.DragEvent) => handleFolderDrop(e, folder.id, folder.name)}
                            onDragEnd={handleDragEnd}
                            draggingId={draggingId}
                            isDragOver={dragOverTargetId === folder.id}
                          />
                        );
                      } else {
                        const file = item as MediaItem;
                        return (
                          <FileCard 
                            key={file.id}
                            file={file}
                            isSelected={sel}
                            size={view === 'small-icons' ? 'small' : view === 'medium-icons' ? 'medium' : view === 'large-icons' ? 'large' : 'xl'}
                            onClick={(e: React.MouseEvent) => handleItemClick(e, file.id, file, false)}
                            onDoubleClick={(e: React.MouseEvent) => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }}
                            onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, file, 'file')}
                            draggable
                            onDragStart={(e: React.DragEvent) => handleItemDragStart(e, file.id, file.originalName, false)}
                            onDragEnd={handleDragEnd}
                            draggingId={draggingId}
                          />
                        );
                      }
                    })}
                  </div>
                );
              })()}

              {/* Tiles View */}
              {view === 'tiles' && (visibleFolders.length > 0 || filteredFiles.length > 0) && (
                <div className="space-y-6">
                  {/* Folders */}
                  {visibleFolders.length > 0 && (
                    <section>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Folders</p>
                      <div className="flex flex-wrap gap-2">
                        {visibleFolders.map(folder => {
                          const sel = selectedIds.has(folder.id);
                          const renaming = renamingId === folder.id;
                          const isTargeted = dragOverTargetId === folder.id;
                          return (
                            <div
                              key={folder.id}
                              onClick={e => handleItemClick(e, folder.id, folder, true)}
                              onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }}
                              onContextMenu={e => handleContextMenu(e, folder, 'folder')}
                              draggable={!renaming}
                              onDragStart={e => handleItemDragStart(e, folder.id, folder.name, true)}
                              onDragEnd={handleDragEnd}
                              onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                              onDragLeave={e => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                              onDrop={e => handleFolderDrop(e, folder.id, folder.name)}
                              className={`group flex items-center gap-2.5 p-1 rounded cursor-pointer select-none transition-all duration-100 ${
                                isTargeted
                                  ? 'border-2 border-blue-500 bg-blue-100/80 shadow-md scale-105'
                                  : sel 
                                    ? 'border border-blue-300 bg-blue-100/50 shadow-sm' 
                                    : 'border border-transparent hover:bg-slate-100/60'
                              } ${draggingId === folder.id ? 'opacity-30' : ''}`}
                              style={{ width: '210px' }}
                            >
                              <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-9 h-7 shrink-0" />
                              <div className="min-w-0 flex-1">
                                {renaming ? (
                                  <input
                                    autoFocus value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onBlur={() => handleRenameFolder(folder.id, renameValue)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }}
                                    className="w-full text-[10px] border border-blue-400 rounded px-1 py-0.5 focus:outline-none bg-white"
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <p className="text-[10.5px] font-semibold text-slate-700 truncate leading-snug">{folder.name}</p>
                                )}
                                <p className="text-[9.5px] text-slate-400 leading-none mt-0.5">{folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {visibleFolders.length > 0 && filteredFiles.length > 0 && (
                    <div className="border-b border-slate-200/80 my-4" />
                  )}

                  {/* Files */}
                  {filteredFiles.length > 0 && (
                    <section>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Files</p>
                      <div className="flex flex-wrap gap-2">
                        {filteredFiles.map(file => {
                          const sel = selectedIds.has(file.id);
                          const isImg = file.mimeType.startsWith('image/');
                          return (
                            <div
                              key={file.id}
                              onClick={e => handleItemClick(e, file.id, file, false)}
                              onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }}
                              onContextMenu={e => handleContextMenu(e, file, 'file')}
                              draggable
                              onDragStart={e => handleItemDragStart(e, file.id, file.originalName, false)}
                              onDragEnd={handleDragEnd}
                              className={`group flex items-center gap-2.5 p-1 rounded cursor-pointer select-none transition-colors duration-100 ${
                                sel 
                                  ? 'border border-blue-300 bg-blue-100/50 shadow-sm' 
                                  : 'border border-transparent hover:bg-slate-100/60'
                              } ${draggingId === file.id ? 'opacity-30' : ''}`}
                              style={{ width: '210px' }}
                            >
                              <div className="w-9 h-7 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 bg-slate-100">
                                {isImg
                                  ? <img src={getMediaUrl(file.url, file.updatedAt)} alt={file.alt} className="max-w-full max-h-full object-contain" loading="lazy" />
                                  : <FilePlaceholder mimeType={file.mimeType} className="w-5 h-6" />
                                }
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10.5px] font-semibold text-slate-700 truncate leading-snug" title={file.originalName}>{file.originalName}</p>
                                <p className="text-[9.5px] text-slate-400 leading-none mt-0.5">{formatSize(file.size)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* List View */}
              {view === 'list' && (visibleFolders.length > 0 || filteredFiles.length > 0) && (
                <div className="space-y-6">
                  {visibleFolders.length > 0 && (
                    <section>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Folders</p>
                      <div className="flex flex-wrap gap-2.5">
                        {visibleFolders.map(folder => {
                          const sel = selectedIds.has(folder.id);
                          const renaming = renamingId === folder.id;
                          const isTargeted = dragOverTargetId === folder.id;
                          return (
                            <div
                              key={folder.id}
                              onClick={e => handleItemClick(e, folder.id, folder, true)}
                              onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }}
                              onContextMenu={e => handleContextMenu(e, folder, 'folder')}
                              draggable={!renaming}
                              onDragStart={e => handleItemDragStart(e, folder.id, folder.name, true)}
                              onDragEnd={handleDragEnd}
                              onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                              onDragLeave={e => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                              onDrop={e => handleFolderDrop(e, folder.id, folder.name)}
                              className={`group flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer select-none transition-all duration-100 ${
                                isTargeted
                                  ? 'border-2 border-blue-500 bg-blue-100/80 shadow-md scale-105'
                                  : sel ? 'bg-blue-100/60 border border-blue-300' : 'border border-transparent hover:bg-slate-100/60'
                              } ${draggingId === folder.id ? 'opacity-30' : ''}`}
                              style={{ width: '150px' }}
                            >
                              <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-5 h-4 shrink-0" />
                              <div className="min-w-0 flex-1">
                                {renaming ? (
                                  <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => handleRenameFolder(folder.id, renameValue)} onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }} className="w-full text-[10px] border border-blue-400 rounded px-1 py-0.5 focus:outline-none bg-white text-slate-800" onClick={e => e.stopPropagation()} />
                                ) : (
                                  <span className="font-semibold text-slate-700 text-xs truncate block">{folder.name}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {visibleFolders.length > 0 && filteredFiles.length > 0 && (
                    <div className="border-b border-slate-200/80 my-4" />
                  )}

                  {filteredFiles.length > 0 && (
                    <section>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Files</p>
                      <div className="flex flex-wrap gap-2.5">
                        {filteredFiles.map(file => {
                          const sel = selectedIds.has(file.id);
                          const isImg = file.mimeType.startsWith('image/');
                          return (
                            <div
                              key={file.id}
                              onClick={e => handleItemClick(e, file.id, file, false)}
                              onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }}
                              onContextMenu={e => handleContextMenu(e, file, 'file')}
                              draggable
                              onDragStart={e => handleItemDragStart(e, file.id, file.originalName, false)}
                              onDragEnd={handleDragEnd}
                              className={`group flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer select-none transition-colors duration-100 ${
                                sel ? 'bg-blue-100/60 border border-blue-300' : 'border border-transparent hover:bg-slate-100/60'
                              } ${draggingId === file.id ? 'opacity-30' : ''}`}
                              style={{ width: '150px' }}
                            >
                              <div className="w-5 h-5 rounded-none overflow-hidden flex items-center justify-center shrink-0 bg-slate-100">
                                {isImg ? <img src={getMediaUrl(file.url, file.updatedAt)} className="max-w-full max-h-full object-contain" /> : <FilePlaceholder mimeType={file.mimeType} className="w-3.5 h-4.5" />}
                              </div>
                              <span className="font-semibold text-slate-700 text-xs truncate block flex-1">{file.originalName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Details View */}
              {view === 'details' && (visibleFolders.length > 0 || filteredFiles.length > 0) && (
                <table className="w-full text-left border-collapse bg-transparent">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2.5 w-10" />
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5 w-24">Size</th>
                      <th className="px-4 py-2.5 w-28">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleFolders.map(folder => {
                      const sel = selectedIds.has(folder.id);
                      const renaming = renamingId === folder.id;
                      const isTargeted = dragOverTargetId === folder.id;
                      return (
                        <tr 
                          key={folder.id} 
                          onClick={e => handleItemClick(e, folder.id, folder, true)} 
                          onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }} 
                          onContextMenu={e => handleContextMenu(e, folder, 'folder')} 
                          draggable={!renaming}
                          onDragStart={e => handleItemDragStart(e, folder.id, folder.name, true)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                          onDragLeave={e => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                          onDrop={e => handleFolderDrop(e, folder.id, folder.name)}
                          className={`cursor-pointer select-none transition-all duration-100 ${
                            isTargeted
                              ? 'bg-blue-200/80 font-bold'
                              : sel ? 'bg-blue-100/60' : 'hover:bg-slate-100/60'
                          } ${draggingId === folder.id ? 'opacity-30' : ''}`}
                        >
                          <td className="px-4 py-2">
                            <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-5 h-4 shrink-0" />
                          </td>
                          <td className="px-4 py-2">
                            {renaming
                              ? <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => handleRenameFolder(folder.id, renameValue)} onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }} className="border border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-none" onClick={e => e.stopPropagation()} />
                              : <span className="font-semibold text-slate-700 text-xs">{folder.name}</span>
                            }
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400 font-medium">{folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}</td>
                          <td className="px-4 py-2 text-xs text-slate-400 font-medium">{new Date(folder.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {filteredFiles.map(file => {
                      const sel = selectedIds.has(file.id);
                      const isImg = file.mimeType.startsWith('image/');
                      return (
                        <tr 
                          key={file.id} 
                          onClick={e => handleItemClick(e, file.id, file, false)} 
                          onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }} 
                          onContextMenu={e => handleContextMenu(e, file, 'file')} 
                          draggable
                          onDragStart={e => handleItemDragStart(e, file.id, file.originalName, false)}
                          onDragEnd={handleDragEnd}
                          className={`cursor-pointer select-none transition-colors duration-100 ${
                            sel ? 'bg-blue-100/60' : 'hover:bg-slate-100/60'
                          } ${draggingId === file.id ? 'opacity-30' : ''}`}
                        >
                          <td className="px-4 py-2">
                            <div className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center bg-slate-100">
                              {isImg ? <img src={getMediaUrl(file.url, file.updatedAt)} className="max-w-full max-h-full object-contain" /> : <FilePlaceholder mimeType={file.mimeType} className="w-5 h-6" />}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <p className="font-semibold text-slate-700 text-xs truncate max-w-xs">{file.originalName}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{file.mimeType}</p>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400 font-medium">{formatSize(file.size)}</td>
                          <td className="px-4 py-2 text-xs text-slate-400 font-medium">{new Date(file.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Content View */}
              {view === 'content' && (visibleFolders.length > 0 || filteredFiles.length > 0) && (
                <div className="space-y-3">
                  {visibleFolders.map(folder => {
                    const sel = selectedIds.has(folder.id);
                    const renaming = renamingId === folder.id;
                    const isTargeted = dragOverTargetId === folder.id;
                    return (
                      <div
                        key={folder.id}
                        onClick={e => handleItemClick(e, folder.id, folder, true)}
                        onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(folder.id, true); }}
                        onContextMenu={e => handleContextMenu(e, folder, 'folder')}
                        draggable={!renaming}
                        onDragStart={e => handleItemDragStart(e, folder.id, folder.name, true)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (canDropOnFolder(folder.id)) setDragOverTargetId(folder.id); }}
                        onDragLeave={e => { e.stopPropagation(); setDragOverTargetId(prev => prev === folder.id ? null : prev); }}
                        onDrop={e => handleFolderDrop(e, folder.id, folder.name)}
                        className={`group flex items-center gap-4 p-2 rounded cursor-pointer select-none transition-all duration-100 w-full ${
                          isTargeted
                            ? 'bg-blue-200/80 border-2 border-blue-500 shadow-sm'
                            : sel ? 'bg-blue-100/60 border border-blue-300' : 'border border-transparent hover:bg-slate-100/60'
                        } ${draggingId === folder.id ? 'opacity-30' : ''}`}
                      >
                        <div className="w-12 h-10 flex items-center justify-center shrink-0">
                          <WindowsFolderIcon color={folder.color} icon={folder.icon} className="w-9 h-7.5" />
                        </div>
                        <div className="min-w-0 flex-1 grid grid-cols-4 gap-4 items-center">
                          <div className="col-span-2">
                            {renaming ? (
                              <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => handleRenameFolder(folder.id, renameValue)} onKeyDown={e => { if (e.key === 'Enter') handleRenameFolder(folder.id, renameValue); if (e.key === 'Escape') setRenamingId(null); }} className="w-full text-xs border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none bg-white text-slate-800" onClick={e => e.stopPropagation()} />
                            ) : (
                              <p className="font-semibold text-slate-800 text-xs truncate">{folder.name}</p>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">Folder</div>
                          <div className="text-xs text-slate-400 font-medium">{folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredFiles.map(file => {
                    const sel = selectedIds.has(file.id);
                    const isImg = file.mimeType.startsWith('image/');
                    return (
                      <div
                        key={file.id}
                        onClick={e => handleItemClick(e, file.id, file, false)}
                        onDoubleClick={e => { e.stopPropagation(); handleItemDoubleClick(file.id, false); }}
                        onContextMenu={e => handleContextMenu(e, file, 'file')}
                        draggable
                        onDragStart={e => handleItemDragStart(e, file.id, file.originalName, false)}
                        onDragEnd={handleDragEnd}
                        className={`group flex items-center gap-4 p-2 rounded cursor-pointer select-none transition-colors duration-100 w-full ${
                          sel ? 'bg-blue-100/60 border border-blue-300' : 'border border-transparent hover:bg-slate-100/60'
                        } ${draggingId === file.id ? 'opacity-30' : ''}`}
                      >
                        <div className="w-12 h-10 rounded-none overflow-hidden flex items-center justify-center shrink-0 bg-slate-100">
                          {isImg ? <img src={getMediaUrl(file.url, file.updatedAt)} className="max-w-full max-h-full object-contain" /> : <FilePlaceholder mimeType={file.mimeType} className="w-7 h-9" />}
                        </div>
                        <div className="min-w-0 flex-1 grid grid-cols-4 gap-4 items-center">
                          <div className="col-span-2">
                            <p className="font-semibold text-slate-800 text-xs truncate">{file.originalName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{file.mimeType}</p>
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{formatSize(file.size)}</div>
                          <div className="text-xs text-slate-400 font-medium">{new Date(file.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          </>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-7 border-t border-slate-200 bg-slate-50 flex items-center px-4 gap-4 shrink-0">
          <span className="text-[10px] text-slate-500">
            {currentFolder
              ? `${currentFolder.name} — ${filteredFiles.length} file${filteredFiles.length !== 1 ? 's' : ''}`
              : `${folders.length} folder${folders.length !== 1 ? 's' : ''} · ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </span>
          {stats && <span className="text-[10px] text-slate-400">{formatSize(stats.totalSize)} used</span>}
          <div className="flex-1" />
          {selectedIds.size > 0 && <span className="text-[10px] text-blue-600 font-medium">{selectedIds.size} selected</span>}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selectedFile && (
        <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0" onClick={e => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">Details</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => toggleFavorite(selectedFile.id)} 
                className="p-1 text-slate-400 hover:text-amber-500 rounded hover:bg-slate-100 transition-colors"
                title={favoritedIds.has(selectedFile.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Star className={`h-4 w-4 ${favoritedIds.has(selectedFile.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button onClick={() => setSelectedFile(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Preview */}
            <div className="aspect-video flex items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-100">
              {selectedFile.mimeType.startsWith('image/')
                ? <img src={getMediaUrl(selectedFile.url, selectedFile.updatedAt)} alt={selectedFile.alt} className="w-full h-full object-contain" />
                : <FilePlaceholder mimeType={selectedFile.mimeType} className="h-16 w-12" />
              }
            </div>

            <div className="p-4 space-y-4">
              {/* Filename */}
              <p className="text-sm font-semibold text-slate-800 break-all leading-tight">{selectedFile.originalName}</p>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Size</span>
                  <span className="text-slate-700 font-medium">{formatSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-700 font-medium uppercase">{selectedFile.mimeType.split('/')[1] || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Added</span>
                  <span className="text-slate-700 font-medium">{new Date(selectedFile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* URL */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">File URL</p>
                <div className="flex gap-1.5">
                  <input readOnly value={selectedFile.url} className="flex-1 min-w-0 border border-slate-200 rounded-md px-2 py-1.5 text-[10px] font-mono bg-slate-50 text-slate-600 focus:outline-none truncate" />
                  <button onClick={() => { navigator.clipboard.writeText(window.location.origin + selectedFile.url); toast.success('URL copied'); }} className="shrink-0 p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 text-slate-500">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Alt text */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Alt Text</p>
                <textarea
                  value={altValue}
                  onChange={e => setAltValue(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Describe this file for screen readers & SEO…"
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={handleSaveAlt}
                  disabled={savingAlt || altValue === selectedFile.alt}
                  className="mt-1.5 w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {savingAlt ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save Alt Text
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-slate-200 space-y-2">
            <button onClick={() => window.open(selectedFile.url, '_blank')} className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Open File
            </button>
            <button onClick={() => { setShowMoveModal(true); setMoveTargetId(selectedFile.folderId ?? null); }} className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <FolderInput className="h-3.5 w-3.5" /> Move to Folder
            </button>
            <button onClick={() => replaceInputRef.current?.click()} disabled={replacing} className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {replacing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {replacing ? 'Replacing…' : 'Replace File'}
            </button>
            <input ref={replaceInputRef} type="file" className="hidden" onChange={e => handleReplaceFile(e.target.files)} />
            <button onClick={() => promptDeleteItems([selectedFile.id])} className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete File
            </button>
          </div>
        </aside>
      )}

      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="absolute z-50 w-40 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700/80 p-1 text-[11px] text-slate-200 select-none cursor-default"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.type === 'file' && contextMenu.item && (
            currentFolderId === 'trash' ? (
              <div className="space-y-0.5">
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-emerald-600 hover:text-white text-emerald-300 transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { handleRestore([contextMenu.item!.id]); setContextMenu(null); }}>
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" /> Restore
                </button>
                <div className="h-px bg-slate-700/60 my-1 mx-1" />
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-red-600 text-red-300 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { promptDeleteItems([contextMenu.item!.id]); setContextMenu(null); }}>
                  <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete Forever
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { setSelectedFile(contextMenu.item as MediaItem); setAltValue((contextMenu.item as MediaItem).alt || ''); setContextMenu(null); }}>
                  <Edit2 className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Edit Details
                </button>
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { toggleFavorite(contextMenu.item!.id); setContextMenu(null); }}>
                  <Star className={`h-3.5 w-3.5 shrink-0 ${favoritedIds.has(contextMenu.item!.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                  {favoritedIds.has(contextMenu.item!.id) ? 'Remove Favorite' : 'Add Favorite'}
                </button>
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { setShowMoveModal(true); setMoveTargetId(null); setContextMenu(null); }}>
                  <FolderInput className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Move to Folder
                </button>
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { navigator.clipboard.writeText(window.location.origin + (contextMenu.item as MediaItem).url); toast.success('URL copied'); setContextMenu(null); }}>
                  <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Copy URL
                </button>
                <div className="h-px bg-slate-700/60 my-1 mx-1" />
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-red-600 text-red-300 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { promptDeleteItems([contextMenu.item!.id]); setContextMenu(null); }}>
                  <Trash2 className="h-3.5 w-3.5 shrink-0" /> Move to Trash
                </button>
              </div>
            )
          )}
          {contextMenu.type === 'folder' && contextMenu.item && (() => {
            const ctxFolder = contextMenu.item as MediaFolder;
            const isRoot = !ctxFolder.parentId;
            const isSidebarPinned = sidebarPinnedFolderIds.has(ctxFolder.id);
            const isQAPinned = quickAccessPinnedFolderIds.has(ctxFolder.id);
            
            if (currentFolderId === 'trash') {
              return (
                <div className="space-y-0.5">
                  <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-emerald-600 hover:text-white text-emerald-300 transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { handleRestore([ctxFolder.id]); setContextMenu(null); }}>
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" /> Restore Folder
                  </button>
                  <div className="h-px bg-slate-700/60 my-1 mx-1" />
                  <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-red-600 text-red-300 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { promptDeleteFolder(ctxFolder.id, ctxFolder.name); setContextMenu(null); }}>
                    <Trash2 className="h-3.5 w-3.5 shrink-0" /> Delete Folder Forever
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-0.5">
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { navigateToFolder(ctxFolder.id); setContextMenu(null); }}>
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Open
                </button>
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { handleCreateNewFolderDirect(ctxFolder.id); setContextMenu(null); }}>
                  <FolderPlus className="h-3.5 w-3.5 shrink-0 text-slate-400" /> New Folder
                </button>
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { setSelectedIds(new Set([ctxFolder.id])); setShowMoveModal(true); setMoveTargetId(null); setContextMenu(null); }}>
                  <FolderInput className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Move to Folder
                </button>
                <div className="h-px bg-slate-700/60 my-1 mx-1" />
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { toggleQuickAccessPin(ctxFolder.id); setContextMenu(null); }}>
                  <Pin className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {isQAPinned ? 'Unpin Quick access' : 'Pin Quick access'}
                </button>
                {isRoot && (
                  <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { toggleSidebarPin(ctxFolder.id); setContextMenu(null); }}>
                    <Pin className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {isSidebarPinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
                  </button>
                )}
                <div className="h-px bg-slate-700/60 my-1 mx-1" />
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => {
                  skipBlurRef.current = true;
                  setRenameValue(ctxFolder.name);
                  setRenamingId(ctxFolder.id);
                  setContextMenu(null);
                  requestAnimationFrame(() => { skipBlurRef.current = false; });
                }}>
                  <Edit2 className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Rename
                </button>
                <div className="h-px bg-slate-700/60 my-1 mx-1" />
                <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-red-600 text-red-300 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { promptDeleteFolder(ctxFolder.id, ctxFolder.name); setContextMenu(null); }}>
                  <Trash2 className="h-3.5 w-3.5 shrink-0" /> Move Folder to Trash
                </button>
              </div>
            );
          })()}
          {contextMenu.type === 'background' && (
            <div className="space-y-0.5">
              <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { handleCreateNewFolderDirect(); setContextMenu(null); }}>
                <FolderPlus className="h-3.5 w-3.5 shrink-0 text-slate-400" /> New Folder
              </button>
              <button className="w-full px-2 py-1.5 text-left flex items-center gap-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap text-[11px] font-normal" onClick={() => { fileInputRef.current?.click(); setContextMenu(null); }}>
                <Upload className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Upload Here
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Move Modal ── */}
      {showMoveModal && (
        <MediaExplorerDialog 
          mode="move"
          initialFolderId={moveTargetId}
          moveItemCount={selectedIds.size}
          onClose={() => setShowMoveModal(false)}
          onConfirm={handleMove}
        />
      )}

      {/* ── Custom Move Confirmation Dialog ── */}
      {confirmMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 select-none animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <FolderInput className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">Move {confirmMove.items.length} Item{confirmMove.items.length !== 1 ? 's' : ''}?</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Move to <span className="font-semibold text-slate-700">"{confirmMove.targetFolderName}"</span>
                  </p>
                </div>
              </div>

              {/* Items List Preview */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 max-h-36 overflow-y-auto custom-scrollbar space-y-1 text-xs text-slate-600">
                {confirmMove.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-1.5 py-0.5">
                    {item.isFolder ? (
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <FileIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate flex-1 font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmMove(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeMoveItems}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Delete Confirmation Dialog ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 select-none animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {currentFolderId === 'trash'
                      ? (confirmDelete.type === 'folder' ? 'Delete Folder Forever?' : `Delete ${confirmDelete.items?.length || 0} Item${confirmDelete.items?.length !== 1 ? 's' : ''} Forever?`)
                      : (confirmDelete.type === 'folder' ? 'Move Folder to Trash?' : `Move ${confirmDelete.items?.length || 0} Item${confirmDelete.items?.length !== 1 ? 's' : ''} to Trash?`)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {currentFolderId === 'trash'
                      ? 'This action cannot be undone. Items will be permanently removed from disk.'
                      : (confirmDelete.type === 'folder'
                          ? 'This folder and all its files will be moved to Trash. Items in Trash are deleted automatically after 30 days.'
                          : 'Selected items will be moved to Trash. Items in Trash are deleted automatically after 30 days.')}
                  </p>
                </div>
              </div>

              {/* Items / Folder Preview */}
              {confirmDelete.type === 'folder' ? (
                <div className="bg-red-50/50 border border-red-100 rounded-lg p-2.5 flex items-center gap-2 text-xs text-red-900 font-medium">
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{confirmDelete.folderName}</span>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 max-h-36 overflow-y-auto custom-scrollbar space-y-1 text-xs text-slate-600">
                  {confirmDelete.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-2 px-1.5 py-0.5">
                      {item.isFolder ? (
                        <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <FileIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate flex-1 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
              >
                {currentFolderId === 'trash' ? 'Delete Forever' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── Windows Photos Image Viewer ── */}
      {viewerFile && (
        <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-auto transition-opacity duration-75 ${viewerReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setViewerFile(null)}>
          <div
            className={`bg-white border border-slate-200 shadow-2xl flex flex-col select-none ${
              viewerMaximized ? 'fixed inset-0 w-full h-full' : 'fixed rounded-xl overflow-hidden'
            }`}
            style={viewerMaximized ? undefined : {
              left: `${viewerPosition.x}px`,
              top: `${viewerPosition.y}px`,
              width: `${viewerSize.width}px`,
              height: `${viewerSize.height}px`,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Title Bar / Drag Handler */}
            <div 
              className="h-11 shrink-0 bg-slate-50 border-b border-slate-200 flex items-center justify-between pl-3.5 pr-0 cursor-move"
              onMouseDown={handleViewerMouseDown}
            >
              {/* Left Section: Controls */}
              <div className="flex items-center gap-1.5">
                {isEditingViewer ? (
                  <>
                    <button 
                      onClick={() => handleSaveCrop(true)}
                      disabled={savingCrop}
                      className="h-7 flex items-center justify-center px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md text-[11px] font-semibold transition-colors shadow-sm"
                    >
                      {savingCrop ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...
                        </>
                      ) : (
                        'Save copy'
                      )}
                    </button>
                    <button 
                      onClick={() => handleSaveCrop(false)}
                      disabled={savingCrop}
                      className="h-7 flex items-center justify-center px-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 rounded-md text-[11px] font-semibold transition-colors border border-slate-200"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingViewer(false)}
                      className="h-7 flex items-center justify-center px-2.5 text-slate-500 hover:text-slate-800 rounded-md text-[11px] font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setIsEditingViewer(true); setCropRect({ x: 10, y: 10, w: 80, h: 80 }); }}
                      className="h-7 flex items-center justify-center gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-sm"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1.5" />
                    <button 
                      onClick={() => { promptDeleteItems([viewerFile.id]); setViewerFile(null); }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-red-655 rounded-md transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => { toggleFavorite(viewerFile.id); }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-amber-500 rounded-md transition-colors" 
                      title="Favorite"
                    >
                      <Star className={`h-3.5 w-3.5 ${favoritedIds.has(viewerFile.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(window.location.origin + viewerFile.url); toast.success('URL copied'); }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-md transition-colors" 
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Middle Section: Filename */}
              <span className="text-slate-700 text-xs font-semibold truncate max-w-[300px] text-center px-4">
                {isEditingViewer ? `Crop & Rotate - ${viewerFile.originalName}` : viewerFile.originalName}
              </span>

              {/* Right Section: Window controls */}
              <div className="flex items-stretch h-full shrink-0">
                <button 
                  onClick={() => setViewerMaximized(!viewerMaximized)} 
                  className="w-12 flex items-center justify-center hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
                  title={viewerMaximized ? "Restore Window" : "Maximize Window"}
                >
                  {viewerMaximized ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none"/>
                      <path d="M3 1H9V7" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => setViewerFile(null)} 
                  className={`w-12 flex items-center justify-center hover:bg-[#E81123] text-slate-500 hover:text-white transition-colors ${
                    viewerMaximized ? '' : 'rounded-tr-xl'
                  }`}
                  title="Close"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Viewer Display Container */}
            <div 
              className="flex-1 bg-[#F9F9F9] flex items-center justify-center overflow-hidden relative p-6 cursor-grab active:cursor-grabbing"
              onWheel={isEditingViewer ? undefined : handleViewerWheel}
            >
              {isEditingViewer ? (
                /* Edit Mode: Crop Overlay Wrapper */
                <div 
                  className="relative select-none"
                  style={{
                    transform: `rotate(${viewerRotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <img 
                    ref={imgRef}
                    src={getMediaUrl(viewerFile.url, viewerFile.updatedAt)} 
                    alt="To Crop" 
                    className="max-w-[70vw] max-h-[60vh] object-contain select-none pointer-events-none"
                    onLoad={e => setImgDimensions(`${e.currentTarget.naturalWidth} x ${e.currentTarget.naturalHeight}`)}
                  />
                  
                  {/* Bounding box shadow borders */}
                  <div 
                    className="absolute bg-black/40 left-0 right-0 top-0 pointer-events-none"
                    style={{ height: `${cropRect.y}%` }}
                  />
                  <div 
                    className="absolute bg-black/40 left-0 right-0 bottom-0 pointer-events-none"
                    style={{ height: `${100 - cropRect.y - cropRect.h}%` }}
                  />
                  <div 
                    className="absolute bg-black/40 left-0 top-0 bottom-0 pointer-events-none"
                    style={{ 
                      top: `${cropRect.y}%`, 
                      height: `${cropRect.h}%`, 
                      width: `${cropRect.x}%` 
                    }}
                  />
                  <div 
                    className="absolute bg-black/40 right-0 top-0 bottom-0 pointer-events-none"
                    style={{ 
                      top: `${cropRect.y}%`, 
                      height: `${cropRect.h}%`, 
                      width: `${100 - cropRect.x - cropRect.w}%` 
                    }}
                  />

                  {/* Highlighted Crop Area Box */}
                  <div 
                    className="absolute border border-dashed border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move"
                    style={{ 
                      left: `${cropRect.x}%`, 
                      top: `${cropRect.y}%`, 
                      width: `${cropRect.w}%`, 
                      height: `${cropRect.h}%` 
                    }}
                    onMouseDown={e => handleCropMouseDown(e, 'move')}
                  >
                    {/* Resizing Handles */}
                    <div 
                      className="absolute w-3.5 h-3.5 bg-white border border-slate-600 rounded-sm -top-1.5 -left-1.5 cursor-nwse-resize z-10"
                      onMouseDown={e => handleCropMouseDown(e, 'tl')}
                    />
                    <div 
                      className="absolute w-3.5 h-3.5 bg-white border border-slate-600 rounded-sm -top-1.5 -right-1.5 cursor-nesw-resize z-10"
                      onMouseDown={e => handleCropMouseDown(e, 'tr')}
                    />
                    <div 
                      className="absolute w-3.5 h-3.5 bg-white border border-slate-600 rounded-sm -bottom-1.5 -left-1.5 cursor-nesw-resize z-10"
                      onMouseDown={e => handleCropMouseDown(e, 'bl')}
                    />
                    <div 
                      className="absolute w-3.5 h-3.5 bg-white border border-slate-600 rounded-sm -bottom-1.5 -right-1.5 cursor-nwse-resize z-10"
                      onMouseDown={e => handleCropMouseDown(e, 'br')}
                    />
                  </div>
                </div>
              ) : (
                /* Regular Viewer Mode */
                <div 
                  className="transition-transform duration-200 ease-out"
                  style={{ 
                    transform: `scale(${viewerZoom / 100}) rotate(${viewerRotation}deg)`, 
                    transformOrigin: 'center center' 
                  }}
                >
                  <img 
                    ref={imgRef}
                    src={getMediaUrl(viewerFile.url, viewerFile.updatedAt)} 
                    alt={viewerFile.alt || viewerFile.originalName} 
                    className="max-w-full max-h-[70vh] object-contain select-none pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    onLoad={e => setImgDimensions(`${e.currentTarget.naturalWidth} x ${e.currentTarget.naturalHeight}`)}
                  />
                </div>
              )}
            </div>

            {/* Bottom Status / Control Bar */}
            <div className="h-9 shrink-0 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-4 text-[10px] text-slate-600 font-medium font-sans">
              {isEditingViewer ? (
                <>
                  {/* Left: Rotate & Aspect Ratio presets */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewerRotation(r => (r + 90) % 360)} 
                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-md transition-colors flex items-center gap-1.5 text-[11px] border border-slate-200"
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
                    </button>
                    <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                    <span className="text-[10px] text-slate-400 font-medium">Aspect:</span>
                    <button
                      onClick={() => setCropRect({ x: 10, y: 10, w: 80, h: 80 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setCropRect({ x: 15, y: 15, w: 70, h: 70 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                    >
                      1:1
                    </button>
                    <button
                      onClick={() => setCropRect({ x: 5, y: 22, w: 90, h: 56 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                    >
                      16:9
                    </button>
                    <button
                      onClick={() => setCropRect({ x: 10, y: 16, w: 80, h: 68 })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                    >
                      4:3
                    </button>
                  </div>
                  {/* Right: Reset Crop */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCropRect({ x: 0, y: 0, w: 100, h: 100 })}
                      className="p-1 px-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-[11px]"
                    >
                      Select All
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Left Section: Info */}
                  <div className="flex items-center gap-3">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    {imgDimensions && <span>{imgDimensions}</span>}
                    <span>{formatSize(viewerFile.size)}</span>
                  </div>

                  {/* Center Section: Empty */}
                  <div />

                  {/* Right Section: Zoom Controls */}
                  <div className="flex items-center gap-2.5">
                    <span>{viewerZoom}%</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setViewerZoom(z => Math.max(10, z - 10))}
                        className="p-1 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded transition-colors"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <input 
                        type="range" 
                        min="10" 
                        max="500" 
                        value={viewerZoom} 
                        onChange={e => setViewerZoom(Number(e.target.value))} 
                        className="w-16 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                      />
                      <button 
                        onClick={() => setViewerZoom(z => Math.min(500, z + 10))}
                        className="p-1 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded transition-colors"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Viewer Resize Handles */}
            {!viewerMaximized && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'n')} />
                <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 's')} />
                <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'w')} />
                <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'e')} />
                <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'se')} />
                <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'sw')} />
                <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'ne')} />
                <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize pointer-events-auto" onMouseDown={e => handleViewerResizeMouseDown(e, 'nw')} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
