'use client';

import { CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sampleResults = [
  {
    id: 'label_1',
    brand: 'Premium Craft Beer',
    status: 'COMPLIANT' as const,
    errors: [],
    warnings: [],
  },
  {
    id: 'label_2',
    brand: 'Golden Ale',
    status: 'WARNING' as const,
    errors: [],
    warnings: ['Missing government warning details'],
  },
  {
    id: 'label_3',
    brand: 'Dark Porter',
    status: 'NON_COMPLIANT' as const,
    errors: ['ABV missing', 'Producer information incomplete'],
    warnings: [],
  },
];

const statusConfig = {
  COMPLIANT: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
  },
  WARNING: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
  },
  NON_COMPLIANT: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
  },
};

export default function ValidationResultsPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Validation Results
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Review compliance reports and validation findings for your labels
          </p>
        </div>

        <div className="space-y-5">
          {sampleResults.map((result) => {
            const config = statusConfig[result.status];
            const StatusIcon = config.icon;

            return (
              <Card
                key={result.id}
                className={`border-slate-200 shadow-sm transition-shadow hover:shadow-md`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{result.brand}</h3>
                        <p className="text-sm text-slate-600">{result.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${config.badgeBg} ${config.badgeText}`}
                        role="status"
                        aria-label={`Status: ${result.status.replace('_', ' ').toLowerCase()}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {result.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div
                      className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
                      role="alert"
                      aria-labelledby={`errors-${result.id}`}
                    >
                      <h4
                        id={`errors-${result.id}`}
                        className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-900"
                      >
                        <XCircle className="h-4 w-4" />
                        Errors ({result.errors.length})
                      </h4>
                      <ul className="space-y-1.5">
                        {result.errors.map((error, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-700" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div
                      className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                      role="alert"
                      aria-labelledby={`warnings-${result.id}`}
                    >
                      <h4
                        id={`warnings-${result.id}`}
                        className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-900"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Warnings ({result.warnings.length})
                      </h4>
                      <ul className="space-y-1.5">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-yellow-700" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.errors.length === 0 && result.warnings.length === 0 && (
                    <div
                      className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                      role="status"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">All validations passed</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
