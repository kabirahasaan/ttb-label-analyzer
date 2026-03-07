import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FieldComparisonCardProps {
  index: number;
  fieldName: string;
  expectedValue: string;
  actualValue: string;
  expectedLabel?: string;
  actualLabel?: string;
  expectedEmptyText?: string;
  actualEmptyText?: string;
  actionText?: string;
}

export function FieldComparisonCard({
  index,
  fieldName,
  expectedValue,
  actualValue,
  expectedLabel = 'Approved Application',
  actualLabel = 'Your Label',
  expectedEmptyText = '(Not specified in application)',
  actualEmptyText = '(Missing on label)',
  actionText = 'Update your label to match the approved application value',
}: FieldComparisonCardProps): JSX.Element {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
          <span className="text-xs font-bold text-amber-800">{index + 1}</span>
        </div>
        <div className="flex-1">
          <h6 className="font-semibold text-amber-900">{fieldName}</h6>
          <p className="mt-1 text-xs text-amber-700">
            The information on your label doesn&apos;t match the approved application
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-green-300 bg-green-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-green-800">
              {expectedLabel}
            </span>
          </div>
          <p className="break-words text-sm font-medium text-green-900">
            {expectedValue || expectedEmptyText}
          </p>
        </div>

        <div className="rounded-md border border-red-300 bg-red-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-red-800">
              {actualLabel}
            </span>
          </div>
          <p className="break-words text-sm font-medium text-red-900">
            {actualValue || actualEmptyText}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-white p-2 text-xs text-slate-600">
        <strong>Action needed:</strong> {actionText}
      </div>
    </div>
  );
}
