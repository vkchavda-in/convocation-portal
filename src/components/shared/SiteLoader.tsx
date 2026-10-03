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
      {/* Single Clean Spinner */}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-slate-100 border-t-[#0A2540] animate-spin"
        style={{ animationDuration: '0.8s' }}
      />
    </div>
  );
}
