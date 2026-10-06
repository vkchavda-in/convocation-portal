'use client';

import React from 'react';
import { 
  Image as ImageIcon, FileText, Film, File as FileIcon, 
  Users, Camera, BadgeCheck, Building2, Star, Heart
} from 'lucide-react';

export interface MediaFolder {
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

export interface MediaItem {
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

export function FolderOverlayIcon({ name, x = 24, y = 23, width = 16, height = 16, className = "text-white" }: { name: string; x?: number; y?: number; width?: number; height?: number; className?: string }) {
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

export function WindowsFolderIcon({ color, icon, className = "w-14 h-12" }: { color: string; icon: string; className?: string }) {
  const isDefaultColor = color === '#2563EB';
  const folderColor = isDefaultColor ? '#EAB308' : color;
  
  return (
    <svg viewBox="0 0 64 52" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`shared-back-${folderColor.replace('#', '')}`} x1="0" y1="0" x2="64" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={folderColor} stopOpacity={0.88} />
          <stop offset="100%" stopColor={folderColor} stopOpacity={0.72} />
        </linearGradient>
        <linearGradient id={`shared-front-${folderColor.replace('#', '')}`} x1="0" y1="12" x2="64" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={folderColor} stopOpacity={1} />
          <stop offset="100%" stopColor={folderColor} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <path 
        d="M2 7C2 5.34315 3.34315 4 5 4H20.5C21.84 4 23.04 4.7 23.7 5.86L26.8 11.29C27.13 11.87 27.73 12.22 28.4 12.22H59C60.6569 12.22 62 13.5631 62 15.22V45C62 46.6569 60.6569 48 59 48H5C3.34315 48 2 46.6569 2 45V7Z" 
        fill={`url(#shared-back-${folderColor.replace('#', '')})`} 
      />
      {icon !== 'folder' && (
        <>
          <rect x="8" y="7.5" width="48" height="23" rx="2" fill="#FFFFFF" opacity="0.95" />
          <line x1="14" y1="12.5" x2="30" y2="12.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="16.5" x2="44" y2="16.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="20.5" x2="38" y2="20.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      <path 
        d="M2 15.5C2 13.567 3.567 12 5.5 12H58.5C60.433 12 62 13.567 62 15.5V45.5C62 47.433 60.433 49 57.5 49H6.5C4.567 49 2 47.433 2 45.5V15.5Z" 
        fill={`url(#shared-front-${folderColor.replace('#', '')})`}
      />
      <path 
        d="M5.5 12.5H58.5C59.3284 12.5 60 13.1716 60 14C60 14.8284 59.3284 15.5 58.5 15.5H5.5C4.67157 15.5 4 14.8284 4 14C4 13.1716 4.67157 12.5 5.5 12.5Z" 
        fill="#FFFFFF" 
        opacity="0.18" 
      />
      <FolderOverlayIcon name={icon} x={24} y={23} width={16} height={16} />
    </svg>
  );
}

export function FilePlaceholder({ mimeType, className = "w-full h-full" }: { mimeType: string; className?: string }) {
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

export interface CardStyleConfig {
  widthStyle: string;
  folderIconClass: string;
  fileThumbClass: string;
  textClass: string;
}

export function getCardStyleConfig(size: 'small' | 'medium' | 'large' | 'xl'): CardStyleConfig {
  switch (size) {
    case 'small':
      return {
        widthStyle: '44px',
        folderIconClass: 'w-10 h-8 mb-0.5 shrink-0',
        fileThumbClass: 'w-10 h-8 rounded-none overflow-hidden flex items-center justify-center relative mb-0.5 shrink-0',
        textClass: 'text-[9.5px]'
      };
    case 'medium':
      return {
        widthStyle: '68px',
        folderIconClass: 'w-16 h-13 mb-0.5 shrink-0',
        fileThumbClass: 'w-16 h-13 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow',
        textClass: 'text-[10px]'
      };
    case 'xl':
      return {
        widthStyle: '148px',
        folderIconClass: 'w-36 h-28 mb-0.5 shrink-0',
        fileThumbClass: 'w-36 h-28 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow',
        textClass: 'text-xs'
      };
    case 'large':
    default:
      return {
        widthStyle: '92px',
        folderIconClass: 'w-22 h-17 mb-0.5 shrink-0',
        fileThumbClass: 'w-22 h-17 rounded-none overflow-hidden flex items-center justify-center relative shrink-0 transition-shadow',
        textClass: 'text-[11px]'
      };
  }
}

interface FolderCardProps {
  folder: MediaFolder;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  onRenameChange?: (val: string) => void;
  onRenameBlur?: () => void;
  onRenameKeyDown?: (e: React.KeyboardEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggingId?: string | null;
  isDragOver?: boolean;
}

export function FolderCard({
  folder,
  isSelected,
  isRenaming,
  renameValue,
  size = 'large',
  onRenameChange,
  onRenameBlur,
  onRenameKeyDown,
  onClick,
  onDoubleClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggingId,
  isDragOver
}: FolderCardProps) {
  const config = getCardStyleConfig(size);

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group w-full flex flex-col items-center cursor-pointer select-none relative mb-1 border border-transparent rounded transition-all ${
        draggingId === folder.id ? 'opacity-30' : ''
      } ${
        isDragOver ? 'ring-2 ring-blue-500 bg-blue-100/70 scale-105 shadow-md z-10' : ''
      }`}
    >
      <WindowsFolderIcon color={folder.color} icon={folder.icon} className={config.folderIconClass} />
      <div className="w-full text-center mt-0.5 min-w-0 px-1">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={e => onRenameChange?.(e.target.value)}
            onBlur={onRenameBlur}
            onKeyDown={onRenameKeyDown}
            className="w-full text-center text-[10px] border border-blue-400 rounded px-0.5 py-0.5 focus:outline-none bg-white text-slate-800"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <p 
            className={`${config.textClass} font-normal leading-snug px-1.5 py-0.5 rounded-sm inline-block max-w-full break-all line-clamp-2 ${
              isSelected 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 group-hover:bg-slate-200/60'
            }`}
            title={folder.name}
          >
            {folder.name}
          </p>
        )}
      </div>
    </div>
  );
}

interface FileCardProps {
  file: MediaItem;
  isSelected: boolean;
  size?: 'small' | 'medium' | 'large' | 'xl';
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggingId?: string | null;
}

export function FileCard({
  file,
  isSelected,
  size = 'large',
  onClick,
  onDoubleClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggingId
}: FileCardProps) {
  const config = getCardStyleConfig(size);
  const isImg = file.mimeType.startsWith('image/');

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group w-full flex flex-col items-center cursor-pointer select-none relative border rounded transition-all mb-1 ${
        isSelected 
          ? 'bg-blue-100/50 border-blue-300/60 shadow-sm' 
          : 'border-transparent hover:bg-slate-100/60'
      } ${
        draggingId === file.id ? 'opacity-30' : ''
      }`}
    >
      <div className={`${config.fileThumbClass} flex items-center justify-center relative shrink-0`}>
        {isImg ? (
          <img src={file.updatedAt ? `${file.url}?t=${new Date(file.updatedAt).getTime()}` : file.url} alt={file.alt} className="max-w-full max-h-full object-contain" loading="lazy" />
        ) : (
          <FilePlaceholder mimeType={file.mimeType} className="max-w-full max-h-full" />
        )}
      </div>
      <div className="w-full text-center mt-0.5 min-w-0 px-1">
        <p 
          className={`${config.textClass} font-normal leading-snug px-1.5 py-0.5 max-w-full break-all line-clamp-2 text-slate-700 group-hover:text-slate-900`}
          title={file.originalName}
        >
          {file.originalName}
        </p>
      </div>
    </div>
  );
}
