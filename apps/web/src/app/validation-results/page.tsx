'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sampleResults = [
  {
    id: 'label_1',
    brand: 'Premium Craft Beer',
    status: 'COMPLIANT',
    errors: [],
    warnings: [],
  },
  {
    id: 'label_2',
    brand: 'Golden Ale',
    status: 'WARNING',
    errors: [],
    warnings: ['Missing government warning details'],
  },
  {
    id: 'label_3',
    brand: 'Dark Porter',
    status: 'NON_COMPLIANT',
    errors: ['ABV missing', 'Producer information incomplete'],
    warnings: [],
  },
];

export default function ValidationResultsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Validation Results</h1>

      <div className="space-y-4">
        {sampleResults.map((result) => (
          <Card key={result.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{result.brand}</h3>
                  <p className="text-sm text-slate-600">{result.id}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'COMPLIANT'
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'WARNING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">
                    Errors ({result.errors.length}):
                  </h4>
                  <ul className="space-y-1">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                    Warnings ({result.warnings.length}):
                  </h4>
                  <ul className="space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-700">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors.length === 0 && result.warnings.length === 0 && (
                <p className="mt-4 text-sm text-green-700">✓ All validations passed</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
