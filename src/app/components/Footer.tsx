import Link from 'next/link';
import { Linkedin, Twitter, Youtube, Mail, MapPin } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';
import FooterSearch from './FooterSearch';

export default function Footer({ footerData }: { footerData?: any }) {
  const tagline = footerData?.tagline || '';
  const copyright = footerData?.copyright || '';
  const columns = footerData?.columns || [];
  const socials = footerData?.socials || [];
  const logoUrl = footerData?.logoUrl || '';
  const logoSize = footerData?.logoSize || 'md';
  const email = footerData?.email || 'convocation@ganpatuniversity.ac.in';
  const address = footerData?.address || 'Ganpat Vidyanagar, Mehsana-Gandhinagar Highway, PO - 384012';

  return (
    <footer className="relative select-none" style={{ backgroundColor: 'var(--abyss, #070F1A)' }}>
      {/* 3px gold to navy accent top bar */}
      <div 
        style={{ background: 'linear-gradient(to right, var(--gold, #f9c53c), var(--navy, #0B2545))' }} 
        className="h-[3px] w-full absolute top-0 left-0" 
      />

      <div className="section-container pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col gap-4">
            {logoUrl ? (
              <OptimizedImage
                src={logoUrl}
                alt="Footer Logo"
                className={`w-auto object-contain brightness-0 invert opacity-90 ${
                  logoSize === 'xs' ? 'h-6' :
                  logoSize === 'sm' ? 'h-8' :
                  logoSize === 'md' ? 'h-10' :
                  logoSize === 'lg' ? 'h-12' :
                  logoSize === 'xl' ? 'h-14' : 'h-16'
                }`}
              />
            ) : (
              <h3 className="mb-2 text-xl font-bold font-serif tracking-wider" style={{ color: 'var(--gold, #f9c53c)' }}>
                19th Convocation
              </h3>
            )}
            <p className="text-white/55 leading-relaxed text-xs max-w-xs">
              {tagline}
            </p>
          </div>

          {/* Columns 2 & 3: Dynamic Links */}
          {columns.map((col: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-4">
              <h4 className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link: any, lidx: number) => (
                  <li key={lidx}>
                    <Link 
                      href={link.href} 
                      className="text-white/65 hover:text-[var(--gold,#f9c53c)] transition-colors text-xs font-semibold uppercase tracking-wider"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4: Office Search & Contact info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">Office</h4>
            
            {/* Site Search */}
            <div className="mb-2">
              <FooterSearch />
            </div>

            {/* Address & Email */}
            <address className="not-italic space-y-3">
              <div className="flex items-start gap-2 text-white/55 text-xs leading-relaxed">
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--gold, #f9c53c)' }} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2 text-white/55 text-xs">
                <Mail size={14} className="shrink-0" style={{ color: 'var(--gold, #f9c53c)' }} />
                <a href={`mailto:${email}`} className="hover:text-[var(--gold,#f9c53c)] transition-colors">
                  {email}
                </a>
              </div>
            </address>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="flex space-x-4 mt-2">
                {socials.map((social: any, idx: number) => {
                  let Icon = Mail;
                  if (social.platform === 'linkedin') Icon = Linkedin;
                  if (social.platform === 'twitter') Icon = Twitter;
                  if (social.platform === 'youtube') Icon = Youtube;
                  return (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-white/50 hover:text-[var(--gold,#f9c53c)] transition-colors"
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs font-medium tracking-wide">
            {copyright}
          </p>
          <div className="flex items-center gap-4 text-white/35 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
