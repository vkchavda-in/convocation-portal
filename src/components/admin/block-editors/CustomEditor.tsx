'use client';

import { useState, useEffect, useRef } from 'react';
import { Field, Input, Toggle, Select } from './HeroEditor';
import MediaPicker from '../MediaPicker';
import { Trash, Plus, RefreshCw } from 'lucide-react';


interface CustomData {
  title?: string;
  subtitle?: string;
  body: string;
  fullWidth?: boolean;
  titleAlignment?: string;
  images?: Record<string, string>;
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

// Global singleton script loader for CKEditor
let ckeditorLoadPromise: Promise<any> | null = null;
function loadCKEditor(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if ((window as any).CKEDITOR) return Promise.resolve((window as any).CKEDITOR);
  if (ckeditorLoadPromise) return ckeditorLoadPromise;

  ckeditorLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src*="ckeditor.js"]');
    if (existing && (window as any).CKEDITOR) {
      resolve((window as any).CKEDITOR);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.ckeditor.com/4.22.1/full/ckeditor.js';
    script.async = true;
    script.onload = () => {
      resolve((window as any).CKEDITOR);
    };
    script.onerror = () => {
      const fallback = document.createElement('script');
      fallback.src = 'https://cdn.jsdelivr.net/npm/ckeditor4@4.22.1/ckeditor.js';
      fallback.onload = () => resolve((window as any).CKEDITOR);
      document.body.appendChild(fallback);
    };
    document.body.appendChild(script);
  });

  return ckeditorLoadPromise;
}

