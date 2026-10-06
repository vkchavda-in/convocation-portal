'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Layout, MousePointer, Plus, Trash2, ChevronDown, ChevronUp, Sliders, Download, FolderOpen, X } from 'lucide-react';
import { toast } from './AdminToaster';
import { CKEditorField } from '@/components/admin/block-editors/CustomEditor';
import MediaPicker from '@/components/admin/MediaPicker';

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface WidgetSocialLink {
  platform: 'whatsapp' | 'phone' | 'mail' | 'facebook' | 'instagram' | 'linkedin' | 'custom';
  url: string;
  label?: string;
}
interface WidgetItem {
  id: string; enabled: boolean; type: 'link' | 'modal' | 'html' | 'download' | 'npf';
  text: string; link: string; html: string; downloadMediaUrl?: string; downloadMediaName?: string;
  side: 'left' | 'right' | 'top' | 'bottom'; offset: number;
  modalTitle: string; modalHtml: string;
  npfWidgetId?: string;
  npfHeight?: string;
  npfDefaultOpenDesktop?: boolean;
  npfDefaultOpenMobile?: boolean;
  npfHeightMobile?: string;
  offsetMobile?: number;
  npfScale?: number;
  npfScaleMobile?: number;
  customPosition?: boolean;
  positionTop?: string; positionBottom?: string; positionLeft?: string; positionRight?: string;
  widgetStyle?: 'button' | 'floating-button' | 'bubble' | 'social-strip' | 'scroll-progress' | 'custom';
  bubbleIcon?: 'message' | 'whatsapp' | 'phone' | 'mail' | 'info' | 'help' | 'gift';
  whatsappNumber?: string; phoneNumber?: string; emailAddress?: string;
  socialLinks?: WidgetSocialLink[];
}
interface TopBarLinkItem { label: string; url: string; }
interface MarqueeItem { text: string; badge: string; link: string; }
interface AppWidgetSettings {
  topBarEnabled: boolean; topBarType: 'marquee' | 'static';
  topBarEmail: string; topBarPhone: string; topBarAddress: string; topBarWorkingHours: string;
  topBarCtaLabel?: string; topBarCtaUrl?: string;
  topBarLinks: TopBarLinkItem[]; topBarMarqueeItems: MarqueeItem[];
  widgets: WidgetItem[];
}

/* ─── Shared input style matching HeroEditor / global/page.tsx ─────────────── */
const inputCls = 'w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white';
const labelCls = 'block text-[10px] font-medium text-slate-500 mb-1';
const sectionHeadingCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200';

/* ─── Defaults ─────────────────────────────────────────────────────────────── */
const defaultModalHtml = `<div class="space-y-4">
  <h3 class="text-lg font-bold text-slate-800">Convocation Helpdesk</h3>
  <p class="text-xs text-slate-500">Submit your query regarding the ceremony, registration, or degree certificates.</p>
  <form id="enquiry-form" class="space-y-3">
    <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
    <input type="text" name="name" required class="w-full px-3 py-2 border border-slate-200 rounded text-xs" placeholder="Student Name" /></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
      <input type="email" name="email" required class="w-full px-3 py-2 border border-slate-200 rounded text-xs" placeholder="student@ganpatuniversity.ac.in" /></div>
      <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone</label>
      <input type="tel" name="phone" required class="w-full px-3 py-2 border border-slate-200 rounded text-xs" placeholder="+91 9876543210" /></div>
    </div>
    <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Enrollment Number / Query</label>
    <textarea name="message" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded text-xs" placeholder="Enter your enrollment number or questions here..."></textarea></div>
    <button type="submit" class="w-full py-2 bg-[#0B2545] text-[#f9c53c] font-bold rounded text-xs hover:brightness-110 transition-all">Submit Query</button>
  </form>
</div>`;

