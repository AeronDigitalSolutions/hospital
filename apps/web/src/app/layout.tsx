import type { Metadata } from 'next';
import './globals.css';
import { ClientShell } from '../components/ClientShell';

export const metadata: Metadata = {
  title: 'Chikitsaalye — Enterprise Digital Healthcare OS',
  description: 'Enterprise Teaching Hospital Operating System (UPUMS)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
