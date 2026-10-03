'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ExternalLink,
  Palette,
  Settings,
  Globe,
  Image as ImageIcon,
  Shield,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Content',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/pages', label: 'Pages', icon: FileText },
      { href: '/admin/media', label: 'Media', icon: ImageIcon },
      { href: '/admin/global', label: 'Global', icon: Globe },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/theme', label: 'Appearance', icon: Palette },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/admin/users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState('EDITOR');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.role) {
          setUserRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex flex-col h-full w-[220px] flex-shrink-0 bg-[#0B1120] border-r border-slate-800/80">
      {/* Logo Area */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-800/80 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow shadow-blue-500/20 flex-shrink-0">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-slate-100 text-[12px] font-semibold leading-tight truncate tracking-tight">Admin Portal</p>
          <p className="text-[10px] text-slate-400 leading-tight truncate uppercase tracking-wider mt-0.5">
            Convocation CMS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(userRole);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-200 group ${
                        active
                          ? 'bg-blue-500/10 text-blue-400 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Utilities */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
        <div className="space-y-0.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all group"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            <span>View Live Site</span>
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
            <span>{loggingOut ? 'Logging out…' : 'Log out'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