export function CKEditorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const instanceRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uniqueIdRef = useRef<string>(`cke_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let active = true;

    loadCKEditor().then((CKEDITOR) => {
      if (!active || !textareaRef.current || !CKEDITOR) return;

      const elemId = uniqueIdRef.current;
      textareaRef.current.id = elemId;

      // Clean up previous instance for this ID if it exists
      if (CKEDITOR.instances && CKEDITOR.instances[elemId]) {
        try {
          CKEDITOR.instances[elemId].destroy(true);
        } catch (e) {}
      }

      const instance = CKEDITOR.replace(elemId, {
        customConfig: '',
        height: 200,
        allowedContent: true,
        extraAllowedContent: '*(*){*}[*]',
        versionCheck: false, // Disables the upgrade to v5 warning notification popup
        removePlugins: 'elementspath',
        resize_enabled: false,
        toolbar: [
          ['Source', '-', 'Preview', 'Print'],
          ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
          ['Find', 'Replace', '-', 'SelectAll', 'Scayt'],
          ['Link', 'Unlink', 'Anchor'],
          ['Image', 'Table', 'HorizontalRule', 'SpecialChar', 'Iframe'],
          ['Maximize', 'ShowBlocks'],
          '/',
          ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
          ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
          ['Styles', 'Format', 'Font', 'FontSize'],
          ['TextColor', 'BGColor'],
          ['About']
        ],
      });

      instance.on('instanceReady', () => {
        if (instance.container && instance.container.$) {
          const links = instance.container.$.querySelectorAll('a.cke_button, a.cke_combo_button');
          links.forEach((link: any) => {
            link.setAttribute('href', 'javascript:void(0)');
          });
        }
      });

      instance.on('maximize', (evt: any) => {
        if (instance.container && instance.container.$) {
          const container = instance.container.$;
          if (evt.data === 1) {
            container.classList.add('cke_is_maximized');
          } else {
            container.classList.remove('cke_is_maximized');
          }
        }
      });

      // Integrate Monaco Editor dynamically inside CKEditor's Source view on demand
      instance.on('mode', () => {
        const currentMode = instance.mode;
        
        if (currentMode === 'source') {
          const textarea = instance.editable() && instance.editable().$;
          if (!textarea) return;

          const initMonaco = () => {
            const monacoInstance = (window as any).monaco;
            if (monacoInstance && instance.mode === 'source') {
              textarea.style.display = 'none';

              const container = document.createElement('div');
              container.className = 'monaco-source-editor';
              textarea.parentNode.insertBefore(container, textarea);

              const editor = monacoInstance.editor.create(container, {
                value: textarea.value || '',
                language: 'html',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: {
                  top: 8,
                  bottom: 8
                }
              });

              editor.onDidChangeModelContent(() => {
                textarea.value = editor.getValue();
                if (active) {
                  onChange(editor.getValue());
                }
              });

              (instance as any)._monacoEditor = editor;
              (instance as any)._monacoContainer = container;
            }
          };

          if ((window as any).monaco) {
            initMonaco();
          } else {
            // Lazy load Monaco in the background if user enters source mode
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/loader.min.js';
            script.onload = () => {
              if ((window as any).require) {
                try {
                  (window as any).require.config({
                    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' },
                  });
                  (window as any).require(['vs/editor/editor.main'], () => {
                    initMonaco();
                  });
                } catch (e) {}
              }
            };
            document.body.appendChild(script);
          }
        } else {
          // WYSIWYG mode activated - clean up Monaco
          const editor = (instance as any)._monacoEditor;
          const container = (instance as any)._monacoContainer;

          if (editor) {
            editor.dispose();
            (instance as any)._monacoEditor = null;
          }
          if (container) {
            container.remove();
            (instance as any)._monacoContainer = null;
          }
        }
      });

      instance.setData(value || '');
      instance.on('change', () => {
        if (active) {
          onChange(instance.getData());
        }
      });

      instanceRef.current = instance;
    });

    return () => {
      active = false;
      if (instanceRef.current) {
        try {
          const editor = (instanceRef.current as any)._monacoEditor;
          const container = (instanceRef.current as any)._monacoContainer;
          if (editor) {
            editor.dispose();
          }
          if (container) {
            container.remove();
          }
          instanceRef.current.destroy();
        } catch (e) {
          console.error('Failed to destroy CKEditor instance:', e);
        }
        instanceRef.current = null;
      }
    };
  }, []);

  // Sync value from parent component (wysiwyg mode only to prevent cursor jumps)
  useEffect(() => {
    if (instanceRef.current && instanceRef.current.mode === 'wysiwyg' && instanceRef.current.getData() !== value) {
      instanceRef.current.setData(value || '');
    }
  }, [value]);

  return (
    <>
      <style>{`
        /* Compact CKEditor Toolbar Styling */
        .cke_chrome {
          border: none !important;
          box-shadow: none !important;
        }
        .cke_top {
          padding: 4px 6px !important;
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .cke_contents {
          position: relative !important;
        }
        
        /* Monaco Integration Layout */
        .monaco-source-editor {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 10 !important;
        }
        
        /* Bottom status bar responsive behavior */
        .cke_chrome:not(.cke_is_maximized) .cke_bottom {
          display: none !important;
        }
        .cke_chrome.cke_is_maximized .cke_bottom {
          display: block !important;
          background: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
        }
        .cke_path_item, .cke_path_empty {
          font-size: 10px !important;
          color: #64748b !important;
        }

        /* Hide advanced controls and breaks in compact mode */
        .cke_chrome:not(.cke_is_maximized) .cke_button__preview,
        .cke_chrome:not(.cke_is_maximized) .cke_button__print,
        .cke_chrome:not(.cke_is_maximized) .cke_button__cut,
        .cke_chrome:not(.cke_is_maximized) .cke_button__copy,
        .cke_chrome:not(.cke_is_maximized) .cke_button__paste,
        .cke_chrome:not(.cke_is_maximized) .cke_button__pastetext,
        .cke_chrome:not(.cke_is_maximized) .cke_button__pastefromword,
        .cke_chrome:not(.cke_is_maximized) .cke_button__undo,
        .cke_chrome:not(.cke_is_maximized) .cke_button__redo,
        .cke_chrome:not(.cke_is_maximized) .cke_button__find,
        .cke_chrome:not(.cke_is_maximized) .cke_button__replace,
        .cke_chrome:not(.cke_is_maximized) .cke_button__selectall,
        .cke_chrome:not(.cke_is_maximized) .cke_button__scayt,
        .cke_chrome:not(.cke_is_maximized) .cke_button__anchor,
        .cke_chrome:not(.cke_is_maximized) .cke_button__specialchar,
        .cke_chrome:not(.cke_is_maximized) .cke_button__iframe,
        .cke_chrome:not(.cke_is_maximized) .cke_button__showblocks,
        .cke_chrome:not(.cke_is_maximized) .cke_button__strike,
        .cke_chrome:not(.cke_is_maximized) .cke_button__subscript,
        .cke_chrome:not(.cke_is_maximized) .cke_button__superscript,
        .cke_chrome:not(.cke_is_maximized) .cke_button__copyformatting,
        .cke_chrome:not(.cke_is_maximized) .cke_button__blockquote,
        .cke_chrome:not(.cke_is_maximized) .cke_button__creatediv,
        .cke_chrome:not(.cke_is_maximized) .cke_combo__styles,
        .cke_chrome:not(.cke_is_maximized) .cke_combo__font,
        .cke_chrome:not(.cke_is_maximized) .cke_combo__fontsize,
        .cke_chrome:not(.cke_is_maximized) .cke_button__textcolor,
        .cke_chrome:not(.cke_is_maximized) .cke_button__bgcolor,
        .cke_chrome:not(.cke_is_maximized) .cke_button__about,
        .cke_chrome:not(.cke_is_maximized) .cke_toolbar_separator,
        .cke_chrome:not(.cke_is_maximized) .cke_break {
          display: none !important;
        }

        .cke_toolgroup {
          margin: 2px 3px 2px 0 !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          border-radius: 4px !important;
          box-shadow: none !important;
        }
        .cke_button {
          padding: 2px 3px !important;
          border-radius: 4px !important;
          border: 1px solid transparent !important;
          background: transparent !important;
          transition: background-color 0.1s, border-color 0.1s !important;
        }
        .cke_button_icon {
          transform: scale(0.85);
        }
        .cke_combo {
          margin: 2px 3px 2px 0 !important;
        }
        .cke_combo_button {
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          border-radius: 4px !important;
          box-shadow: none !important;
          height: 22px !important;
          padding: 1px 4px !important;
          transition: background-color 0.1s, border-color 0.1s !important;
        }
        
        /* Microsoft Word style hover & active states - prevents layout shifts */
        .cke_button:hover, 
        .cke_button.cke_button_hover,
        .cke_combo_button:hover,
        .cke_combo_button.cke_combo_hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        .cke_combo_button:active, 
        .cke_button:active,
        .cke_button.cke_button_on {
          background: #e2e8f0 !important;
          border-color: #cbd5e1 !important;
        }
        .cke_button_on {
          background: #e2e8f0 !important;
          border-color: #cbd5e1 !important;
        }
        
        .cke_combo_text {
          font-size: 11px !important;
          line-height: 20px !important;
          color: #475569 !important;
        }
        .cke_combo_open {
          border-left: 1px solid #e2e8f0 !important;
        }
      `}</style>
      <textarea ref={textareaRef} defaultValue={value} className="w-full" />
    </>
  );
}

function autoDetectImages(htmlBody: string, currentImages: Record<string, string>) {
  let updatedBody = htmlBody;
  const newImages = { ...currentImages };
  let changed = false;

  // 1. Find all image URLs from <img> tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  const detectedUrls = new Set<string>();

  while ((match = imgRegex.exec(htmlBody)) !== null) {
    const url = match[1];
    // Ignore placeholders like {{ placeholder }}
    if (url && !url.startsWith('{{') && !url.endsWith('}}')) {
      detectedUrls.add(url);
    }
  }

  // 2. Find all background image URLs from inline styles / CSS
  const bgRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
  while ((match = bgRegex.exec(htmlBody)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('{{') && !url.endsWith('}}')) {
      detectedUrls.add(url);
    }
  }

  // 3. Map detected URLs
  if (detectedUrls.size > 0) {
    // Helper to check if a URL is already in currentImages
    const getExistingKey = (url: string) => {
      return Object.entries(newImages).find(([_, val]) => val === url)?.[0];
    };

    let imgCounter = 1;
    detectedUrls.forEach((url) => {
      let key = getExistingKey(url);
      if (!key) {
        // Find a unique name
        while (true) {
          const testKey = `Image ${imgCounter}`;
          if (!newImages[testKey]) {
            key = testKey;
            break;
          }
          imgCounter++;
        }
        newImages[key] = url;
        changed = true;
      }

      // Replace all occurrences of this raw URL with the placeholder {{ key }}
      if (updatedBody.includes(url)) {
        updatedBody = updatedBody.split(url).join(`{{ ${key} }}`);
        changed = true;
      }
    });
  }

  return { updatedBody, newImages, changed };
}

export default function CustomEditor({ data, onChange }: Props) {
  const d = data as CustomData;
  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
  const [newImageKey, setNewImageKey] = useState('');

  // Auto-detect images on load to convert any existing hardcoded URLs to placeholders
  useEffect(() => {
    const { updatedBody, newImages, changed } = autoDetectImages(d.body || '', d.images || {});
    if (changed) {
      onChange({
        ...d,
        body: updatedBody,
        images: newImages
      });
    }
  }, []);

  const handleAutoDetect = () => {
    const { updatedBody, newImages, changed } = autoDetectImages(d.body || '', d.images || {});
    if (changed) {
      onChange({
        ...d,
        body: updatedBody,
        images: newImages
      });
      alert("Successfully scanned HTML and converted images to fields!");
    } else {
      alert("No new hardcoded images found in the HTML.");
    }
  };

  const handleAddImageKey = () => {
    if (!newImageKey.trim()) return;
    const key = newImageKey.trim();
    const currentImages = d.images || {};
    if (key in currentImages) {
      alert("An image field with this label already exists!");
      return;
    }
    const newImages = { ...currentImages, [key]: '' };
    set('images', newImages);
    setNewImageKey('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Title */}
      <Field label="Section Title">
        <Input value={d.title || ''} onChange={(v) => set('title', v)} placeholder="e.g. Center Objectives" />
      </Field>

      {/* 2. Subtitle */}
      <Field label="Section Subtitle / Category Label">
        <Input value={d.subtitle || ''} onChange={(v) => set('subtitle', v)} placeholder="e.g. ACCREDITATION" />
      </Field>

      {/* Title Alignment */}
      <Field label="Title Alignment">
        <Select
          value={d.titleAlignment || 'center'}
          onChange={(v) => set('titleAlignment', v)}
          options={[
            { value: 'center', label: 'Center (Default)' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Field>

      {/* 3. Full Width Toggle */}
      <div className="flex items-center gap-2 pt-2">
        <Toggle checked={d.fullWidth === true} onChange={(v) => set('fullWidth', v)} />
        <span className="text-xs text-slate-600">Full Width Content Layout (No Max Width Margin)</span>
      </div>

      {/* 4. CKEditor Body */}
      <Field label="Rich Text Content" required>
        <div className="border border-slate-200 rounded overflow-hidden mt-1 bg-white">
          <CKEditorField value={d.body || ''} onChange={(v) => set('body', v)} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Use the <strong className="font-semibold text-slate-600">Source</strong> button in the editor toolbar to edit raw HTML or paste custom embed codes in Monaco Editor.
        </p>
      </Field>

      {/* 5. Dynamic Image Fields (Generic Inputs at the bottom of CKEditor) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dynamic Images</span>
          <button
            type="button"
            onClick={handleAutoDetect}
            className="inline-flex items-center gap-1 bg-transparent hover:text-slate-800 text-slate-500 transition-colors font-semibold text-[11px] border-0 p-0 shadow-none focus:outline-none"
            title="Scan HTML body and auto-create image fields"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            Sync Images from HTML
          </button>
        </div>

        {d.images && typeof d.images === 'object' && Object.keys(d.images).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(d.images).map(([key, value]) => (
              <Field key={key} label={key}>
                <div className="flex gap-3 mt-1 items-center">
                  {/* Image Preview Thumbnail */}
                  {value && (value.startsWith('/') || value.startsWith('http')) ? (
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                      <img
                        src={value}
                        alt={key}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg border border-dashed border-slate-200 flex-shrink-0 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                      No Img
                    </div>
                  )}

                  <div className="flex-1 flex gap-2">
                    <Input
                      value={value || ''}
                      onChange={(newVal) => {
                        const newImages = { ...d.images, [key]: newVal };
                        set('images', newImages);
                      }}
                      placeholder="e.g. /uploads/image.png"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveImageKey(key)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap border border-slate-200 shadow-sm transition-colors"
                    >
                      Browse
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = { ...d.images };
                        delete newImages[key];
                        set('images', newImages);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200/60"
                      title="Delete Image Placeholder"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Field>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No dynamic images mapped. Click "Sync Images from HTML" to scan body content.</p>
        )}
      </div>

      {/* Media Picker Modal */}
      {activeImageKey !== null && (
        <MediaPicker
          currentUrl={activeImageKey !== null ? d.images?.[activeImageKey] : undefined}
          onSelect={(url) => {
            const newImages = { ...d.images, [activeImageKey]: url };
            set('images', newImages);
            setActiveImageKey(null);
          }}
          onClose={() => setActiveImageKey(null)}
          filter="image"
        />
      )}
    </div>
  );
}
