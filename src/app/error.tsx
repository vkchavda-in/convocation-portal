'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RootErrorBoundary] Caught error:', error);
    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('loading chunk') ||
      msg.includes('chunkloaderror') ||
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('text/plain')
    ) {
      const lastReload = parseInt(sessionStorage.getItem('__chunk_reload_ts') || '0', 10);
      if (Date.now() - lastReload > 8000) {
        sessionStorage.setItem('__chunk_reload_ts', Date.now().toString());
        window.location.href = window.location.pathname + '?_v=' + Date.now();
      }
    }
  }, [error]);

  const handleHardRefresh = () => {
    sessionStorage.removeItem('__chunk_reload_ts');
    window.location.href = window.location.pathname + '?_v=' + Date.now();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-[#0A2540] border border-slate-200 shadow-sm">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Website Updated</h2>
      <p className="text-slate-600 mb-6 max-w-md text-sm leading-relaxed">
        A new version of the website has been deployed. Click below to load the updated content.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleHardRefresh}
          className="px-6 py-2.5 bg-[#0A2540] hover:bg-[#071b30] text-white rounded-xl font-medium shadow-sm transition active:scale-95 text-sm"
        >
          Refresh Page
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition active:scale-95 text-sm"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
