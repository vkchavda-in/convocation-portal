'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, MessageSquare, Phone, Mail, Info, Gift, ArrowUp, Share2, Facebook, Instagram, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

const widgetModalStyles = `
  .npf-modal-container iframe {
    scrollbar-width: none !important;
  }
  .npf-modal-container iframe::-webkit-scrollbar {
    display: none !important;
  }
  @media (max-width: 640px) {
    .npf-flyout-container {
      right: 16px !important;
      left: 16px !important;
      width: auto !important;
      max-width: calc(100vw - 32px) !important;
    }
  }
`;

interface WidgetSocialLink {
  platform: 'whatsapp' | 'phone' | 'mail' | 'facebook' | 'instagram' | 'linkedin' | 'custom';
  url: string;
  label?: string;
}

interface WidgetItem {
  id: string;
  enabled: boolean;
  type: 'link' | 'modal' | 'html' | 'download' | 'npf';
  text: string;
  link: string;
  html: string;
  downloadMediaUrl?: string;
  downloadMediaName?: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  offset: number;
  modalTitle: string;
  modalHtml: string;
  npfWidgetId?: string;
  npfHeight?: string;
  npfDefaultOpenDesktop?: boolean;
  npfDefaultOpenMobile?: boolean;
  npfHeightMobile?: string;
  offsetMobile?: number;
  npfScale?: number;
  npfScaleMobile?: number;
  customPosition?: boolean;
  positionTop?: string;
  positionBottom?: string;
  positionLeft?: string;
  positionRight?: string;
  widgetStyle?: 'button' | 'floating-button' | 'bubble' | 'social-strip' | 'scroll-progress' | 'custom';
  bubbleIcon?: 'message' | 'whatsapp' | 'phone' | 'mail' | 'info' | 'help' | 'gift';
  whatsappNumber?: string;
  phoneNumber?: string;
  emailAddress?: string;
  socialLinks?: WidgetSocialLink[];
}

interface EnquiryWidgetProps {
  settings?: {
    widgets?: WidgetItem[];
    // Auto Popup settings
    autoPopupEnabled?: boolean;
    autoPopupTitle?: string;
    autoPopupHtml?: string;
    autoPopupDelay?: number;
    autoPopupFrequency?: 'always' | 'once_per_session';
    autoPopupMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    autoPopupShowCloseButton?: boolean;
    autoPopupCloseOnBackdrop?: boolean;
    autoPopupCtaText?: string;
    autoPopupCtaUrl?: string;
    // Fallback settings for backward compatibility
    widgetEnabled?: boolean;
    widgetType?: 'link' | 'modal' | 'html' | 'download';
    widgetText?: string;
    widgetLink?: string;
    widgetHtml?: string;
    widgetSide?: 'left' | 'right' | 'top' | 'bottom';
    widgetOffset?: number;
    modalHtml?: string;
    topBarPhone?: string;
    topBarEmail?: string;
  };
}

