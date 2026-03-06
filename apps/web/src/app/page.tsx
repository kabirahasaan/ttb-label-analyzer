'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Label Upload',
    description: 'Upload and scan alcohol beverage labels',
    href: '/upload-label',
    icon: '📸',
  },
  {
    title: 'Application Form',
    description: 'Enter COLA application data',
    href: '/application-form',
    icon: '📋',
  },
  {
    title: 'Batch Validation',
    description: 'Validate multiple labels at once',
    href: '/batch-validation',
    icon: '📦',
  },
  {
    title: 'Results',
    description: 'View validation results and compliance reports',
    href: '/validation-results',
    icon: '✅',
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">TTB Label Compliance Validator</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Ensure your alcohol beverage labels comply with the latest TTB regulations. Validate
          labels, cross-check against applications, and generate compliance reports.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href}>
                <Button className="w-full" variant="default">
                  Go to {feature.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="bg-blue-50 rounded-lg p-8 border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Getting Started</h3>
        <ol className="space-y-3 text-blue-800">
          <li className="flex gap-3">
            <span className="font-bold">1.</span>
            <span>Upload your alcohol label image or enter label data manually</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold">2.</span>
            <span>Enter the corresponding COLA application data</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold">3.</span>
            <span>Run validation to check TTB compliance</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold">4.</span>
            <span>Review results and cross-check against application data</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold">5.</span>
            <span>Export compliance report</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
