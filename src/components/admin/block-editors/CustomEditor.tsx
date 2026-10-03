'use client';

import { useState, useEffect, useRef } from 'react';
import { Field, Input, Toggle } from './HeroEditor';

interface CustomData {
  title?: string;
  subtitle?: string;
  body: string;
  fullWidth?: boolean;
}

interface Props {
  data: object;
  onChange: (d: object) => void;
}

function CKEditorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const instanceRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      // 1. Load CKEditor
      if (!(window as any).CKEDITOR) {
        const script = document.createElement('script');
        script.src = 'https://cdn.ckeditor.com/4.22.1/full/ckeditor.js';
        document.body.appendChild(script);
        await new Promise((res) => {
          script.onload = res;
        });
      }

      // 2. Load Monaco Editor
      if (!(window as any).monaco) {
        if (!(window as any).require) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs/loader.min.js';
          document.body.appendChild(script);
          await new Promise((res) => {
            script.onload = res;
          });
        }

        (window as any).require.config({
          paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' },
        });

        await new Promise<void>((resolve) => {
          (window as any).require(['vs/editor/editor.main'], () => {
            resolve();
          });
        });
      }

      if (!active) return;

      const CKEDITOR = (window as any).CKEDITOR;
      if (!CKEDITOR || instanceRef.current || !textareaRef.current) return;

      const instance = CKEDITOR.replace(textareaRef.current, {
        customConfig: '',
        height: 200,
        allowedContent: true,
        extraAllowedContent: '*(*){*}[*]',
        versionCheck: false, // Disables the annoying upgrade to v5 warning notification popup
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

      // Integrate Monaco Editor dynamically inside CKEditor's Source view
      instance.on('mode', () => {
        const currentMode = instance.mode;
        
        if (currentMode === 'source') {
          const textarea = instance.editable().$;
          if (!textarea) return;

          // Hide default CKEditor plain textarea
          textarea.style.display = 'none';

          // Create Monaco container
          const container = document.createElement('div');
          container.className = 'monaco-source-editor';

          textarea.parentNode.insertBefore(container, textarea);

          const monacoInstance = (window as any).monaco;
          if (monacoInstance) {
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
    };

    load();

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

export default function CustomEditor({ data, onChange }: Props) {
  const d = data as CustomData;
  const set = (key: string, value: unknown) => onChange({ ...d, [key]: value });

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
    </div>
  );
}
