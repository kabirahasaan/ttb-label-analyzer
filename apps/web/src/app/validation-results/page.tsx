'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronRight,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { typography, spacing } from '@/styles/page-consistency';

interface ValidationResult {
  id: string;
  brandName: string;
  colaNumber?: string;
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

// Human-friendly field name mapping
const fieldNameMap: Record<string, string> = {
  brandName: 'Brand Name',
  alcoholByVolume: 'Alcohol by Volume (ABV)',
  netContents: 'Net Contents',
  producerName: 'Producer Name',
  governmentWarning: 'Government Warning',
  colaNumber: 'TTB COLA ID',
  classType: 'Product Type',
};

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const exportAsJSON = (data: ValidationResult | ValidationResult[], filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (data: ValidationResult[], filename: string) => {
    const headers = [
      'TTB COLA ID',
      'Brand Name',
      'Status',
      'Errors',
      'Warnings',
      'Discrepancies',
      'Validated At',
    ];
    const rows = data.map((result) => [
      result.colaNumber || 'N/A',
      result.brandName,
      result.status,
      result.errors.length.toString(),
      result.warnings.length.toString(),
      result.discrepancies?.length.toString() || '0',
      new Date(result.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportSingle = (result: ValidationResult, format: 'json' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeBrandName = result.brandName.replace(/[^a-zA-Z0-9]/g, '-');
    const colaPrefix = result.colaNumber ? `${result.colaNumber}-` : '';

    if (format === 'json') {
      exportAsJSON(result, `${colaPrefix}${safeBrandName}-validation-${timestamp}.json`);
    } else {
      exportAsCSV([result], `${colaPrefix}${safeBrandName}-validation-${timestamp}.csv`);
    }
  };

  const handleExportAll = (format: 'json' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      exportAsJSON(results, `validation-results-${timestamp}.json`);
    } else {
      exportAsCSV(results, `validation-results-${timestamp}.csv`);
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all ${results.length} validation result${results.length !== 1 ? 's' : ''}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/validate/results`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear validation results');
      }

      const result = await response.json();
      setResults([]);
      setExpandedId(null);

      console.log(`Cleared ${result.cleared} validation result(s)`);
    } catch (err) {
      console.error('Failed to clear results:', err);
      alert('Failed to clear validation results. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/validate/results?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch validation results');
      }
      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      setError('Unable to load validation results. Please try again later.');
      console.error('Failed to fetch results:', err);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    setIsRefreshing(true);
    await fetchResults();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const loadInitialResults = async () => {
      await fetchResults();
      setLoading(false);
    };

    void loadInitialResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className={`bg-white ${spacing.pageVertical}`}>
      <div className={spacing.pageContainer}>
        <div className={spacing.headerSection}>
          <div className="text-center">
            <h1 className={typography.pageTitle}>Validation Results</h1>
            <p className={typography.pageSubtitle}>
              Review compliance reports and validation findings for your labels
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Results'}
            </button>

            {results.length > 0 && (
              <>
                <div className="border-l border-slate-300 pl-3">
                  <button
                    onClick={() => handleExportAll('json')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All as JSON
                  </button>
                </div>
                <button
                  onClick={() => handleExportAll('csv')}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4" />
                  Export All as CSV
                </button>
                <div className="border-l border-slate-300 pl-3">
                  <button
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isClearing ? 'Clearing...' : 'Clear All Results'}
                  </button>
                </div>
              </>
            )}
          </div>
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

        <div className="space-y-4">
          {results.map((result) => {
            const config = statusConfig[result.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === result.id;

            return (
              <Card
                key={result.id}
                className="border-slate-200 shadow-sm transition-shadow hover:shadow-md overflow-hidden"
              >
                {/* Accordion Header - Always Visible */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => toggleAccordion(result.id)}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                      aria-expanded={isExpanded}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <StatusIcon className={`h-6 w-6 ${config.textColor}`} />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-mono text-xs font-semibold px-2.5 py-1 rounded ${
                                result.colaNumber
                                  ? 'text-blue-700 bg-blue-100'
                                  : 'text-slate-500 bg-slate-100'
                              }`}
                              title={result.colaNumber ? 'TTB COLA ID' : 'No COLA ID assigned'}
                            >
                              {result.colaNumber || 'NO-COLA-ID'}
                            </span>
                            <h3 className="text-lg font-semibold text-slate-900 truncate">
                              {result.brandName}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${config.badgeBg} ${config.badgeText}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Export Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(result, 'json');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title="Export as JSON"
                      >
                        <Download className="h-3.5 w-3.5" />
                        JSON
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSingle(result, 'csv');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                        title="Export as CSV"
                      >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accordion Content - Expandable */}
                {isExpanded && (
                  <CardContent className="px-6 pb-6 pt-0 border-t border-slate-100">
                    <div className="space-y-5 mt-5">
                      {/* Validation Date */}
                      <div className="text-sm text-slate-500">
                        Validated on{' '}
                        {new Date(result.createdAt).toLocaleString('en-US', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </div>

                      {/* Label Discrepancies */}
                      {result.discrepancies && result.discrepancies.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Label Discrepancies ({result.discrepancies.length})
                          </h4>
                          <p className="text-sm text-slate-600">
                            The following fields on the label don&apos;t match the approved
                            application:
                          </p>
                          <div className="space-y-3">
                            {result.discrepancies.map((discrepancy, idx) => {
                              const fieldDisplayName =
                                fieldNameMap[discrepancy.field] ||
                                discrepancy.field
                                  .replace(/([A-Z])/g, ' $1')
                                  .replace(/^./, (str) => str.toUpperCase())
                                  .trim();

                              return (
                                <div
                                  key={`${result.id}-discrepancy-${idx}`}
                                  className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                                >
                                  <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-600">
                                      <span className="text-xs font-bold text-white">
                                        {idx + 1}
                                      </span>
                                    </div>
                                    <h5 className="font-semibold text-amber-900">
                                      {fieldDisplayName}
                                    </h5>
                                  </div>

                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-green-300 bg-green-50 p-3">
                                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Approved Application
                                      </div>
                                      <p className="break-words text-sm text-green-900">
                                        {discrepancy.applicationValue ||
                                          '(Not specified in application)'}
                                      </p>
                                    </div>

                                    <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-700">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Found on Label
                                      </div>
                                      <p className="break-words text-sm text-red-900">
                                        {discrepancy.labelValue || '(Missing on label)'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">
                                    <strong>Action needed:</strong> Update the label to match the
                                    approved application.
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Critical Issues */}
                      {result.errors.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-red-900">
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
                                className="flex items-start gap-3 rounded-lg bg-white p-3 text-sm text-red-800"
                              >
                                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                  {idx + 1}
                                </span>
                                <span className="flex-1">{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Items to Review */}
                      {result.warnings.length > 0 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-yellow-900">
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
                                className="flex items-start gap-3 rounded-lg bg-white p-3 text-sm text-yellow-800"
                              >
                                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-600 text-xs font-bold text-white">
                                  {idx + 1}
                                </span>
                                <span className="flex-1">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* All Clear Message */}
                      {result.errors.length === 0 &&
                        result.warnings.length === 0 &&
                        (!result.discrepancies || result.discrepancies.length === 0) && (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-green-900">Perfect Match!</h4>
                                <p className="mt-1 text-sm text-green-700">
                                  This label meets all compliance requirements. All information
                                  matches the approved application.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
