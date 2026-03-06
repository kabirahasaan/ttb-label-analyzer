import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TTB Label Compliance Validator',
  description: 'Validate alcohol beverage labels against TTB regulations',
  keywords: ['TTB', 'Label', 'Compliance', 'Validation', 'Alcohol'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Accessibility: Skip to main content link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          >
            Skip to main content
          </a>

          <header className="bg-white shadow-sm border-b border-slate-200" role="banner">
            <nav className="container py-4" aria-label="Main navigation">
              <h1 className="text-2xl font-bold text-slate-900">TTB Label Compliance Validator</h1>
              <p className="text-sm text-slate-600 mt-1">
                Validate alcohol beverage labels against TTB regulations
              </p>
            </nav>
          </header>

          <main id="main-content" className="flex-1 container py-8" role="main">
            {children}
          </main>

          <footer className="bg-white border-t border-slate-200 py-6 mt-12" role="contentinfo">
            <div className="container text-center text-sm text-slate-600">
              <p>&copy; {new Date().getFullYear()} TTB Label Analyzer. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
