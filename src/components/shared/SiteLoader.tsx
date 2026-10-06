'use client';

import { useState, useEffect } from 'react';

export default function SiteLoader() {
  const [fading, setFading] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    let destroyTimer: NodeJS.Timeout;
    let safetyTimer: NodeJS.Timeout;

    const dismiss = () => {
      setFading(true);
      destroyTimer = setTimeout(() => {
        setDestroyed(true);
      }, 300);
    };

    const handleReady = () => {
      fadeTimer = setTimeout(dismiss, 120);
    };

    // Safety fallback: NEVER keep the loader visible for more than 1000ms under any circumstances
    safetyTimer = setTimeout(dismiss, 1000);

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      handleReady();
    } else {
      window.addEventListener('load', handleReady, { once: true });
      window.addEventListener('DOMContentLoaded', handleReady, { once: true });
    }

    // Dismiss immediately on user touch/click/scroll
    const handleInteract = () => dismiss();
    window.addEventListener('pointerdown', handleInteract, { once: true, passive: true });
    window.addEventListener('scroll', handleInteract, { once: true, passive: true });

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
      clearTimeout(safetyTimer);
      window.removeEventListener('load', handleReady);
      window.removeEventListener('DOMContentLoaded', handleReady);
      window.removeEventListener('pointerdown', handleInteract);
      window.removeEventListener('scroll', handleInteract);
    };
  }, []);

  if (destroyed) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999999] bg-white flex flex-col items-center justify-center select-none transition-opacity duration-300 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#ffffff',
      }}
    >
      {/* Single Clean Spinner */}
      <div
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-[3px] border-slate-100 border-t-[#0A2540] animate-spin"
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
}

