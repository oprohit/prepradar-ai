import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrepRadar AI — Autonomous Placement Readiness Engine',
  description: 'Reimagine placement preparation through 4-pillar diagnostic assessment, weakness vector analysis, and adaptive sprint planning.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen bg-grid-pattern antialiased">
        {children}
      </body>
    </html>
  );
}
