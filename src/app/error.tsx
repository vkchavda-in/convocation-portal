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
    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('loading chunk') ||
      msg.includes('chunkloaderror') ||
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('text/plain')
    ) {
      const lastReload = parseInt(sessionStorage.getItem('__chunk_reload_ts') || '0', 10);
      if (Date.now() - lastReload > 10000) {
        sessionStorage.setItem('__chunk_reload_ts', Date.now().toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-[#0A2540]">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Website Updated</h2>
      <p className="text-slate-600 mb-6 max-w-md text-sm leading-relaxed">
        A newer version of the page is available. Click below to load the updated content.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-[#0A2540] text-white rounded-lg font-medium shadow hover:bg-[#081d33] transition active:scale-95"
      >
        Refresh Page
      </button>
    </div>
  );
}
