'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Mail, Clock, Facebook, Twitter, Linkedin, ChevronDown, Phone } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';

export default function Navbar({ headerData, appSettings }: { headerData?: any; appSettings?: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileLink, setExpandedMobileLink] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Store scroll position before locking so we can restore it on close
  const scrollYRef = useRef(0);
  const navigatedRef = useRef(false);

  // Scrolled shadow state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      navigatedRef.current = true;
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (navigatedRef.current) {
        window.scrollTo(0, 0);
        navigatedRef.current = false;
      } else {
        window.scrollTo(0, scrollYRef.current);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  const rawNavLinks = headerData?.navLinks || [];
  const navLinks = rawNavLinks.filter((link: any) => {
    const label = (link.label || '').toLowerCase();
    return label !== 'contact' && label !== 'contact us';
  });
  const siteName = headerData?.siteName || '';
  const logoUrl = headerData?.logoUrl || '';
  const subheading = headerData?.subheading || 'Ganpat University';
  const rawCtaLabel = headerData?.ctaLabel || 'Contact Us';
  const ctaLabel = (rawCtaLabel === 'Attendees Info' || rawCtaLabel === 'Invitation for Attendees' || rawCtaLabel === 'Inquire Now' || !rawCtaLabel) 
    ? 'Contact Us' 
    : rawCtaLabel;
  const ctaUrl = ctaLabel === 'Contact Us' ? '/contact' : (headerData?.ctaUrl || '/contact');

  const contact = headerData?.contact || {
    email: 'convocation@ganpatuniversity.ac.in',
    phone: '+91 2762 226000',
    workingHours: '9:00 AM – 4:00 PM',
    address: 'Ganpat Vidyanagar, Mehsana-Gandhinagar Highway, PO - 384012'
  };

  const socials = headerData?.socials || {
    facebook: 'https://www.facebook.com/ganpatuni',
    twitter: 'https://twitter.com/Ganpat_Uni',
    linkedin: 'https://www.linkedin.com/school/ganpat-university/'
  };

  // Top Bar configuration
  const topBarEnabled = appSettings?.topBarEnabled ?? true;
  const topBarType = appSettings?.topBarType ?? 'marquee';
  const topBarEmail = appSettings?.topBarEmail || contact.email;
  const topBarPhone = appSettings?.topBarPhone || contact.phone;
  const topBarAddress = appSettings?.topBarAddress || contact.address;
  const topBarWorkingHours = appSettings?.topBarWorkingHours || contact.workingHours;
  const topBarLinks = appSettings?.topBarLinks || [
    { label: 'Watch Live Webcast', url: 'https://convocation.guni.ac.in/live' }
  ];
  const marqueeItems = (appSettings?.topBarMarqueeItems && appSettings.topBarMarqueeItems.length > 0)
    ? appSettings.topBarMarqueeItems
    : [
        { text: '19th Convocation Ceremony – Registrations & Schedule Live!', badge: 'Important Update', link: '/schedule-for-gold-medalists-and-phd-awardees' },
        { text: 'Watch Live Webcast of the 19th Convocation', badge: 'Live Stream', link: '/#live-stream' }
      ];
  
  // Resolve logo size in pixels
  const logoSize = headerData?.logoSize || 'md';
  let logoHeightClass = 'h-10'; // default
  if (logoSize === 'xs') logoHeightClass = 'h-6 sm:h-7';
  else if (logoSize === 'sm') logoHeightClass = 'h-8 sm:h-9';
  else if (logoSize === 'md') logoHeightClass = 'h-10 sm:h-11';
  else if (logoSize === 'lg') logoHeightClass = 'h-12 sm:h-13';
  else if (logoSize === 'xl') logoHeightClass = 'h-14 sm:h-15';
  else if (logoSize === 'xxl') logoHeightClass = 'h-16 sm:h-17';

  const renderLink = (href: string, label: string, className: string, onClick?: () => void, key?: string | number) => {
    const isExternalOrPdf = href.startsWith('http') || href.endsWith('.pdf');
    if (isExternalOrPdf) {
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onClick}
        >
          {label}
        </a>
      );
    }
    return (
      <Link key={key} href={href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Top Info Bar */}
      {topBarEnabled && (
        topBarType === 'marquee' ? (
          <div
            className="flex text-white/90 text-[11.5px] font-normal py-2 px-6 lg:px-12 justify-between items-center gap-4 w-full select-none shrink-0"
            style={{
              background: 'var(--navy-dark, #08172D)',
              borderBottom: '1px solid rgba(200, 158, 76, 0.25)',
            }}
          >
            {/* Left: scrolling announcement marquee */}
            <div className="flex-1 max-w-full md:max-w-[55%] min-w-0 flex items-center">
              <div className="relative flex-1 min-w-0 overflow-hidden h-full flex items-center">
                <marquee scrollamount="3.5" className="w-full">
                  {marqueeItems.map((item: any, idx: number) => {
                    const content = (
                      <span className="inline-flex items-center gap-2">
                        <span className="font-light text-white/90 whitespace-nowrap">{item.text}</span>
                        {item.badge && (
                          <span className="bg-[#C89E4C] text-[#08172D] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider select-none shrink-0 whitespace-nowrap shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    );

                    return (
                      <span key={idx} className="inline-flex items-center">
                        {idx > 0 && <span className="mx-5 text-white/20 select-none">|</span>}
                        {item.link ? (
                          <a
                            href={item.link}
                            target={item.link.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="hover:text-[var(--champagne-gold)] transition-colors inline-flex items-center"
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </span>
                    );
                  })}
                </marquee>
              </div>
            </div>

            {/* Right: Custom Links + Contact Pills */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0 font-medium ml-auto text-xs">
              {topBarLinks && topBarLinks.length > 0 && (
                <div className="flex items-center gap-3.5 border-r border-white/15 pr-4">
                  {topBarLinks.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-[var(--champagne-gold)] font-bold hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-white/80">
                <Mail size={11} className="text-[var(--champagne-gold)]" />
                <a href={`mailto:${topBarEmail}`} className="hover:text-white transition-colors">
                  {topBarEmail}
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-white/80">
                <Phone size={11} className="text-[var(--champagne-gold)]" />
                <a href={`tel:${topBarPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {topBarPhone}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="hidden md:flex text-white/90 text-[11.5px] font-normal py-2 px-6 lg:px-12 justify-between items-center gap-2 w-full select-none shrink-0"
            style={{
              background: 'var(--navy-dark, #08172D)',
              borderBottom: '1px solid rgba(200, 158, 76, 0.25)',
            }}
          >
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-[var(--champagne-gold)]" />
                <span>{topBarAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={11} className="text-[var(--champagne-gold)]" />
                <a href={`mailto:${topBarEmail}`} className="hover:text-white transition-colors">
                  {topBarEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-wrap justify-end">
              <div className="flex items-center gap-1.5">
                <Phone size={11} className="text-[var(--champagne-gold)]" />
                <a href={`tel:${topBarPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {topBarPhone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-[var(--champagne-gold)]" />
                <span>{topBarWorkingHours}</span>
              </div>
              {topBarLinks && topBarLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {topBarLinks.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#C89E4C] text-[#08172D] font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Sticky Main Navigation */}
      <header
        className={`sticky top-0 z-50 bg-white w-full select-none transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_2px_16px_rgba(11,37,69,0.08)]' : ''
        }`}
      >
        <div className="section-container flex items-center justify-between h-20">
          
          {/* Logo / Brand Masthead */}
          <Link href="/" className="flex items-center group py-1.5 z-10 shrink-0">
            {logoUrl ? (
              <OptimizedImage
                src={logoUrl}
                alt={siteName || "Logo"}
                className={`${logoHeightClass} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.015]`}
                priority={true}
              />
            ) : (
              <div className="flex flex-col">
                <span
                  className="transition-colors font-serif uppercase tracking-widest text-xs sm:text-sm font-semibold leading-none"
                  style={{ letterSpacing: '0.15em', color: 'var(--navy, #0B2545)' }}
                >
                  {siteName}
                </span>
                <span
                  className="uppercase text-[0.55rem] font-sans font-bold tracking-widest mt-1 opacity-95"
                  style={{ letterSpacing: '0.2em', color: 'var(--gold, #f9c53c)' }}
                >
                  {subheading}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation & CTA - right-aligned on desktop */}
          <div className="hidden lg:flex items-center gap-8 z-10">
            <nav className="flex items-center space-x-1.5 z-10">
              {navLinks.map((link: any, idx: number) => {
                const active = pathname === link.href;
                const hasChildren = link.children && link.children.length > 0;

                if (hasChildren) {
                  return (
                    <div key={`${link.label}-${idx}`} className="relative group py-2">
                      <Link
                        href={link.href || '#'}
                        className={`px-2.5 py-1.5 text-[0.725rem] font-bold uppercase tracking-widest transition-all rounded-lg inline-flex items-center gap-1 ${
                          active
                            ? 'text-[var(--navy)] bg-[var(--mist)]'
                            : 'text-[var(--ink)]/65 hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          size={12}
                          className="transition-transform duration-200 group-hover:rotate-180"
                          style={{ color: 'var(--gold, #f9c53c)', opacity: 0.9 }}
                        />
                      </Link>
                      {/* Dropdown panel */}
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-48 bg-white rounded-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 p-1.5 before:absolute before:content-[''] before:w-full before:h-3 before:-top-3 before:left-0"
                        style={{
                          border: '1px solid var(--fog, #DDE4EE)',
                          boxShadow: '0 8px 32px rgba(11,37,69,0.10)',
                        }}
                      >
                        {link.children.map((subLink: any, sidx: number) => {
                          const subActive = pathname === subLink.href;
                          return renderLink(
                            subLink.href,
                            subLink.label,
                            `block px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-widest rounded-lg transition-colors ${
                              subActive
                                ? 'text-[var(--navy)] bg-[var(--mist)]'
                                : 'text-[var(--slate-text)] hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                            }`,
                            undefined,
                            `${subLink.href}-${sidx}`
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return renderLink(
                  link.href,
                  link.label,
                  `px-2.5 py-1.5 text-[0.725rem] font-bold uppercase tracking-widest transition-all rounded-lg ${
                    active
                      ? 'text-[var(--navy)] bg-[var(--mist)]'
                      : 'text-[var(--ink)]/65 hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                  }`,
                  undefined,
                  `${link.href}-${idx}`
                );
              })}
            </nav>

            {/* Solid Gold CTA Button */}
            {renderLink(
              ctaUrl,
              ctaLabel,
              `inline-flex items-center justify-center px-5 py-2.5 rounded-xl transition-all text-xs font-bold tracking-wider uppercase font-sans bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] shadow-md shadow-amber-500/25 hover:brightness-105 hover:shadow-lg active:scale-[0.98]`,
              undefined,
            )}
          </div>

          {/* Right Action & Mobile Toggle */}
          <div className="flex lg:hidden items-center z-10 shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 transition-colors rounded-lg"
              style={{
                color: 'var(--navy, #0B2545)',
                background: 'rgba(11,37,69,0.05)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,37,69,0.10)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(11,37,69,0.05)')}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown Panel */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden absolute left-2 right-2 top-22 p-4 bg-white rounded-2xl z-40 max-h-[80vh] overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-4 duration-200"
              style={{
                border: '1px solid var(--fog, #DDE4EE)',
                boxShadow: '0 12px 40px rgba(11,37,69,0.12)',
              }}
            >
              {navLinks.map((link: any, idx: number) => {
                const active = pathname === link.href;
                const hasChildren = link.children && link.children.length > 0;
                const isExpanded = expandedMobileLink === link.label;

                if (hasChildren) {
                  return (
                    <div key={`${link.label}-${idx}`} className="w-full">
                      <button
                        onClick={() => setExpandedMobileLink(isExpanded ? null : link.label)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-widest transition-colors font-sans rounded-lg ${
                          active
                            ? 'text-[var(--navy)] bg-[var(--mist)]'
                            : 'text-[var(--ink)]/65 hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isExpanded && (
                        <div
                          className="pl-4 mt-1 space-y-0.5"
                          style={{ borderLeft: '1px solid var(--fog, #DDE4EE)' }}
                        >
                          {link.children.map((subLink: any, sidx: number) => {
                            const subActive = pathname === subLink.href;
                            return renderLink(
                              subLink.href,
                              subLink.label,
                              `block px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-colors rounded-lg ${
                                subActive
                                  ? 'text-[var(--navy)] bg-[var(--mist)]'
                                  : 'text-[var(--slate-text)] hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                              }`,
                              () => setMobileMenuOpen(false),
                              `${subLink.href}-${sidx}`
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return renderLink(
                  link.href,
                  link.label,
                  `block px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-widest transition-colors font-sans rounded-lg ${
                    active
                      ? 'text-[var(--navy)] bg-[var(--mist)]'
                      : 'text-[var(--ink)]/65 hover:text-[var(--navy)] hover:bg-[var(--mist)]'
                  }`,
                  () => setMobileMenuOpen(false),
                  `${link.href}-${idx}`
                );
              })}
            </div>
          )}

        </div>
      </header>
    </>
  );
}
