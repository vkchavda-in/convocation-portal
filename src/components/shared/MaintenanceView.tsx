'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Cog, Settings, Hammer, Code, Terminal, ArrowLeft, Mail, ShieldAlert } from 'lucide-react';

interface MaintenanceViewProps {
  pageTitle: string;
  isHome?: boolean;
  message?: string;
}

const ICONS = [Wrench, Cog, Settings, Hammer, Code, Terminal];

export default function MaintenanceView({ pageTitle, isHome = false, message }: MaintenanceViewProps) {
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = ICONS[iconIndex];
  const isGear = ActiveIcon === Cog || ActiveIcon === Settings;

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] text-[#1E293B] px-6 py-20 overflow-hidden select-none border-b border-slate-200/55">
      {/* Self-contained CSS for icon float and spin effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes spinCog {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes iconFadeIn {
          from { opacity: 0; transform: scale(0.8) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-float-icon {
          animation: floatIcon 3s ease-in-out infinite;
        }
        .animate-spin-cog {
          animation: spinCog 10s linear infinite;
        }
        .animate-icon-fade {
          animation: iconFadeIn 0.25s ease-out forwards;
        }
      `}} />

      {/* Background radial glow & grid patterns (light mode optimized) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[var(--royal-blue)]/5 to-[var(--secondary)]/10 rounded-full blur-[120px] opacity-70 animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.4]" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center justify-center">
        {/* Warning Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
          <ShieldAlert size={12} />
          <span>Under Maintenance</span>
        </div>

        {/* Bouncing/Floating Animated Icon Container */}
        <div
          className={`inline-flex items-center justify-center w-24 h-24 mb-1 relative overflow-hidden ${
            isGear ? '' : 'animate-float-icon'
          }`}
        >
          <div
            key={iconIndex}
            className="absolute inset-0 flex items-center justify-center animate-icon-fade"
          >
            <div className={`flex items-center justify-center ${isGear ? 'animate-spin-cog' : ''}`}>
              <ActiveIcon className="w-16 h-16 text-[var(--royal-blue)]" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold font-serif mb-4 tracking-tight leading-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-heading)' }}>
          {message ? 'Site Maintenance' : 'Updating Page'}
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          {message || (
            <>
              The <span className="font-semibold text-[#0F172A]">"{pageTitle}"</span> page is currently undergoing maintenance and upgrades. We are refining our systems to serve you better.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {!isHome && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all text-slate-600 hover:text-slate-800 w-full sm:w-auto justify-center"
            >
              <ArrowLeft size={14} />
              Return Home
            </Link>
          )}

          <a
            href="mailto:convocation@ganpatuniversity.ac.in"
            className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-lg text-white bg-gradient-to-r from-[var(--royal-blue)] to-[var(--secondary)] hover:opacity-95 transition-all shadow-md w-full sm:w-auto justify-center"
          >
            <Mail size={14} />
            Contact Convocation Cell
          </a>
        </div>
      </div>
    </div>
  );
}
