'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ValidationResult {
  id: string;
  brandName: string;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  errors: string[];
  warnings: string[];
  discrepancies?: Array<{
    field: string;
    labelValue: string;
    applicationValue: string;
  }>;
  createdAt: string;
}

const statusConfig = {
  COMPLIANT: {
    icon: CheckCircle2,
    label: 'Compliant',
    description: 'Meets all requirements',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
  },
  WARNING: {
    icon: AlertTriangle,
    label: 'Needs Review',
    description: 'Issues found',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
  },
  NON_COMPLIANT: {
    icon: XCircle,
    label: 'Non-Compliant',
    description: 'Failed validation',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
  },
};

export default function ValidationResultsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/validate/results`);
        if (!response.ok) {
          throw new Error('Failed to fetch validation results');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError('Unable to load validation results. Please try again later.');
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
            <p className="mt-4 text-lg text-slate-600">Loading validation results...</p>
          </div>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-3 text-lg font-medium text-red-900">{error}</p>
          </div>
        )}

        {!error && results.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No validation results yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Run a validation on the Validate Label page to see results here.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {results.map((result) => {
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
                        <h3 className="text-lg font-semibold text-slate-900">{result.brandName}</h3>
                        <p className="text-sm text-slate-600">{result.id}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(result.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${config.badgeBg} ${config.badgeText}`}
                        role="status"
                        aria-label={`Status: ${config.label}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Discrepancies - Most Important */}
                  {result.discrepancies && result.discrepancies.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Label Discrepancies ({result.discrepancies.length})
                      </h4>
                      <p className="text-sm text-slate-600">
                        These fields on the label don&apos;t match the approved application:
                      </p>
                      <div className="space-y-3">
                        {result.discrepancies.map((discrepancy, idx) => {
                          const fieldDisplayName = discrepancy.field
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();

                          return (
                            <div
                              key={`${result.id}-discrepancy-${idx}`}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
                                  <span className="text-xs font-bold text-amber-800">
                                    {idx + 1}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-amber-900">{fieldDisplayName}</h5>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded border border-green-300 bg-green-50 p-2">
                                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                                    ✓ Approved
                                  </div>
                                  <p className="break-words text-sm text-green-900">
                                    {discrepancy.applicationValue || '(Not specified)'}
                                  </p>
                                </div>

                                <div className="rounded border border-red-300 bg-red-50 p-2">
                                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                                    ✗ On Label
                                  </div>
                                  <p className="break-words text-sm text-red-900">
                                    {discrepancy.labelValue || '(Not found)'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div
                      className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
                      role="alert"
                      aria-labelledby={`errors-${result.id}`}
                    >
                      <h4
                        id={`errors-${result.id}`}
                        className="mb-3 flex items-center gap-2 text-base font-semibold text-red-900"
                      >
                        <XCircle className="h-5 w-5" />
                        Critical Issues ({result.errors.length})
                      </h4>
                      <p className="mb-3 text-sm text-red-700">
                        These issues must be resolved before the label can be approved:
                      </p>
                      <ul className="space-y-2">
                        {result.errors.map((error, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 rounded bg-white p-2 text-sm text-red-800"
                          >
                            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-900">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{error}</span>
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
                        className="mb-3 flex items-center gap-2 text-base font-semibold text-yellow-900"
                      >
                        <AlertTriangle className="h-5 w-5" />
                        Items to Review ({result.warnings.length})
                      </h4>
                      <p className="mb-3 text-sm text-yellow-700">
                        Please review these items - they may need attention:
                      </p>
                      <ul className="space-y-2">
                        {result.warnings.map((warning, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 rounded bg-white p-2 text-sm text-yellow-800"
                          >
                            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-200 text-xs font-bold text-yellow-900">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.errors.length === 0 &&
                    result.warnings.length === 0 &&
                    (!result.discrepancies || result.discrepancies.length === 0) && (
                      <div
                        className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4"
                        role="status"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-green-900">Perfect Match!</h4>
                            <p className="mt-1 text-sm text-green-700">
                              This label meets all compliance requirements. All information matches
                              the approved application.
                            </p>
                          </div>
                        </div>
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
