import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminToaster from '@/components/admin/AdminToaster';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {children}
      </div>
      <AdminToaster />
    </div>
  );
}
