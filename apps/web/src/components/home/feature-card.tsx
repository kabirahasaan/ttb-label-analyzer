import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  ctaLabel: string;
}

export function FeatureCard({
  title,
  description,
  href,
  icon,
  ctaLabel,
}: FeatureCardProps): JSX.Element {
  return (
    <Card className="group h-full rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="border-none pb-3">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </CardTitle>
        <CardDescription className="mt-2 text-base leading-relaxed text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={href} className="inline-flex">
          <Button
            variant="secondary"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:ring-slate-500"
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
