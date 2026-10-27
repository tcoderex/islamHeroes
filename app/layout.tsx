import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Heroes of the Islam',
  description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam.',
  openGraph: {
    title: 'Heroes of the Islam',
    description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heroes of the Islam',
    description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="antialiased selection:bg-[#0067c0]/15 selection:text-[#0067c0] min-h-screen text-slate-800" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