export default function EnquiryWidget({ settings }: EnquiryWidgetProps) {
  const [activeModalWidget, setActiveModalWidget] = useState<WidgetItem | null>(null);
  const [openNpfWidgetId, setOpenNpfWidgetId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(1024);
  const [windowHeight, setWindowHeight] = useState<number>(768);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const showScrollTopRef = useRef(false);

  // Auto Popup trigger on site load / reload
  useEffect(() => {
    if (!settings?.autoPopupEnabled || !settings?.autoPopupHtml) return;

    if (settings?.autoPopupFrequency === 'once_per_session') {
      const seen = typeof window !== 'undefined' && sessionStorage.getItem('convocation_auto_popup_shown');
      if (seen) return;
    }

    const delayMs = Math.max(0, (settings?.autoPopupDelay ?? 1) * 1000);
    const timer = setTimeout(() => {
      setShowAutoPopup(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [settings?.autoPopupEnabled, settings?.autoPopupHtml, settings?.autoPopupFrequency, settings?.autoPopupDelay]);

  const handleCloseAutoPopup = () => {
    setShowAutoPopup(false);
    if (settings?.autoPopupFrequency === 'once_per_session' && typeof window !== 'undefined') {
      sessionStorage.setItem('convocation_auto_popup_shown', 'true');
    }
  };

  // Lock body scroll and Lenis smooth scroll when modal or auto popup is active
  useEffect(() => {
    if (activeModalWidget || showAutoPopup) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if ((window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [activeModalWidget, showAutoPopup]);

  // Track window size dynamically for responsive sizing and auto-scaling
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load NPF widget script dynamically when an NPF widget is opened
  useEffect(() => {
    if (!openNpfWidgetId) return;

    const scriptId = 'npf-widget-global-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (script) {
      script.remove();
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://widgets.in6.nopaperforms.com/emwgts.js';
    document.body.appendChild(script);

    return () => {
      if (script) {
        script.remove();
      }
    };
  }, [openNpfWidgetId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const showTop = scrollTop > 300;
      if (showScrollTopRef.current !== showTop) {
        showScrollTopRef.current = showTop;
        setShowScrollTop(showTop);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Normalize widgets: either array from settings or convert fallback fields to array
  const widgets: WidgetItem[] = settings?.widgets || [];

  // If no widgets array exists but fallback is enabled, make a single widget array
  const hasLegacyWidget = settings?.widgetEnabled ?? true;
  const legacyWidget: WidgetItem = {
    id: 'widget_legacy',
    enabled: true,
    type: settings?.widgetType || 'modal',
    text: settings?.widgetText || 'Enquire Now!',
    link: settings?.widgetLink || 'https://admissiongoa.ganpatuniversity.ac.in/',
    html: settings?.widgetHtml || '',
    side: settings?.widgetSide || 'right',
    offset: settings?.widgetOffset ?? 50,
    modalTitle: 'Ganpat University Goa',
    modalHtml: (settings as any)?.modalHtml || '',
  };

  const normalizedWidgets: WidgetItem[] = widgets.length > 0
    ? widgets.filter(w => w.enabled)
    : (hasLegacyWidget ? [legacyWidget] : []);

  // Initialize mounting and automatically open the first active NPF widget
  useEffect(() => {
    setMounted(true);
    const firstNpfWidget = normalizedWidgets.find(w => w.type === 'npf');
    if (firstNpfWidget) {
      const isMobile = window.innerWidth < 768;
      const shouldOpen = isMobile
        ? (firstNpfWidget.npfDefaultOpenMobile ?? false)
        : (firstNpfWidget.npfDefaultOpenDesktop ?? true);
      if (shouldOpen) {
        setOpenNpfWidgetId(firstNpfWidget.id);
      }
    }
  }, []);

  // Execute any embedded <script> tags inside modal (e.g. custom inline scripts)
  useEffect(() => {
    if (!activeModalWidget) return;

    const timer = setTimeout(() => {
      const container = modalContainerRef.current;
      if (!container) return;

      const scripts = container.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [activeModalWidget]);

  if (normalizedWidgets.length === 0) return null;

  const handleWidgetClick = (widget: WidgetItem) => {
    if (widget.type === 'link') {
      window.open(widget.link, '_blank', 'noopener,noreferrer');
    } else if (widget.type === 'download') {
      if (widget.downloadMediaUrl) {
        const a = document.createElement('a');
        a.href = widget.downloadMediaUrl;
        a.download = widget.downloadMediaName || '';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else if (widget.type === 'modal') {
      setActiveModalWidget(widget);
      setSubmitted(false);
    } else if (widget.type === 'npf') {
      setOpenNpfWidgetId(prev => prev === widget.id ? null : widget.id);
    }
  };

  const getFormHeight = (widget: WidgetItem) => {
    const isMobile = windowWidth < 768;
    if (isMobile && widget.npfHeightMobile) {
      return widget.npfHeightMobile;
    }
    return widget.npfHeight || '400px';
  };

  const getWidgetOffset = (widget: WidgetItem) => {
    const isMobile = windowWidth < 768;
    if (isMobile && widget.offsetMobile !== undefined) {
      return widget.offsetMobile;
    }
    return widget.offset;
  };

  const getWidgetScale = (widget: WidgetItem) => {
    const isMobile = windowWidth < 768;
    const baseScale = isMobile
      ? (widget.npfScaleMobile ?? 0.85)
      : (widget.npfScale ?? 0.9);

    // Calculate height-based scaling factor
    // Reference height is 750px. Clamped between 0.6 and 1.0.
    const heightFactor = Math.min(1.0, Math.max(0.6, windowHeight / 750));
    
    return Number((baseScale * heightFactor).toFixed(3));
  };

  const getFlyoutStyle = (widget: WidgetItem): React.CSSProperties => {
    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
    };
    const offset = getWidgetOffset(widget);
    const scale = getWidgetScale(widget);
    const isMobile = windowWidth < 768;

    if (widget.customPosition) {
      const px = (v: string) => v && v !== 'auto' ? (/^\d+(\.\d+)?$/.test(v.trim()) ? `${v}px` : v) : undefined;
      if (widget.positionTop && widget.positionTop !== 'auto') style.top = `calc(${px(widget.positionTop)} + 46px)`;
      if (widget.positionBottom && widget.positionBottom !== 'auto') style.bottom = `calc(${px(widget.positionBottom)} + 46px)`;
      if (widget.positionLeft && widget.positionLeft !== 'auto') style.left = `calc(${px(widget.positionLeft)} + 46px)`;
      if (widget.positionRight && widget.positionRight !== 'auto') style.right = `calc(${px(widget.positionRight)} + 46px)`;
    } else {
      if (isMobile) {
        style.left = '16px';
        style.right = '16px';
        if (widget.side === 'right' || widget.side === 'left') {
          style.top = `${offset}%`;
          style.transform = `translateY(-50%) scale(${scale})`;
          style.transformOrigin = 'center center';
        } else if (widget.side === 'top') {
          style.top = '60px';
          style.transform = `scale(${scale})`;
          style.transformOrigin = 'top center';
        } else if (widget.side === 'bottom') {
          style.bottom = '60px';
          style.transform = `scale(${scale})`;
          style.transformOrigin = 'bottom center';
        }
      } else {
        if (widget.side === 'right') {
          style.right = '46px';
          style.top = `${offset}%`;
          style.transform = `translateY(-50%) scale(${scale})`;
          style.transformOrigin = 'right center';
        } else if (widget.side === 'left') {
          style.left = '46px';
          style.top = `${offset}%`;
          style.transform = `translateY(-50%) scale(${scale})`;
          style.transformOrigin = 'left center';
        } else if (widget.side === 'top') {
          style.top = '46px';
          style.left = `${offset}%`;
          style.transform = `translateX(-50%) scale(${scale})`;
          style.transformOrigin = 'top center';
        } else if (widget.side === 'bottom') {
          style.bottom = '46px';
          style.left = `${offset}%`;
          style.transform = `translateX(-50%) scale(${scale})`;
          style.transformOrigin = 'bottom center';
        }
      }
    }
    return style;
  };

  const getPointerStyle = (widget: WidgetItem): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: 'fixed',
      width: '12px',
      height: '12px',
      backgroundColor: '#ffffff',
      borderStyle: 'solid',
      borderColor: '#e2e8f0', // slate-200
      zIndex: 51, // Render on top of container to prevent shadow-overlap darkening
    };

    const offset = getWidgetOffset(widget);
    const scale = getWidgetScale(widget);

    if (widget.side === 'right') {
      style.right = '40px'; // 46px (flyout right) - 6px
      style.top = `${offset}%`;
      style.transform = `translateY(-50%) rotate(45deg) scale(${scale})`;
      style.borderWidth = '1px 1px 0 0';
      style.filter = 'drop-shadow(2px 2px 2px rgba(0,0,0,0.08))';
    } else if (widget.side === 'left') {
      style.left = '40px'; // 46px (flyout left) - 6px
      style.top = `${offset}%`;
      style.transform = `translateY(-50%) rotate(-135deg) scale(${scale})`;
      style.borderWidth = '1px 1px 0 0';
      style.filter = 'drop-shadow(-2px 2px 2px rgba(0,0,0,0.08))';
    } else if (widget.side === 'top') {
      style.top = '40px'; // 46px (flyout top) - 6px
      style.left = `${offset}%`;
      style.transform = `translateX(-50%) rotate(-45deg) scale(${scale})`;
      style.borderWidth = '1px 1px 0 0';
      style.filter = 'drop-shadow(2px -2px 2px rgba(0,0,0,0.08))';
    } else if (widget.side === 'bottom') {
      style.bottom = '40px'; // 46px (flyout bottom) - 6px
      style.left = `${offset}%`;
      style.transform = `translateX(-50%) rotate(135deg) scale(${scale})`;
      style.borderWidth = '1px 1px 0 0';
      style.filter = 'drop-shadow(2px 2px 2px rgba(0,0,0,0.08))';
    }

    return style;
  };

  const openWidget = normalizedWidgets.find(w => w.id === openNpfWidgetId);

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: widgetModalStyles }} />
        {/* Dynamic Floating Action Buttons */}
        {normalizedWidgets.map((widget) => {
          if (widget.type === 'html' && widget.html && !widget.widgetStyle) {
            return <div key={widget.id} dangerouslySetInnerHTML={{ __html: widget.html }} />;
          }
  
          // Determine inline styling and position rules
          let positionStyle: React.CSSProperties = {
            position: 'fixed',
            zIndex: 40,
          };
  
          if (widget.customPosition) {
            const px = (v: string) => v && v !== 'auto' ? (/^\d+(\.\d+)?$/.test(v.trim()) ? `${v}px` : v) : undefined;
            if (widget.positionTop && widget.positionTop !== 'auto') positionStyle.top = px(widget.positionTop);
            if (widget.positionBottom && widget.positionBottom !== 'auto') positionStyle.bottom = px(widget.positionBottom);
            if (widget.positionLeft && widget.positionLeft !== 'auto') positionStyle.left = px(widget.positionLeft);
            if (widget.positionRight && widget.positionRight !== 'auto') positionStyle.right = px(widget.positionRight);
          } else {
            // Standard screen side pinning offsets
            const offset = getWidgetOffset(widget);
            if (widget.side === 'right') {
              positionStyle.right = 0;
              positionStyle.top = `${offset}%`;
              positionStyle.transform = 'translateY(-50%)';
            } else if (widget.side === 'left') {
              positionStyle.left = 0;
              positionStyle.top = `${offset}%`;
              positionStyle.transform = 'translateY(-50%)';
            } else if (widget.side === 'top') {
              positionStyle.top = 0;
              positionStyle.left = `${offset}%`;
              positionStyle.transform = 'translateX(-50%)';
            } else if (widget.side === 'bottom') {
              positionStyle.bottom = 0;
              positionStyle.left = `${offset}%`;
              positionStyle.transform = 'translateX(-50%)';
            }
          }
  
          const style = widget.widgetStyle || 'button';
  
          if (style === 'custom') {
            return (
              <div
                key={widget.id}
                style={positionStyle}
                dangerouslySetInnerHTML={{ __html: widget.html }}
              />
            );
          }
  
          if (style === 'social-strip') {
            const isLeftOrRight = widget.side === 'left' || widget.side === 'right' || widget.customPosition;
  
            // Default fallback if no custom social links are added yet
            const linksToRender: WidgetSocialLink[] = widget.socialLinks && widget.socialLinks.length > 0 ? widget.socialLinks : [
              { platform: 'whatsapp', url: widget.whatsappNumber || settings?.topBarPhone || '919270292602', label: 'WhatsApp Support' },
              { platform: 'phone', url: widget.phoneNumber || settings?.topBarPhone || '+91 92702 92602', label: 'Call Helpline' },
              { platform: 'mail', url: widget.emailAddress || settings?.topBarEmail || 'admission.goaguni@ganpatuniversity.ac.in', label: 'Email Us' }
            ];
  
            return (
              <div
                key={widget.id}
                style={positionStyle}
                className={`flex ${isLeftOrRight ? 'flex-col' : 'flex-row'} items-center gap-2 p-1.5 bg-white border border-slate-200 shadow-xl rounded-full`}
              >
                {linksToRender.map((lnk, idx) => {
                  let href = lnk.url;
                  let icon = <Share2 className="w-3.5 h-3.5" />;
                  let btnClass = 'bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white';
                  let title = lnk.label || 'Link';
  
                  if (lnk.platform === 'whatsapp') {
                    const cleaned = lnk.url.replace(/[^0-9]/g, '');
                    href = `https://wa.me/${cleaned || '919270292602'}`;
                    icon = <MessageSquare className="w-3.5 h-3.5" />;
                    btnClass = 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white';
                    title = 'WhatsApp Support';
                  } else if (lnk.platform === 'phone') {
                    href = `tel:${lnk.url}`;
                    icon = <Phone className="w-3.5 h-3.5" />;
                    btnClass = 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white';
                    title = 'Call Helpline';
                  } else if (lnk.platform === 'mail') {
                    href = `mailto:${lnk.url}`;
                    icon = <Mail className="w-3.5 h-3.5" />;
                    btnClass = 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white';
                    title = 'Email Us';
                  } else if (lnk.platform === 'facebook') {
                    href = lnk.url.startsWith('http') ? lnk.url : `https://facebook.com/${lnk.url}`;
                    icon = <Facebook className="w-3.5 h-3.5" />;
                    btnClass = 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white';
                    title = 'Facebook';
                  } else if (lnk.platform === 'instagram') {
                    href = lnk.url.startsWith('http') ? lnk.url : `https://instagram.com/${lnk.url}`;
                    icon = <Instagram className="w-3.5 h-3.5" />;
                    btnClass = 'bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white';
                    title = 'Instagram';
                  } else if (lnk.platform === 'linkedin') {
                    href = lnk.url.startsWith('http') ? lnk.url : `https://linkedin.com/in/${lnk.url}`;
                    icon = <Linkedin className="w-3.5 h-3.5" />;
                    btnClass = 'bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white';
                    title = 'LinkedIn';
                  }
  
                  return (
                    <a
                      key={idx}
                      href={href}
                      target={lnk.platform !== 'phone' && lnk.platform !== 'mail' ? '_blank' : undefined}
                      rel="noreferrer"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${btnClass}`}
                      title={title}
                    >
                      {icon}
                    </a>
                  );
                })}
              </div>
            );
          }
  
          if (style === 'floating-button') {
            return (
              <button
                key={widget.id}
                type="button"
                onClick={() => handleWidgetClick(widget)}
                style={{
                  ...positionStyle,
                  background: 'linear-gradient(90deg, #e9a800, #f9c53c, #f59e0b)',
                  color: '#060f24',
                  boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)'
                }}
                className="flex items-center justify-center font-black text-[#060f24] text-[10px] md:text-xs tracking-wider px-5 py-2.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 uppercase font-sans shine-hover overflow-hidden border border-amber-300/40"
              >
                {widget.text}
              </button>
            );
          }
  
          if (style === 'bubble') {
            const iconName = widget.bubbleIcon || 'message';
            let iconElement = <MessageSquare className="w-5 h-5 text-[#060f24]" />;
            let bubbleBg = 'linear-gradient(135deg, #e9a800, #f9c53c, #f59e0b)';
  
            if (iconName === 'whatsapp') {
              iconElement = (
                <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-white shrink-0">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.02 14.024.992 11.41.992 5.974.992 1.55 5.361 1.547 10.79c-.002 1.637.433 3.238 1.26 4.678l-.997 3.637 3.837-.993zM18.23 15.11c-.34-.17-2.01-1.01-2.321-1.123-.31-.11-.537-.17-.76.17-.223.337-.866 1.1-.11 1.348.156.052.312.1.468.1.156 0 .313-.048.47-.156.34-.17.68-.34.99-.548.33-.222.66-.468.99-.76.31-.274.537-.565.656-.837.12-.27.06-.51-.03-.68-.09-.17-.76-1.83-1.04-2.516-.273-.656-.566-.656-.766-.666-.2-.01-.425-.01-.652-.01-.226 0-.595.085-.907.425-.31.336-1.19 1.162-1.19 2.83 0 1.67 1.218 3.28 1.388 3.51.17.23 2.395 3.66 5.8 5.13 2.83 1.214 3.738 1.034 5.097.74.887-.19 2.01-.82 2.293-1.57.283-.75.283-1.393.2-1.527-.083-.135-.312-.224-.652-.394z"/>
                </svg>
              );
              bubbleBg = '#10B981';
            } else if (iconName === 'phone') {
              iconElement = <Phone className="w-5 h-5 text-[#060f24]" />;
            } else if (iconName === 'mail') {
              iconElement = <Mail className="w-5 h-5 text-[#060f24]" />;
            } else if (iconName === 'info') {
              iconElement = <Info className="w-5 h-5 text-[#060f24]" />;
            } else if (iconName === 'gift') {
              iconElement = <Gift className="w-5 h-5 text-[#060f24]" />;
            }
  
            return (
              <button
                key={widget.id}
                type="button"
                onClick={() => handleWidgetClick(widget)}
                style={{
                  ...positionStyle,
                  background: bubbleBg,
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                }}
                className="w-12 h-12 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden shine-hover border border-amber-300/40"
                title={widget.text}
              >
                {iconElement}
              </button>
            );
          }
  
          // Default Vertical/Horizontal Tab Button layout in solid gold
          let buttonClass = '';
          if (!widget.customPosition) {
            if (widget.side === 'right') {
              buttonClass = 'w-9 md:w-[38px] h-36 rounded-l-2xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] overflow-hidden';
            } else if (widget.side === 'left') {
              buttonClass = 'w-9 md:w-[38px] h-36 rounded-r-2xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] overflow-hidden';
            } else if (widget.side === 'top') {
              buttonClass = 'px-5 py-2.5 rounded-b-2xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] overflow-hidden';
            } else if (widget.side === 'bottom') {
              buttonClass = 'px-5 py-2.5 rounded-t-2xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] overflow-hidden';
            }
          } else {
            buttonClass = 'px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.55)] overflow-hidden';
          }
  
          const isVertical = !widget.customPosition && (widget.side === 'left' || widget.side === 'right');
  
          return (
            <button
              key={widget.id}
              type="button"
              onClick={() => handleWidgetClick(widget)}
              style={{
                ...positionStyle,
                background: 'linear-gradient(180deg, #f9c53c 0%, #e9a800 50%, #f59e0b 100%)',
                color: '#060f24',
              }}
              className={`flex items-center justify-center font-black text-[#060f24] text-[10px] md:text-[11px] tracking-widest leading-none select-none transition-all duration-300 hover:brightness-105 active:scale-95 cursor-pointer uppercase shine-hover border border-amber-300/50 ${buttonClass}`}
            >
              {isVertical ? (
                <span className={`block transform whitespace-nowrap tracking-[0.25em] font-black text-[#060f24] ${widget.side === 'right' ? '-rotate-90' : 'rotate-90'}`}>
                  {widget.text}
                </span>
              ) : (
                <span className="font-black tracking-[0.12em] text-[#060f24]">{widget.text}</span>
              )}
            </button>
          );
        })}
  
        {/* NPF Floating Side-Flyout */}
        {openWidget && openWidget.type === 'npf' && openWidget.npfWidgetId && (
          <>
            {/* Tooltip Pointer / Arrow */}
            {windowWidth >= 768 && (
              <div 
                style={getPointerStyle(openWidget)}
                className="fixed z-[51] bg-white animate-fade-in pointer-events-none"
              />
            )}
            <div
              style={getFlyoutStyle(openWidget)}
              className="fixed z-50 w-[340px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in npf-flyout-container"
            >
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 px-3.5 py-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {openWidget.modalTitle || 'Quick Enquiry'}
              </span>
              <button
                onClick={() => setOpenNpfWidgetId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            {/* Form */}
            <div 
              className="p-0 m-0 overflow-y-auto" 
              style={{ height: getFormHeight(openWidget) }}
            >
              <div 
                className="npf_wgts" 
                data-height={getFormHeight(openWidget)} 
                data-w={openWidget.npfWidgetId}
              ></div>
            </div>
          </div>
        </>
      )}

      {/* Pure Viewport Portal Modal (for manual widget click) */}
      {activeModalWidget && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 top-0 left-0 select-none"
          onClick={() => setActiveModalWidget(null)}
        >
          <div
            ref={modalContainerRef}
            className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-amber-400/30 flex flex-col transition-all duration-300 scale-100 min-h-[220px]"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 60px -15px rgba(11, 37, 69, 0.4), 0 0 0 1px rgba(249, 197, 60, 0.3)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalWidget(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors p-1.5 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-200/80 rounded-full z-50 cursor-pointer shadow-sm"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Modal Content Frame */}
            <div className="p-0 overflow-y-auto max-h-[85vh] w-full scrollbar-thin custom-modal-container">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-8 px-6 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-lg font-bold text-[#0B2545]">Submission Successful!</h4>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Thank you. Our team will get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => setActiveModalWidget(null)}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors mt-2 cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: activeModalWidget.modalHtml || ''
                  }}
                  className="relative w-full min-h-[160px] p-6 text-slate-800"
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Automatic Popup Modal on Site Load / Reload */}
      {showAutoPopup && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300 top-0 left-0"
          onClick={() => {
            if (settings?.autoPopupCloseOnBackdrop !== false) handleCloseAutoPopup();
          }}
        >
          <div
            className={`relative bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200 ${
              settings?.autoPopupMaxWidth === 'sm' ? 'max-w-md' :
              settings?.autoPopupMaxWidth === 'md' ? 'max-w-lg' :
              settings?.autoPopupMaxWidth === 'xl' ? 'max-w-3xl' :
              settings?.autoPopupMaxWidth === '2xl' ? 'max-w-4xl' :
              'max-w-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 60px -15px rgba(11, 37, 69, 0.4), 0 0 0 1px rgba(249, 197, 60, 0.35)'
            }}
          >
            {/* Header / Banner */}
            <div
              className="px-6 py-3.5 flex items-center justify-between select-none relative"
              style={{
                background: 'var(--navy, #0B2545)',
                borderBottom: '2px solid #f9c53c',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f9c53c] animate-pulse shrink-0 shadow-sm" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate font-sans">
                  {settings?.autoPopupTitle || 'Notice & Announcement'}
                </h3>
              </div>

              {/* Close Button */}
              {settings?.autoPopupShowCloseButton !== false && (
                <button
                  onClick={handleCloseAutoPopup}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer shrink-0 ml-2"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Modal Body / Custom CKEditor HTML */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[75vh] w-full scrollbar-thin custom-modal-container text-slate-800 font-sans">
              <div
                dangerouslySetInnerHTML={{
                  __html: settings?.autoPopupHtml || ''
                }}
                className="prose prose-sm max-w-none prose-headings:text-[#0B2545] prose-a:text-[#b45309] prose-img:rounded-xl prose-img:mx-auto"
              />
            </div>

            {/* Optional Bottom Action Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Ganpat University Convocation</span>
              <div className="flex items-center gap-2.5 ml-auto">
                {settings?.autoPopupCtaText && (
                  <a
                    href={settings?.autoPopupCtaUrl || '#'}
                    target={settings?.autoPopupCtaUrl?.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    onClick={handleCloseAutoPopup}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
                  >
                    {settings.autoPopupCtaText}
                  </a>
                )}
                <button
                  onClick={handleCloseAutoPopup}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] shadow-xl shadow-amber-500/30 border border-amber-300 flex items-center justify-center text-[#060f24] hover:brightness-105 transition-all hover:scale-110 active:scale-95 group duration-300"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </>
  );
}
