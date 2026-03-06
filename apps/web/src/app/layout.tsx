import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TTB Label Validator',
  description: 'AI-powered compliance validation for alcohol beverage labels',
  keywords: ['TTB', 'Label', 'Compliance', 'Validation', 'Alcohol', 'COLA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
