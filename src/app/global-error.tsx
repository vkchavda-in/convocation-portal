'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 font-sans">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 text-[#0A2540]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Portal Updated</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            The convocation portal has been updated with the latest schedule and content. Please click refresh to view the latest version.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-[#0A2540] text-white rounded-xl font-medium shadow hover:bg-[#081d33] transition active:scale-[0.99]"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
