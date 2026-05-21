import type {Metadata} from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'EduMetrics - Admin Dashboard',
  description: 'Academic Services Admin Dashboard',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body suppressHydrationWarning className="h-full antialiased font-sans flex flex-col min-h-screen">
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
