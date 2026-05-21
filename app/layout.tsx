import type {Metadata} from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'EduMetrics - Admin Dashboard',
  description: 'Academic Services Admin Dashboard',
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem('edumetrics-theme');
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
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
