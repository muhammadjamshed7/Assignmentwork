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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem('tds-management-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'dark' || (!storedTheme && prefersDark) ? 'dark' : 'light';

    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();
`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning className="h-full antialiased font-sans flex flex-col min-h-screen">
        <PwaRegister />
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