const defaultSettings: AppWidgetSettings = {
  topBarEnabled: true, topBarType: 'static',
  topBarEmail: 'convocation@ganpatuniversity.ac.in',
  topBarPhone: '+91 2762 226021',
  topBarAddress: 'Ganpat Vidyanagar, Mehsana-Gandhinagar Highway, PO - 384012',
  topBarWorkingHours: 'Mon–Sat: 9:00 AM – 4:00 PM',
  topBarCtaLabel: 'Watch Live',
  topBarCtaUrl: 'https://convocation.guni.ac.in/live',
  topBarLinks: [
    { label: 'Schedule', url: '/schedule-for-gold-medalists-and-phd-awardees' }
  ],
  topBarMarqueeItems: [
    { text: 'Ganpat University 19th Convocation Ceremony – Watch Live Webcast!', badge: 'Live Stream', link: 'https://convocation.guni.ac.in/live' },
    { text: 'Schedule & Seating Plan for Gold Medalists & PhD Awardees is now available.', badge: 'Important', link: '/schedule-for-gold-medalists-and-phd-awardees' }
  ],
  widgets: [{
    id: 'widget_convocation_1', enabled: true, type: 'modal', text: 'Helpdesk & Queries',
    link: 'https://convocation.guni.ac.in/live', html: '', side: 'right', offset: 50,
    modalTitle: 'Ganpat University Convocation Helpdesk', modalHtml: defaultModalHtml, widgetStyle: 'button',
  }],
};

interface Props { section: 'topbar' | 'widgets'; }

