'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MediaPicker from '@/components/admin/MediaPicker';

interface NavLink { label: string; href: string; external?: boolean; children?: NavLink[]; }
interface FooterCol { heading: string; links: NavLink[]; }
interface Social { platform: string; url: string; }

interface HeaderData {
  siteName: string;
  subheading?: string;
  logoUrl: string;
  logoSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  navLinks: NavLink[];
  ctaLabel: string;
  ctaUrl: string;
}

interface FooterData {
  tagline: string;
  copyright: string;
  logoUrl?: string;
  logoSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  columns: FooterCol[];
  socials: Social[];
}

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showFooterLogoPicker, setShowFooterLogoPicker] = useState(false);
  
  const [header, setHeader] = useState<HeaderData>({
    siteName: '19th Convocation', subheading: 'Ganpat University', logoUrl: '', logoSize: 'md', navLinks: [], ctaLabel: '', ctaUrl: ''
  });
  
  const [footer, setFooter] = useState<FooterData>({
    tagline: '', copyright: '', logoUrl: '', logoSize: 'md', columns: [], socials: []
  });

  // Concurrency states
  const [lastUpdatedHeader, setLastUpdatedHeader] = useState<string | null>(null);
  const [lastUpdatedFooter, setLastUpdatedFooter] = useState<string | null>(null);
  const [hasExternalChanges, setHasExternalChanges] = useState(false);

  const lastUpdatedHeaderRef = useRef<string | null>(null);
  const lastUpdatedFooterRef = useRef<string | null>(null);

  useEffect(() => {
    lastUpdatedHeaderRef.current = lastUpdatedHeader;
    lastUpdatedFooterRef.current = lastUpdatedFooter;
  }, [lastUpdatedHeader, lastUpdatedFooter]);

  const fetchGlobal = useCallback(async (isReloading = false) => {
    if (isReloading) setLoadingChanges(true);
    try {
      const res = await fetch('/api/global');
      if (res.ok) {
        const data = await res.json();
        if (data.header) setHeader(data.header);
        if (data.footer) setFooter(data.footer);
        setLastUpdatedHeader(data.lastUpdatedHeader);
        setLastUpdatedFooter(data.lastUpdatedFooter);
        setHasExternalChanges(false);
        if (isReloading) toast.success('Latest settings loaded');
      }
    } catch {
      toast.error('Failed to load global settings');
    } finally {
      setLoading(false);
      setLoadingChanges(false);
    }
  }, []);

  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  // Polling listener
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/global/status');
        if (res.ok) {
          const data = await res.json();
          const dbHeaderTime = data.lastUpdatedHeader ? new Date(data.lastUpdatedHeader).getTime() : 0;
          const clientHeaderTime = lastUpdatedHeaderRef.current ? new Date(lastUpdatedHeaderRef.current).getTime() : 0;
          
          const dbFooterTime = data.lastUpdatedFooter ? new Date(data.lastUpdatedFooter).getTime() : 0;
          const clientFooterTime = lastUpdatedFooterRef.current ? new Date(lastUpdatedFooterRef.current).getTime() : 0;

          if (dbHeaderTime > clientHeaderTime || dbFooterTime > clientFooterTime) {
            setHasExternalChanges(true);
          } else {
            setHasExternalChanges(false);
          }
        }
      } catch (e) {
        console.error('Failed to poll global status:', e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header,
          footer,
          lastUpdatedHeader,
          lastUpdatedFooter,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Global settings saved');
        if (data.lastUpdatedHeader) setLastUpdatedHeader(data.lastUpdatedHeader);
        if (data.lastUpdatedFooter) setLastUpdatedFooter(data.lastUpdatedFooter);
        setHasExternalChanges(false);
      } else {
        if (res.status === 409) {
          toast.error(data.error || 'Conflict error saving settings', { duration: 8000 });
          setHasExternalChanges(true);
        } else {
          toast.error(data.error || 'Failed to save settings');
        }
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const moveLink = (index: number, dir: 'up' | 'down') => {
    const nl = [...header.navLinks];
    const ti = dir === 'up' ? index - 1 : index + 1;
    if (ti < 0 || ti >= nl.length) return;
    [nl[index], nl[ti]] = [nl[ti], nl[index]];
    setHeader({ ...header, navLinks: nl });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading global settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <h1 className="text-sm font-semibold text-slate-800">Global Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-60"
          style={{ background: '#2563eb' }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Real-time Poll Warning Banner */}
      {hasExternalChanges && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4 flex-shrink-0 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Note:</strong> Another user has saved updates to the global settings. To load their changes, click the update button.
            </span>
          </div>
          <button
            onClick={() => fetchGlobal(true)}
            disabled={loadingChanges}
            className="flex-shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {loadingChanges ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Load Latest Settings
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 border-b border-slate-200 bg-white">
        <div className="flex gap-4">
          {(['header', 'footer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab} Navigation
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl">
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Branding & CTA</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={header.siteName}
                    onChange={(e) => setHeader({ ...header, siteName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Site Subheading</label>
                  <input
                    type="text"
                    value={header.subheading || ''}
                    onChange={(e) => setHeader({ ...header, subheading: e.target.value })}
                    placeholder="Executive Leadership Platform"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Logo Size</label>
                  <select
                    value={header.logoSize || 'md'}
                    onChange={(e) => setHeader({ ...header, logoSize: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="xs">XS (Extra Small)</option>
                    <option value="sm">SM (Small)</option>
                    <option value="md">MD (Medium - Default)</option>
                    <option value="lg">LG (Large)</option>
                    <option value="xl">XL (Extra Large)</option>
                    <option value="xxl">XXL (Double Extra Large)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Logo (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={header.logoUrl}
                      onChange={(e) => setHeader({ ...header, logoUrl: e.target.value })}
                      placeholder="/assets/logo.png"
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLogoPicker(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition-colors"
                    >
                      Browse Library
                    </button>
                    {header.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setHeader({ ...header, logoUrl: '' })}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium border border-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {header.logoUrl && (
                    <div className="mt-2 p-2 border border-slate-100 rounded bg-slate-50 w-fit max-w-[200px]">
                      <p className="text-[9px] text-slate-400 mb-1">Logo Preview:</p>
                      <img src={header.logoUrl} alt="Logo Preview" className="h-8 w-auto object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Call to Action Label</label>
                  <input
                    type="text"
                    value={header.ctaLabel}
                    onChange={(e) => setHeader({ ...header, ctaLabel: e.target.value })}
                    placeholder="Contact"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Call to Action URL</label>
                  <input
                    type="text"
                    value={header.ctaUrl}
                    onChange={(e) => setHeader({ ...header, ctaUrl: e.target.value })}
                    placeholder="/contact"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Navigation Links</h3>
              <div className="space-y-4">
                {header.navLinks.map((link, i) => (
                  <div key={i} className="border border-slate-100 rounded p-3 bg-slate-50/50 space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveLink(i, 'up')} disabled={i === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveLink(i, 'down')} disabled={i === header.navLinks.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                      </div>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const nl = [...header.navLinks];
                          nl[i].label = e.target.value;
                          setHeader({ ...header, navLinks: nl });
                        }}
                        placeholder="Label (e.g. About)"
                        className="w-1/3 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => {
                          const nl = [...header.navLinks];
                          nl[i].href = e.target.value;
                          setHeader({ ...header, navLinks: nl });
                        }}
                        placeholder="URL (e.g. /about)"
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                      <button
                        onClick={() => {
                          const nl = header.navLinks.filter((_, idx) => idx !== i);
                          setHeader({ ...header, navLinks: nl });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Submenu Children Section */}
                    <div className="pl-8 border-l border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submenu Links (Dropdown)</div>
                      {(link.children || []).map((sub, si) => (
                        <div key={si} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={sub.label}
                            onChange={(e) => {
                              const nl = [...header.navLinks];
                              if (!nl[i].children) nl[i].children = [];
                              nl[i].children![si].label = e.target.value;
                              setHeader({ ...header, navLinks: nl });
                            }}
                            placeholder="Sub-link Label"
                            className="w-1/3 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                          <input
                            type="text"
                            value={sub.href}
                            onChange={(e) => {
                              const nl = [...header.navLinks];
                              if (!nl[i].children) nl[i].children = [];
                              nl[i].children![si].href = e.target.value;
                              setHeader({ ...header, navLinks: nl });
                            }}
                            placeholder="Sub-link URL"
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                          <button
                            onClick={() => {
                              const nl = [...header.navLinks];
                              nl[i].children = nl[i].children!.filter((_, sIdx) => sIdx !== si);
                              setHeader({ ...header, navLinks: nl });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const nl = [...header.navLinks];
                          if (!nl[i].children) nl[i].children = [];
                          nl[i].children!.push({ label: '', href: '' });
                          setHeader({ ...header, navLinks: nl });
                        }}
                        className="inline-flex items-center gap-1 text-[9px] text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded border border-dashed border-blue-200 transition-all mt-1"
                      >
                        <Plus className="w-3 h-3" /> Add Submenu Link
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setHeader({ ...header, navLinks: [...header.navLinks, { label: '', href: '', children: [] }] })}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center mt-2"
                >
                  <Plus className="w-3 h-3" /> Add Main Link
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Footer Text</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Tagline</label>
                  <textarea
                    value={footer.tagline}
                    onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                    rows={2}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Copyright Line</label>
                  <input
                    type="text"
                    value={footer.copyright}
                    onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Footer Logo</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Logo Size</label>
                  <select
                    value={footer.logoSize || 'md'}
                    onChange={(e) => setFooter({ ...footer, logoSize: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="xs">XS (Extra Small)</option>
                    <option value="sm">SM (Small)</option>
                    <option value="md">MD (Medium - Default)</option>
                    <option value="lg">LG (Large)</option>
                    <option value="xl">XL (Extra Large)</option>
                    <option value="xxl">XXL (Double Extra Large)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Logo (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={footer.logoUrl || ''}
                      onChange={(e) => setFooter({ ...footer, logoUrl: e.target.value })}
                      placeholder="/assets/logo.png"
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFooterLogoPicker(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition-colors"
                    >
                      Browse Library
                    </button>
                    {footer.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFooter({ ...footer, logoUrl: '' })}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium border border-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {footer.logoUrl && (
                    <div className="mt-2 p-2 border border-slate-100 rounded bg-slate-50 w-fit max-w-[200px]">
                      <p className="text-[9px] text-slate-400 mb-1">Logo Preview:</p>
                      <img src={footer.logoUrl} alt="Footer Logo Preview" className="h-8 w-auto object-contain bg-slate-800 p-1 rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Footer Columns</h3>
              <div className="grid grid-cols-2 gap-4">
                {footer.columns.map((col, ci) => (
                  <div key={ci} className="border border-slate-100 rounded p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={col.heading}
                        onChange={(e) => {
                          const nc = [...footer.columns];
                          nc[ci].heading = e.target.value;
                          setFooter({ ...footer, columns: nc });
                        }}
                        placeholder="Column Heading"
                        className="w-3/4 px-2 py-1 border border-slate-200 rounded text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setFooter({ ...footer, columns: footer.columns.filter((_, i) => i !== ci) })}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {col.links.map((link, li) => (
                        <div key={li} className="flex gap-1">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const nc = [...footer.columns];
                              nc[ci].links[li].label = e.target.value;
                              setFooter({ ...footer, columns: nc });
                            }}
                            placeholder="Label"
                            className="w-1/2 px-2 py-1 text-[10px] border border-slate-200 rounded focus:outline-none"
                          />
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => {
                              const nc = [...footer.columns];
                              nc[ci].links[li].href = e.target.value;
                              setFooter({ ...footer, columns: nc });
                            }}
                            placeholder="URL"
                            className="w-1/2 px-2 py-1 text-[10px] border border-slate-200 rounded focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const nc = [...footer.columns];
                              nc[ci].links = nc[ci].links.filter((_, i) => i !== li);
                              setFooter({ ...footer, columns: nc });
                            }}
                            className="p-1 text-slate-300 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const nc = [...footer.columns];
                          nc[ci].links.push({ label: '', href: '' });
                          setFooter({ ...footer, columns: nc });
                        }}
                        className="text-[10px] text-slate-500 hover:text-blue-600 px-2 py-1 rounded border border-dashed border-slate-200 w-full"
                      >
                        + Add Link
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setFooter({ ...footer, columns: [...footer.columns, { heading: 'New Column', links: [] }] })}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded p-4 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Add Column</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded p-4">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">Social Links</h3>
              <div className="space-y-2">
                {footer.socials.map((social, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={social.platform}
                      onChange={(e) => {
                        const ns = [...footer.socials];
                        ns[i].platform = e.target.value;
                        setFooter({ ...footer, socials: ns });
                      }}
                      className="w-32 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="twitter">Twitter / X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => {
                        const ns = [...footer.socials];
                        ns[i].url = e.target.value;
                        setFooter({ ...footer, socials: ns });
                      }}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setFooter({ ...footer, socials: footer.socials.filter((_, idx) => idx !== i) })}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFooter({ ...footer, socials: [...footer.socials, { platform: 'linkedin', url: '' }] })}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded border border-dashed border-slate-200 hover:border-blue-300 transition-all w-full justify-center mt-2"
                >
                  <Plus className="w-3 h-3" /> Add Social Link
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {showLogoPicker && (
        <MediaPicker
          filter="image"
          onSelect={(url) => {
            setHeader({ ...header, logoUrl: url });
            setShowLogoPicker(false);
          }}
          onClose={() => setShowLogoPicker(false)}
        />
      )}

      {showFooterLogoPicker && (
        <MediaPicker
          filter="image"
          onSelect={(url) => {
            setFooter({ ...footer, logoUrl: url });
            setShowFooterLogoPicker(false);
          }}
          onClose={() => setShowFooterLogoPicker(false)}
        />
      )}
    </div>
  );
}
