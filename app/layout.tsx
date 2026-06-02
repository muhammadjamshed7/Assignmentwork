import type {Metadata, Viewport} from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PwaRegister } from '@/components/pwa-register';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'TDS Management - Admin Dashboard',
  description: 'Academic Services Admin Dashboard',
  manifest: '/manifest.webmanifest',
  applicationName: 'TDS Management',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TDS Management',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080d1a',
};

const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('tds-management-theme');
    if (!theme || theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning className="h-full antialiased font-body flex flex-col min-h-screen bg-white text-gray-900 dark:bg-[#080d1a] dark:text-slate-100">
        <PwaRegister />
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
