'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  UploadCloud,
  FileUp,
  FolderPlus,
  Trash2,
  Copy,
  X,
} from 'lucide-react';

export interface EnhancedToastOptions {
  description?: React.ReactNode;
  duration?: number;
  id?: string | number;
  style?: React.CSSProperties;
  className?: string;
  icon?: React.ReactNode;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading' | 'upload' | 'delete' | 'file' | 'folder' | 'copy' | 'custom';
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  duration: number;
  createdAt: number;
}

// Global Event Listener System
type Listener = (toasts: ToastItem[]) => void;
let listeners: Listener[] = [];
let memoryToasts: ToastItem[] = [];

function notify() {
  listeners.forEach((l) => l([...memoryToasts]));
}

function addToast(item: Omit<ToastItem, 'id' | 'createdAt'> & { id?: string | number }): string {
  const id = item.id ? String(item.id) : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const existingIdx = memoryToasts.findIndex((t) => t.id === id);
  
  const newItem: ToastItem = {
    ...item,
    id,
    duration: item.duration ?? (item.type === 'error' ? 4500 : item.type === 'loading' || item.type === 'upload' ? Infinity : 3500),
    createdAt: Date.now(),
  };

  if (existingIdx !== -1) {
    memoryToasts[existingIdx] = newItem;
  } else {
    // Newest at index 0
    memoryToasts = [newItem, ...memoryToasts].slice(0, 10);
  }

  notify();
  return id;
}

function removeToast(id: string | number) {
  const sId = String(id);
  memoryToasts = memoryToasts.filter((t) => t.id !== sId);
  notify();
}

// Toast API
export const toast = {
  success: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'success',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  error: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'error',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      duration: opts?.duration ?? 4500,
      id: opts?.id,
    }),

  info: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'info',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  warning: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'warning',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      duration: opts?.duration ?? 4000,
      id: opts?.id,
    }),

  warn: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'warning',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      duration: opts?.duration ?? 4000,
      id: opts?.id,
    }),

  loading: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'loading',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />,
      duration: opts?.duration ?? Infinity,
      id: opts?.id,
    }),

  upload: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'upload',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <UploadCloud className="w-5 h-5 text-blue-400 animate-pulse shrink-0" />,
      duration: opts?.duration ?? Infinity,
      id: opts?.id,
    }),

  delete: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'delete',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <Trash2 className="w-5 h-5 text-slate-300 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  file: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'file',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <FileUp className="w-5 h-5 text-indigo-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  folder: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'folder',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <FolderPlus className="w-5 h-5 text-emerald-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  copy: (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'copy',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <Copy className="w-4.5 h-4.5 text-emerald-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),

  dismiss: (id: string | number) => removeToast(id),
  custom: (render: (id: string) => React.ReactNode, opts?: EnhancedToastOptions) => {
    const id = opts?.id ? String(opts.id) : `toast-${Date.now()}`;
    return addToast({
      type: 'custom',
      title: render(id),
      description: opts?.description,
      icon: opts?.icon,
      duration: opts?.duration,
      id,
    });
  },
};

// Callable default export e.g. toast('Message')
const callableToast = Object.assign(
  (title: React.ReactNode, opts?: EnhancedToastOptions) =>
    addToast({
      type: 'info',
      title,
      description: opts?.description,
      icon: opts?.icon ?? <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      duration: opts?.duration,
      id: opts?.id,
    }),
  toast
);

export default function AdminToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).toast = callableToast;
      (window as any).__toast = callableToast;
    }
  }, []);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => {
      setToasts(updated);
    };
    listeners.push(handleUpdate);
    setToasts([...memoryToasts]);
    return () => {
      listeners = listeners.filter((l) => l !== handleUpdate);
    };
  }, []);

  // Auto-dismiss timers
  useEffect(() => {
    if (isHovered) return; // Pause auto-dismiss when hovering the stack

    const intervals = toasts.map((t) => {
      if (t.duration === Infinity) return null;
      const elapsed = Date.now() - t.createdAt;
      const remaining = Math.max(0, t.duration - elapsed);
      return setTimeout(() => {
        removeToast(t.id);
      }, remaining);
    });

    return () => {
      intervals.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [toasts, isHovered]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-[99999999] pointer-events-auto select-none font-sans"
      style={{ width: '340px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full">
        {toasts.slice(0, 4).map((t, index) => {
          // Stacking calculations:
          // index 0 is newest (front)
          // index 1 is 2nd (tucked behind, slightly smaller scale)
          // index 2 is 3rd (tucked behind, even smaller scale)
          const isFront = index === 0;

          // When stacked (not hovered):
          const stackedOffsetY = index * -12; // -0px, -12px, -24px
          const stackedScale = 1 - index * 0.05; // 1, 0.95, 0.90
          const stackedOpacity = index === 0 ? 1 : index === 1 ? 0.92 : index === 2 ? 0.8 : 0;

          // When hovered (expanded stack):
          const expandedOffsetY = index * -62; // -0px, -62px, -124px
          const expandedScale = 1;
          const expandedOpacity = 1;

          const translateY = isHovered ? expandedOffsetY : stackedOffsetY;
          const scale = isHovered ? expandedScale : stackedScale;
          const opacity = isHovered ? expandedOpacity : stackedOpacity;
          const zIndex = 50 - index;

          return (
            <div
              key={t.id}
              className="absolute bottom-0 left-0 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              style={{
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                transformOrigin: 'bottom center',
                zIndex,
                opacity,
                pointerEvents: isHovered || isFront ? 'auto' : 'none',
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium shadow-2xl transition-all duration-200 border border-white/10"
                style={{
                  background: '#323232',
                  color: '#f1f3f4',
                  boxShadow: isFront
                    ? '0 12px 30px -5px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.3)'
                    : '0 6px 16px -2px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Icon */}
                {t.icon && (
                  <div className="shrink-0 flex items-center justify-center">
                    {t.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col min-w-0 flex-1 text-left justify-center pr-1">
                  <div className="leading-snug truncate text-slate-100 font-medium">
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="font-normal text-[11px] text-slate-400 leading-snug mt-0.5">
                      {t.description}
                    </div>
                  )}
                </div>

                {/* Close Button (visible on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(t.id);
                  }}
                  className="shrink-0 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
