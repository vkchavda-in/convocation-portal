'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import MediaPicker from '@/components/admin/MediaPicker';

interface AppSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  sessionTimeout: string;
  forceHttps: boolean;
  faviconUrl: string;
}

const defaultSettings: AppSettings = {
  siteName: '19th Convocation',
  siteDescription: '19th Convocation - Ganpat University',
  contactEmail: 'convocation@ganpatuniversity.ac.in',
  defaultMetaTitle: '19th Convocation - Ganpat University',
  defaultMetaDescription: 'Official website for the 19th Convocation of Ganpat University. Guidelines, schedules, guest biographies, layout, and logistics.',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently undergoing scheduled maintenance. Please check back soon.',
  sessionTimeout: '8h',
  forceHttps: true,
  faviconUrl: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFaviconPicker, setShowFaviconPicker] = useState(false);

  // In a real app, these would be individual Settings records in the DB
  // For this redesign, we'll store them as a single JSON object in the Settings table under key 'app_settings'
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.appSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(data.appSettings) });
        }
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSettings: JSON.stringify(settings) }),
      });
      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof AppSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          <h1 className="text-sm font-semibold text-slate-800">Site Settings</h1>
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

      <div className="p-8 max-w-3xl space-y-8">
        
        {/* General Settings */}
        <section>
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">General</h2>
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => update('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => update('siteDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Favicon (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.faviconUrl || ''}
                  onChange={(e) => update('faviconUrl', e.target.value)}
                  placeholder="/favicon.ico or uploaded image URL"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowFaviconPicker(true)}
                  className="px-4 py-2 border border-slate-200 rounded text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shrink-0"
                >
                  Choose File
                </button>
                {settings.faviconUrl && (
                  <button
                    type="button"
                    onClick={() => update('faviconUrl', '')}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded text-xs font-medium hover:bg-red-50 transition-colors shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
              {settings.faviconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-[10px] text-slate-400">Favicon Preview:</p>
                  <img src={settings.faviconUrl} alt="Favicon Preview" className="w-6 h-6 object-contain border border-slate-100 p-0.5 rounded bg-white" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEO Defaults */}
        <section>
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">SEO Defaults</h2>
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Default Meta Title</label>
              <input
                type="text"
                value={settings.defaultMetaTitle}
                onChange={(e) => update('defaultMetaTitle', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used when a page doesn&apos;t have a specific meta title set.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Default Meta Description</label>
              <textarea
                value={settings.defaultMetaDescription}
                onChange={(e) => update('defaultMetaDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Maintenance Mode */}
        <section>
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Maintenance</h2>
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-800">Maintenance Mode</h3>
                <p className="text-xs text-slate-500">When enabled, visitors will see a maintenance screen.</p>
              </div>
              <button
                type="button"
                onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ background: settings.maintenanceMode ? '#2563eb' : '#cbd5e1' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: settings.maintenanceMode ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {settings.maintenanceMode && (
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700 mb-1">Maintenance Message</label>
                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => update('maintenanceMessage', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Security</h2>
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-800">Session Timeout</h3>
                <p className="text-xs text-slate-500">How long before admin sessions expire.</p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => update('sessionTimeout', e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-800">Force HTTPS</h3>
                <p className="text-xs text-slate-500">Redirect all traffic to secure HTTPS connection.</p>
              </div>
              <button
                type="button"
                onClick={() => update('forceHttps', !settings.forceHttps)}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ background: settings.forceHttps ? '#2563eb' : '#cbd5e1' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: settings.forceHttps ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>
        </section>

      </div>
      {showFaviconPicker && (
        <MediaPicker
          onSelect={(url) => {
            update('faviconUrl', url);
            setShowFaviconPicker(false);
          }}
          onClose={() => setShowFaviconPicker(false)}
        />
      )}
    </div>
  );
}
