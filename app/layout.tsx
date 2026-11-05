import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'islamheroes',
  description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam on islamheroes.',
  openGraph: {
    title: 'islamheroes',
    description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam on islamheroes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'islamheroes',
    description: 'Explore the noble lives, courage, and legacy of the heroes and great figures of Islam on islamheroes.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                window.addEventListener('error', function(event) {
                  if (event && (event.message === 'Script error.' || (!event.filename && !event.lineno))) {
                    event.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  if (event && event.reason && (event.reason.message === 'Script error.' || String(event.reason).includes('Script error'))) {
                    event.preventDefault();
                    return true;
                  }
                });
              })();
            `,
          }}
        />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="antialiased selection:bg-[#0067c0]/15 selection:text-[#0067c0] min-h-screen text-slate-800" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
