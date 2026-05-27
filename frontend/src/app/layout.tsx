import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VedaAI — AI Assessment Creator',
    template: '%s | VedaAI',
  },
  description: 'Create AI-powered exam papers and assignments with structured question generation using Google Gemini.',
  keywords: ['AI assessment', 'exam generator', 'question paper', 'education', 'Gemini AI'],
  openGraph: {
    title: 'VedaAI — AI Assessment Creator',
    description: 'Generate professional exam papers with AI-powered question creation.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
