import Link from 'next/link';
import { FOOTER_PRODUCT_LINKS } from '@/constants/routes';

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: FOOTER_PRODUCT_LINKS,
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api/docs' },
      { name: 'Getting Started', href: '/docs/getting-started' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Accessibility', href: '/accessibility' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900">TTB Label Validator</h3>
            <p className="mt-2 text-sm text-gray-600">
              AI-powered compliance validation for alcohol beverage labels.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} TTB Label Validator. Enterprise Prototype for Compliance Workflow
            Demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
}
