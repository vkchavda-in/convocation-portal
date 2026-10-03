import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'Admin Panel | Convocation CMS',
    template: '%s | Convocation Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
