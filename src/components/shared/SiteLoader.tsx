'use client';

import { useState, useEffect } from 'react';

export default function SiteLoader() {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleReady = () => {
      // Small buffer to ensure fonts, layout measurements and canvas scales have settled
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setDestroyed(true);
        }, 400); // match fade duration
      }, 250);
    };

    if (document.readyState === 'complete') {
      handleReady();
    } else {
      window.addEventListener('load', handleReady);
      return () => window.removeEventListener('load', handleReady);
    }
  }, []);

  if (destroyed) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999999] bg-white flex flex-col items-center justify-center select-none transition-opacity duration-400 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#ffffff',
      }}
    >
      {/* Simple, Pure Elegant Dual Spinner */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
        {/* Outer Navy Ring */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-[#0A2540] animate-spin"
          style={{ animationDuration: '0.85s' }}
        />
        {/* Inner Golden Ring */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[2.5px] border-amber-100 border-t-[#f9c53c] animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.1s' }}
        />
      </div>

      {/* Subtle Convocation Brand Label */}
      <div className="mt-5 text-center">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#0A2540]/60 block font-sans">
          Ganpat University
        </span>
      </div>
    </div>
  );
}