export default function WidgetsTabPanel({ section }: Props) {
  const [settings, setSettings] = useState<AppWidgetSettings>(defaultSettings);
  const [fullAppSettings, setFullAppSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [topBarLinks, setTopBarLinks] = useState<TopBarLinkItem[]>([]);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowAddDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.appSettings) {
          const parsed = JSON.parse(data.appSettings);
          setFullAppSettings(parsed);

          // ── Widget resolution ───────────────────────────────────────────
          // 1. Use the saved widgets array if it has entries.
          // 2. Otherwise try to migrate from the old flat widget fields.
          // 3. Finally fall back to the hardcoded default ("Enquire Now!").
          let migratedWidgets: WidgetItem[] =
            Array.isArray(parsed.widgets) && parsed.widgets.length > 0
              ? parsed.widgets
              : [];

          if (migratedWidgets.length === 0 && (parsed.widgetEnabled !== undefined || parsed.widgetText)) {
            migratedWidgets = [{
              id: 'widget_migrated_legacy',
              enabled: parsed.widgetEnabled !== false,
              type: parsed.widgetType || 'modal',
              text: parsed.widgetText || 'Enquire Now!',
              link: parsed.widgetLink || 'https://admissiongoa.ganpatuniversity.ac.in/',
              html: parsed.widgetHtml || '',
              side: parsed.widgetSide || 'right',
              offset: parsed.widgetOffset ?? 50,
              modalTitle: parsed.widgetModalTitle || 'Ganpat University Goa',
              modalHtml: parsed.widgetModalHtml || defaultModalHtml,
              widgetStyle: parsed.widgetStyle || 'button',
            }];
          }

          if (migratedWidgets.length === 0) {
            migratedWidgets = defaultSettings.widgets;
          }

          setSettings({ ...defaultSettings, ...parsed, widgets: migratedWidgets });
          setMarqueeItems(parsed.topBarMarqueeItems || defaultSettings.topBarMarqueeItems);
          setTopBarLinks(parsed.topBarLinks || defaultSettings.topBarLinks);
          if (migratedWidgets.length > 0) setExpandedWidgetId(migratedWidgets[0].id);

        }
      }
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }, []);


  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Expose save so the parent global page Save button calls it via a custom event
  useEffect(() => {
    const handler = async () => {
      try {
        const filteredMarquee = marqueeItems.filter(i => i.text.trim());
        const filteredLinks = topBarLinks.filter(l => l.label.trim() && l.url.trim());
        const body = { ...fullAppSettings, ...settings, topBarMarqueeItems: filteredMarquee, topBarLinks: filteredLinks };
        const res = await fetch('/api/settings', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appSettings: JSON.stringify(body) }),
        });
        if (res.ok) toast.success('Saved successfully');
        else toast.error('Failed to save');
      } catch { toast.error('Network error'); }
    };
    window.addEventListener('widget-panel-save', handler);
    return () => window.removeEventListener('widget-panel-save', handler);
  }, [settings, marqueeItems, topBarLinks, fullAppSettings]);

  const update = (key: keyof AppWidgetSettings, value: any) => setSettings(prev => ({ ...prev, [key]: value }));
  const addMarqueeItem = () => setMarqueeItems(prev => [...prev, { text: '', badge: '', link: '' }]);
  const updateMarqueeItem = (i: number, k: keyof MarqueeItem, v: string) =>
    setMarqueeItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const removeMarqueeItem = (i: number) =>
    setConfirmDelete({ title: 'Delete Announcement', message: 'Delete this scrolling announcement?',
      onConfirm: () => { setMarqueeItems(prev => prev.filter((_, idx) => idx !== i)); toast.info('Deleted'); }});
  const addTopBarLink = () => setTopBarLinks(prev => [...prev, { label: '', url: '' }]);
  const updateTopBarLink = (i: number, k: keyof TopBarLinkItem, v: string) =>
    setTopBarLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const removeTopBarLink = (i: number) =>
    setConfirmDelete({ title: 'Delete Link', message: 'Delete this top bar link?',
      onConfirm: () => { setTopBarLinks(prev => prev.filter((_, idx) => idx !== i)); toast.info('Deleted'); }});
  const addWidget = (style: 'button' | 'floating-button' | 'bubble' | 'social-strip' | 'custom') => {
    const id = 'widget_' + Date.now();
    const w: WidgetItem = {
      id, enabled: true, type: style === 'custom' ? 'html' : 'link',
      text: style === 'bubble' ? 'New Bubble' : style === 'floating-button' ? 'New Floating Pill' : style === 'social-strip' ? 'Contact Strip' : style === 'custom' ? 'Custom Widget' : 'New Action Button',
      link: 'https://', html: '', side: 'right', offset: Math.min(90, 40 + settings.widgets.length * 15),
      modalTitle: 'Inquiry Form', modalHtml: '', widgetStyle: style,
    };
    setSettings(prev => ({ ...prev, widgets: [...prev.widgets, w] }));
    setExpandedWidgetId(id);
    setShowAddDropdown(false);
  };
  const removeWidget = (id: string) =>
    setConfirmDelete({ title: 'Delete Widget', message: 'Remove this widget?',
      onConfirm: () => { setSettings(prev => ({ ...prev, widgets: prev.widgets.filter(w => w.id !== id) })); toast.info('Widget removed'); }});
  const updateWidget = (id: string, key: keyof WidgetItem, value: any) =>
    setSettings(prev => ({ ...prev, widgets: prev.widgets.map(w => w.id === id ? { ...w, [key]: value } : w) }));
  const addSocialLink = (widgetId: string) => {
    const w = settings.widgets.find(w => w.id === widgetId); if (!w) return;
    updateWidget(widgetId, 'socialLinks', [...(w.socialLinks || []), { platform: 'whatsapp', url: '' }]);
  };
  const updateSocialLink = (widgetId: string, li: number, k: keyof WidgetSocialLink, v: string) => {
    const w = settings.widgets.find(w => w.id === widgetId); if (!w) return;
    const links = [...(w.socialLinks || [])]; links[li] = { ...links[li], [k]: v };
    updateWidget(widgetId, 'socialLinks', links);
  };
  const removeSocialLink = (widgetId: string, li: number) =>
    setConfirmDelete({ title: 'Delete Social Link', message: 'Remove this social link?',
      onConfirm: () => {
        const w = settings.widgets.find(w => w.id === widgetId); if (!w) return;
        updateWidget(widgetId, 'socialLinks', (w.socialLinks || []).filter((_, i) => i !== li));
        toast.info('Removed');
      }});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span>
      </div>
    );
  }

  /* ── TOPBAR SECTION ─────────────────────────────────────────────────────── */
  if (section === 'topbar') {
    return (
      <div className="space-y-6">
        {/* Enable toggle */}
        <section className="space-y-4">
          <div className="py-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">Enable TopBar Stripe</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Show/hide the notification stripe above the header.</p>
              </div>
              <button type="button" onClick={() => update('topBarEnabled', !settings.topBarEnabled)}
                className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                style={{ background: settings.topBarEnabled ? '#2563eb' : '#cbd5e1' }}>
                <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                  style={{ transform: settings.topBarEnabled ? 'translateX(16px)' : 'translateX(0)' }} />
              </button>
            </div>
          </div>
        </section>

        {settings.topBarEnabled && (
          <>
            {/* Display mode */}
            <section className="space-y-4">
              <h2 className={sectionHeadingCls}>Display Mode</h2>
              <div className="py-1">
                <label className={labelCls}>Text Display Mode</label>
                <select value={settings.topBarType} onChange={(e) => update('topBarType', e.target.value)}
                  className={inputCls}>
                  <option value="static">Static Contacts Only (Address, Email, Phone, Hours)</option>
                  <option value="marquee">Scrolling Announcements (Left) + Contacts (Right)</option>
                </select>
              </div>
            </section>

            {/* Contact details */}
            <section className="space-y-4">
              <h2 className={sectionHeadingCls}>Contact Details</h2>
              <div className="py-1">
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { label: 'Contact Email', key: 'topBarEmail', type: 'email' },
                    { label: 'Contact Phone', key: 'topBarPhone', type: 'text' },
                    { label: 'Office Address', key: 'topBarAddress', type: 'text' },
                    { label: 'Working Hours', key: 'topBarWorkingHours', type: 'text' },
                  ] as const).map(({ label, key, type }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input type={type} value={(settings as any)[key]}
                        onChange={(e) => update(key as keyof AppWidgetSettings, e.target.value)}
                        className={inputCls} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Top Bar Gold Action Button (Watch Live) */}
            <section className="space-y-4">
              <h2 className={sectionHeadingCls}>Top Bar Action Button (Watch Live Pill)</h2>
              <div className="py-1 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Button Text (e.g. Watch Live)</label>
                  <input
                    type="text"
                    value={settings.topBarCtaLabel ?? 'Watch Live'}
                    onChange={(e) => update('topBarCtaLabel' as keyof AppWidgetSettings, e.target.value)}
                    className={inputCls}
                    placeholder="Watch Live"
                  />
                </div>
                <div>
                  <label className={labelCls}>Button Destination URL</label>
                  <input
                    type="text"
                    value={settings.topBarCtaUrl ?? 'https://convocation.guni.ac.in/live'}
                    onChange={(e) => update('topBarCtaUrl' as keyof AppWidgetSettings, e.target.value)}
                    className={inputCls}
                    placeholder="https://convocation.guni.ac.in/live"
                  />
                </div>
              </div>
            </section>

            {/* Custom TopBar Links */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Links</h2>
                <button onClick={addTopBarLink} type="button"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded bg-blue-50/30 transition-colors">
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>
              <div className="py-1">
                {topBarLinks.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No custom links added. Only Email & Phone will display.</p>
                ) : (
                  <div className="space-y-2">
                    {topBarLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className={labelCls}>Label</label>
                          <input type="text" value={link.label} onChange={(e) => updateTopBarLink(idx, 'label', e.target.value)}
                            className={inputCls} placeholder="e.g. Apply Now" />
                        </div>
                        <div className="flex-[2]">
                          <label className={labelCls}>URL</label>
                          <input type="text" value={link.url} onChange={(e) => updateTopBarLink(idx, 'url', e.target.value)}
                            className={inputCls} placeholder="/apply or https://..." />
                        </div>
                        <button type="button" onClick={() => removeTopBarLink(idx)}
                          className="mt-4 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Marquee Announcements */}
            {settings.topBarType === 'marquee' && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scrolling Announcements</h2>
                  <button onClick={addMarqueeItem} type="button"
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded bg-blue-50/30 transition-colors">
                    <Plus className="w-3 h-3" /> Add Announcement
                  </button>
                </div>
                <div className="py-1 space-y-3">
                  {marqueeItems.map((item, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded bg-slate-50/50 space-y-2 relative">
                      <div className="pr-6">
                        <label className={labelCls}>Announcement Text</label>
                        <input type="text" value={item.text} onChange={(e) => updateMarqueeItem(idx, 'text', e.target.value)}
                          className={inputCls} placeholder="e.g. Admissions Open for Academic Year 2026-27!" />
                      </div>
                      {marqueeItems.length > 1 && (
                        <button type="button" onClick={() => removeMarqueeItem(idx)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Badge Text</label>
                          <input type="text" value={item.badge} onChange={(e) => updateMarqueeItem(idx, 'badge', e.target.value)}
                            className={inputCls} placeholder="e.g. NEW" />
                        </div>
                        <div>
                          <label className={labelCls}>Click Link URL</label>
                          <input type="text" value={item.link} onChange={(e) => updateMarqueeItem(idx, 'link', e.target.value)}
                            className={inputCls} placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400">Multiple entries are joined by " | " separators automatically.</p>
                </div>
              </section>
            )}
          </>
        )}

        {/* Confirm Delete */}
        {confirmDelete && <ConfirmDeleteModal confirmDelete={confirmDelete} onClose={() => setConfirmDelete(null)} />}
      </div>
    );
  }

  /* ── WIDGETS SECTION ────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-20">
      <section className="space-y-4">
        <div className="py-1 space-y-4">
          {settings.widgets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              No sticky widgets configured yet. Click the <strong>+</strong> button in the bottom-right to add one.
            </div>
          ) : (
            settings.widgets.map((widget, index) => {
              const isExpanded = expandedWidgetId === widget.id;
              return (
                <div key={widget.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Collapsible header */}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-200 cursor-pointer select-none"
                    onClick={() => setExpandedWidgetId(isExpanded ? null : widget.id)}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white tracking-wide uppercase"
                        style={{ background: widget.enabled ? '#059669' : '#94a3b8' }}>
                        {widget.enabled ? 'Active' : 'Off'}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{widget.text || `Widget #${index + 1}`}</span>
                      <span className="text-[10px] text-slate-400">({widget.side} @ {widget.offset}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => removeWidget(widget.id)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setExpandedWidgetId(isExpanded ? null : widget.id)}
                        className="p-1 hover:bg-slate-200 text-slate-400 rounded transition-colors">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded options */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 bg-white">
                      {/* Enable + Text */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                          <div>
                            <p className="text-[10px] font-medium text-slate-500">Enable Widget</p>
                            <p className="text-[10px] text-slate-400">Show on all pages.</p>
                          </div>
                          <button type="button" onClick={() => updateWidget(widget.id, 'enabled', !widget.enabled)}
                            className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                            style={{ background: widget.enabled ? '#059669' : '#cbd5e1' }}>
                            <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                              style={{ transform: widget.enabled ? 'translateX(16px)' : 'translateX(0)' }} />
                          </button>
                        </div>
                        {(!widget.widgetStyle || ['button', 'floating-button', 'bubble'].includes(widget.widgetStyle)) && (
                          <div>
                            <label className={labelCls}>{widget.widgetStyle === 'bubble' ? 'Tooltip Label' : 'Button Label'}</label>
                            <input type="text" value={widget.text} onChange={(e) => updateWidget(widget.id, 'text', e.target.value)}
                              className={inputCls} placeholder="e.g. Enquire Now!" />
                          </div>
                        )}
                      </div>

                      {/* Style + Action */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <label className={labelCls}>Widget Style</label>
                          <select value={widget.widgetStyle || 'button'} onChange={(e) => updateWidget(widget.id, 'widgetStyle', e.target.value)} className={inputCls}>
                            <option value="button">Sticky Sidebar Button</option>
                            <option value="floating-button">Floating Pill Button</option>
                            <option value="bubble">Floating Action Bubble</option>
                            <option value="social-strip">Expandable Contact Strip</option>
                            <option value="custom">Custom HTML</option>
                          </select>
                        </div>
                        {(!widget.widgetStyle || ['button', 'floating-button', 'bubble'].includes(widget.widgetStyle)) && (
                          <div>
                            <label className={labelCls}>Click Action</label>
                            <select value={widget.type} onChange={(e) => updateWidget(widget.id, 'type', e.target.value)} className={inputCls}>
                              <option value="modal">Open Popup Modal</option>
                              <option value="link">Redirect to Link</option>
                              <option value="html">Custom HTML/Code</option>
                              <option value="download">Download Media</option>
                              <option value="npf">NoPaperForms Widget</option>
                            </select>
                          </div>
                        )}
                        {widget.widgetStyle === 'bubble' && (
                          <div>
                            <label className={labelCls}>Bubble Icon</label>
                            <select value={widget.bubbleIcon || 'message'} onChange={(e) => updateWidget(widget.id, 'bubbleIcon', e.target.value)} className={inputCls}>
                              <option value="message">Chat Bubble</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="phone">Phone</option>
                              <option value="mail">Mail</option>
                              <option value="info">Info</option>
                              <option value="gift">Gift</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Social strip links */}
                      {widget.widgetStyle === 'social-strip' && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className={labelCls}>Social Strip Links</label>
                            <button type="button" onClick={() => addSocialLink(widget.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-0.5 rounded bg-blue-50/30">
                              <Plus className="w-3 h-3" /> Add Link
                            </button>
                          </div>
                          {(!widget.socialLinks || widget.socialLinks.length === 0) ? (
                            <p className="text-[10px] text-slate-400 italic">No links. Click "Add Link" to begin.</p>
                          ) : (
                            <div className="space-y-2">
                              {widget.socialLinks.map((link, li) => (
                                <div key={li} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                  <select value={link.platform} onChange={(e) => updateSocialLink(widget.id, li, 'platform', e.target.value as any)}
                                    className="w-1/3 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="phone">Phone</option>
                                    <option value="mail">Email</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="custom">Custom URL</option>
                                  </select>
                                  <input type="text" value={link.url} onChange={(e) => updateSocialLink(widget.id, li, 'url', e.target.value)}
                                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    placeholder={link.platform === 'whatsapp' ? 'Phone number' : link.platform === 'mail' ? 'Email' : 'URL'} />
                                  <button type="button" onClick={() => removeSocialLink(widget.id, li)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Custom HTML widget body */}
                      {widget.widgetStyle === 'custom' && (
                        <div className="pt-3 border-t border-slate-100">
                          <label className={labelCls}>Custom Widget HTML</label>
                          <div className="border border-slate-200 rounded overflow-hidden bg-white mt-1">
                            <CKEditorField key={`custom-${widget.id}`} value={widget.html || ''} onChange={(v) => updateWidget(widget.id, 'html', v)} />
                          </div>
                        </div>
                      )}

                      {/* Positioning */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-slate-500">Advanced Positioning</p>
                            <p className="text-[10px] text-slate-400">Use raw CSS coordinates instead of screen edges.</p>
                          </div>
                          <button type="button" onClick={() => updateWidget(widget.id, 'customPosition', !widget.customPosition)}
                            className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                            style={{ background: widget.customPosition ? '#2563eb' : '#cbd5e1' }}>
                            <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                              style={{ transform: widget.customPosition ? 'translateX(16px)' : 'translateX(0)' }} />
                          </button>
                        </div>
                        {widget.customPosition ? (
                          <div className="grid grid-cols-4 gap-2">
                            {(['positionTop', 'positionBottom', 'positionLeft', 'positionRight'] as const).map((k) => (
                              <div key={k}>
                                <label className={labelCls}>{k.replace('position', '')}</label>
                                <input type="text" value={(widget as any)[k] || 'auto'}
                                  onChange={(e) => updateWidget(widget.id, k, e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none bg-white font-mono" placeholder="auto" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelCls}>Pin to Screen Side</label>
                                <select value={widget.side} onChange={(e) => updateWidget(widget.id, 'side', e.target.value)} className={inputCls}>
                                  <option value="left">Left Edge</option>
                                  <option value="right">Right Edge</option>
                                  <option value="top">Top Edge</option>
                                  <option value="bottom">Bottom Edge</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <label className={labelCls}>Offset (Desktop)</label>
                                  <span className="text-[10px] font-semibold text-blue-600">{widget.offset}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={widget.offset}
                                  onChange={(e) => updateWidget(widget.id, 'offset', parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2.5" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <label className={labelCls}>Offset (Mobile Phone)</label>
                                  <span className="text-[10px] font-semibold text-blue-600">{(widget.offsetMobile !== undefined ? widget.offsetMobile : widget.offset)}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={widget.offsetMobile !== undefined ? widget.offsetMobile : widget.offset}
                                  onChange={(e) => updateWidget(widget.id, 'offsetMobile', parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2.5" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action content: link / html / modal */}
                      {(!widget.widgetStyle || ['button', 'floating-button', 'bubble'].includes(widget.widgetStyle)) && (
                        <>
                          {widget.type === 'link' && (
                            <div className="pt-3 border-t border-slate-100">
                              <label className={labelCls}>Action URL</label>
                              <input type="url" value={widget.link} onChange={(e) => updateWidget(widget.id, 'link', e.target.value)}
                                className={inputCls} placeholder="https://..." />
                            </div>
                          )}
                          {widget.type === 'html' && (
                            <div className="pt-3 border-t border-slate-100">
                              <label className={labelCls}>Custom Embed HTML</label>
                              <div className="border border-slate-200 rounded overflow-hidden bg-white mt-1">
                                <CKEditorField key={`html-${widget.id}`} value={widget.html || ''} onChange={(v) => updateWidget(widget.id, 'html', v)} />
                              </div>
                            </div>
                          )}
                          {widget.type === 'modal' && (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div>
                                <label className={labelCls}>Modal Title</label>
                                <input type="text" value={widget.modalTitle} onChange={(e) => updateWidget(widget.id, 'modalTitle', e.target.value)}
                                  className={inputCls} placeholder="e.g. Course Inquiry" />
                              </div>
                              <div>
                                <label className={labelCls}>Modal Content HTML</label>
                                <div className="border border-slate-200 rounded overflow-hidden bg-white mt-1">
                                  <CKEditorField key={`modal-${widget.id}`} value={widget.modalHtml || ''} onChange={(v) => updateWidget(widget.id, 'modalHtml', v)} />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Supports raw HTML, script tags, or custom embed codes.</p>
                              </div>
                            </div>
                          )}
                          {widget.type === 'download' && (
                            <DownloadMediaSection
                              widget={widget}
                              updateWidget={updateWidget}
                            />
                          )}
                          {widget.type === 'npf' && (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div>
                                <label className={labelCls}>NPF Widget ID</label>
                                <input type="text" value={widget.npfWidgetId || ''} onChange={(e) => updateWidget(widget.id, 'npfWidgetId', e.target.value)}
                                  className={inputCls} placeholder="e.g. 695d9cbd9cd5b811bb8c43badb7a9742" />
                              </div>
                              <div>
                                <label className={labelCls}>Form Flyout Title</label>
                                <input type="text" value={widget.modalTitle || ''} onChange={(e) => updateWidget(widget.id, 'modalTitle', e.target.value)}
                                  className={inputCls} placeholder="e.g. Quick Enquiry" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={labelCls}>Form Height (Desktop)</label>
                                  <input type="text" value={widget.npfHeight || '400px'} onChange={(e) => updateWidget(widget.id, 'npfHeight', e.target.value)}
                                    className={inputCls} placeholder="e.g. 400px" />
                                </div>
                                <div>
                                  <label className={labelCls}>Form Height (Mobile Phone)</label>
                                  <input type="text" value={widget.npfHeightMobile || ''} onChange={(e) => updateWidget(widget.id, 'npfHeightMobile', e.target.value)}
                                    className={inputCls} placeholder="e.g. 350px (Optional)" />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <label className={labelCls}>Form Scale (Desktop)</label>
                                    <span className="text-[10px] font-semibold text-blue-600">{Math.round((widget.npfScale ?? 0.9) * 100)}%</span>
                                  </div>
                                  <input type="range" min="0.6" max="1.0" step="0.05" value={widget.npfScale ?? 0.9}
                                    onChange={(e) => updateWidget(widget.id, 'npfScale', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <label className={labelCls}>Form Scale (Mobile Phone)</label>
                                    <span className="text-[10px] font-semibold text-blue-600">{Math.round((widget.npfScaleMobile ?? 0.85) * 100)}%</span>
                                  </div>
                                  <input type="range" min="0.6" max="1.0" step="0.05" value={widget.npfScaleMobile ?? 0.85}
                                    onChange={(e) => updateWidget(widget.id, 'npfScaleMobile', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-700">Open on Desktop</p>
                                    <p className="text-[9px] text-slate-400">Open by default on big screens.</p>
                                  </div>
                                  <button type="button" onClick={() => updateWidget(widget.id, 'npfDefaultOpenDesktop', widget.npfDefaultOpenDesktop !== false ? false : true)}
                                    className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                                    style={{ background: widget.npfDefaultOpenDesktop !== false ? '#2563eb' : '#cbd5e1' }}>
                                    <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                                      style={{ transform: widget.npfDefaultOpenDesktop !== false ? 'translateX(16px)' : 'translateX(0)' }} />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-700">Open on Mobile</p>
                                    <p className="text-[9px] text-slate-400">Open by default on phones.</p>
                                  </div>
                                  <button type="button" onClick={() => updateWidget(widget.id, 'npfDefaultOpenMobile', widget.npfDefaultOpenMobile ? false : true)}
                                    className="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                                    style={{ background: widget.npfDefaultOpenMobile ? '#2563eb' : '#cbd5e1' }}>
                                    <span className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform"
                                      style={{ transform: widget.npfDefaultOpenMobile ? 'translateX(16px)' : 'translateX(0)' }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* FAB — Add Widget (fixed to viewport bottom-right) */}
      <div ref={dropdownRef}>
        {showAddDropdown && (
          <div className="fixed bottom-20 right-6 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 overflow-hidden">
            {[
              { style: 'button', icon: <Layout className="w-3.5 h-3.5 text-blue-500" />, label: 'Sidebar Button' },
              { style: 'floating-button', icon: <Layout className="w-3.5 h-3.5 text-sky-500" />, label: 'Floating Pill Button' },
              { style: 'bubble', icon: <MousePointer className="w-3.5 h-3.5 text-amber-500" />, label: 'Action Bubble' },
              { style: 'social-strip', icon: <MousePointer className="w-3.5 h-3.5 text-emerald-500" />, label: 'Social Strip' },
              { style: 'custom', icon: <Sliders className="w-3.5 h-3.5 text-purple-500" />, label: 'Custom HTML' },
            ].map(({ style, icon, label }) => (
              <button key={style} type="button" onClick={() => addWidget(style as any)}
                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 font-medium transition-colors">
                {icon}{label}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setShowAddDropdown(!showAddDropdown)}
          title="Add Widget"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full shadow-lg text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Confirm Delete */}
      {confirmDelete && <ConfirmDeleteModal confirmDelete={confirmDelete} onClose={() => setConfirmDelete(null)} />}
    </div>
  );
}

function DownloadMediaSection({ widget, updateWidget }: {
  widget: WidgetItem;
  updateWidget: (id: string, key: string, value: any) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3">
      <div>
        <label className="block text-[10px] font-medium text-slate-500 mb-1">Download File</label>
        {widget.downloadMediaUrl ? (
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
            <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-xs text-slate-700 truncate flex-1">{widget.downloadMediaName || widget.downloadMediaUrl}</span>
            <button
              type="button"
              onClick={() => {
                updateWidget(widget.id, 'downloadMediaUrl', '');
                updateWidget(widget.id, 'downloadMediaName', '');
              }}
              className="p-0.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-slate-200 rounded text-xs text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Pick from Media Library
          </button>
        )}
      </div>
      {widget.downloadMediaUrl && (
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-1">Download Filename (optional)</label>
          <input
            type="text"
            value={widget.downloadMediaName || ''}
            onChange={(e) => updateWidget(widget.id, 'downloadMediaName', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            placeholder="e.g. Ganpat University Brochure.pdf"
          />
          <p className="text-[10px] text-slate-400 mt-1">Leave blank to use the original filename.</p>
        </div>
      )}
      {showPicker && (
        <MediaPicker
          currentUrl={widget.downloadMediaUrl}
          onSelect={(url, item) => {
            updateWidget(widget.id, 'downloadMediaUrl', url);
            updateWidget(widget.id, 'downloadMediaName', item?.originalName || '');
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          filter="all"
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({ confirmDelete, onClose }: {
  confirmDelete: { title: string; message: string; onConfirm: () => void };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{confirmDelete.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{confirmDelete.message}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
          <button type="button" onClick={() => { confirmDelete.onConfirm(); onClose(); }}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}
