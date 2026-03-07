'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { typography, spacing } from '@/styles/page-consistency';
import { toast } from '@/hooks/use-toast';

interface ApplicationRecord {
  id: string;
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  colaNumber?: string;
  approvalDate?: string;
}

type EntryMode = 'manual' | 'batch';

type FormDataState = {
  brandName: string;
  colaNumber: string;
  alcoholByVolume: string;
  netContents: string;
  producerName: string;
  approvalDate: string;
};

type FormErrors = Partial<Record<keyof FormDataState, string>>;

type ImportCandidate = {
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  colaNumber?: string;
  approvalDate?: string;
};

type ImportFailure = {
  row: number;
  reason: string;
};

type ImportSummary = {
  fileName: string;
  total: number;
  created: number;
  failed: number;
  failures: ImportFailure[];
} | null;

type BatchCreateResponse = {
  total: number;
  created: number;
  failed: number;
  failures: ImportFailure[];
  applications: Array<{ id: string; brandName: string; colaNumber?: string }>;
};

function downloadImportFailuresCsv(summary: NonNullable<ImportSummary>): void {
  const headers = ['row', 'reason'];
  const rows = summary.failures.map((failure) => [String(failure.row), failure.reason]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeBaseName = summary.fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-');

  link.href = url;
  link.download = `${safeBaseName || 'batch-import'}-errors.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCsvTemplate(): void {
  const headers = [
    'brandName',
    'alcoholByVolume',
    'netContents',
    'producerName',
    'colaNumber',
    'approvalDate',
  ];
  const exampleRow = [
    'Premium Craft Beer',
    '5.5',
    '12 fl oz',
    'ABC Brewery',
    'COLA-2024-001',
    '2024-03-01',
  ];
  const csv = [headers.join(','), exampleRow.join(',')].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'application-batch-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJsonTemplate(): void {
  const template = {
    applications: [
      {
        brandName: 'Premium Craft Beer',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        producerName: 'ABC Brewery',
        colaNumber: 'COLA-2024-001',
        approvalDate: '2024-03-01',
      },
    ],
  };

  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'application-batch-template.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const GOVERNMENT_WARNING_TEXT =
  'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

const INITIAL_FORM: FormDataState = {
  brandName: '',
  colaNumber: '',
  alcoholByVolume: '',
  netContents: '',
  producerName: '',
  approvalDate: '',
};

const REQUIRED_BATCH_COLUMNS = ['brandName', 'alcoholByVolume', 'netContents', 'producerName'];

const normalizeHeader = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '');

const headerAliases: Record<string, keyof FormDataState> = {
  brandname: 'brandName',
  brand: 'brandName',
  colaid: 'colaNumber',
  colanumber: 'colaNumber',
  cola: 'colaNumber',
  alcoholbyvolume: 'alcoholByVolume',
  abv: 'alcoholByVolume',
  netcontents: 'netContents',
  contents: 'netContents',
  producername: 'producerName',
  producer: 'producerName',
  importer: 'producerName',
  approvaldate: 'approvalDate',
  approveddate: 'approvalDate',
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const normalizedHeaders = rawHeaders.map(
    (header) => headerAliases[normalizeHeader(header)] || ''
  );

  const rows: Array<Record<string, string>> = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const values = parseCsvLine(lines[lineIndex]);
    const row: Record<string, string> = {};

    normalizedHeaders.forEach((header, headerIndex) => {
      if (!header) {
        return;
      }
      row[header] = values[headerIndex] ?? '';
    });

    rows.push(row);
  }

  return rows;
}

function validateBrandName(value: string): string | null {
  if (!value.trim()) {
    return 'Please enter the brand name.';
  }
  if (value.trim().length < 2) {
    return 'Brand name should be at least 2 characters.';
  }
  return null;
}

function validateAbv(value: string): string | null {
  if (!value.trim()) {
    return 'Please enter ABV.';
  }

  const abv = Number(value);
  if (Number.isNaN(abv)) {
    return 'ABV must be a number (for example 5.5).';
  }

  if (abv < 0 || abv > 100) {
    return 'ABV must be between 0 and 100.';
  }

  return null;
}

function validateNetContents(value: string): string | null {
  if (!value.trim()) {
    return 'Please enter net contents (for example 12 fl oz).';
  }
  return null;
}

function validateProducerName(value: string): string | null {
  if (!value.trim()) {
    return 'Please enter producer or importer name.';
  }
  return null;
}

function validateApprovalDate(value: string): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Approval date is not valid.';
  }

  const now = new Date();
  if (parsedDate.getTime() > now.getTime()) {
    return 'Approval date cannot be in the future.';
  }

  return null;
}

function validateForm(formData: FormDataState): FormErrors {
  const errors: FormErrors = {};

  const brandNameError = validateBrandName(formData.brandName);
  if (brandNameError) {
    errors.brandName = brandNameError;
  }

  const abvError = validateAbv(formData.alcoholByVolume);
  if (abvError) {
    errors.alcoholByVolume = abvError;
  }

  const netContentsError = validateNetContents(formData.netContents);
  if (netContentsError) {
    errors.netContents = netContentsError;
  }

  const producerNameError = validateProducerName(formData.producerName);
  if (producerNameError) {
    errors.producerName = producerNameError;
  }

  const approvalDateError = validateApprovalDate(formData.approvalDate);
  if (approvalDateError) {
    errors.approvalDate = approvalDateError;
  }

  return errors;
}

function normalizeImportedRow(row: Record<string, string>): ImportCandidate {
  const alcoholByVolume = Number((row.alcoholByVolume || '').trim());

  return {
    brandName: (row.brandName || '').trim(),
    alcoholByVolume,
    netContents: (row.netContents || '').trim(),
    producerName: (row.producerName || '').trim(),
    colaNumber: (row.colaNumber || '').trim() || undefined,
    approvalDate: (row.approvalDate || '').trim() || undefined,
  };
}

function validateImportedCandidate(candidate: ImportCandidate): string | null {
  if (!candidate.brandName) {
    return 'Missing brandName';
  }

  if (
    Number.isNaN(candidate.alcoholByVolume) ||
    candidate.alcoholByVolume < 0 ||
    candidate.alcoholByVolume > 100
  ) {
    return 'ABV must be between 0 and 100';
  }

  if (!candidate.netContents) {
    return 'Missing netContents';
  }

  if (!candidate.producerName) {
    return 'Missing producerName';
  }

  if (candidate.approvalDate) {
    const parsedDate = new Date(candidate.approvalDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Invalid approvalDate';
    }
  }

  return null;
}

export default function ApplicationFormPage(): JSX.Element {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [mode, setMode] = useState<EntryMode>('manual');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [importingBatch, setImportingBatch] = useState(false);

  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FormDataState, boolean>>>(
    {}
  );

  const [selectedFileName, setSelectedFileName] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary>(null);

  const visibleErrors = useMemo(() => {
    const nextVisibleErrors: FormErrors = {};
    const nextErrors = validateForm(formData);

    (Object.keys(nextErrors) as Array<keyof FormDataState>).forEach((key) => {
      if (touchedFields[key]) {
        nextVisibleErrors[key] = nextErrors[key];
      }
    });

    return nextVisibleErrors;
  }, [formData, touchedFields]);

  const loadApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as ApplicationRecord[];
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast({
        title: 'Could not load applications',
        description: 'Please make sure the API is running, then refresh this page.',
        variant: 'destructive',
      });
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const handleFieldChange = (key: keyof FormDataState, value: string) => {
    const nextValue = key === 'colaNumber' ? value.toUpperCase() : value;
    const nextFormData = { ...formData, [key]: nextValue };

    setFormData(nextFormData);
  };

  const handleFieldBlur = (key: keyof FormDataState) => {
    setTouchedFields((previous) => ({ ...previous, [key]: true }));
  };

  const submitManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm(formData);
    setTouchedFields({
      brandName: true,
      alcoholByVolume: true,
      netContents: true,
      producerName: true,
      approvalDate: true,
    });
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Please review highlighted fields',
        description: 'A few entries need to be fixed before we can save this application.',
        variant: 'warning',
      });
      return;
    }

    setSubmittingManual(true);

    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brandName.trim(),
          colaNumber: formData.colaNumber.trim() || undefined,
          alcoholByVolume: Number(formData.alcoholByVolume),
          netContents: formData.netContents.trim(),
          producerName: formData.producerName.trim(),
          approvalDate: formData.approvalDate || undefined,
          governmentWarning: GOVERNMENT_WARNING_TEXT,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `Failed with status ${response.status}`);
      }

      const createdApplication = (await response.json()) as ApplicationRecord;
      setApplications((previous) => [createdApplication, ...previous]);
      setFormData(INITIAL_FORM);
      setTouchedFields({});

      toast({
        title: 'Application saved',
        description: 'The new application was added successfully.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: 'Could not save application',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingManual(false);
    }
  };

  const processImportRows = async (
    fileName: string,
    rawRows: Array<Record<string, string>>,
    rowOffset: number
  ): Promise<void> => {
    const payload = {
      applications: rawRows.map((row, index) => {
        const candidate = normalizeImportedRow(row);
        return {
          ...candidate,
          rowNumber: index + rowOffset,
          governmentWarning: GOVERNMENT_WARNING_TEXT,
        };
      }),
    };

    const response = await fetch(`${API_BASE_URL}/applications/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Batch import failed with status ${response.status}`);
    }

    const batchResult = (await response.json()) as BatchCreateResponse;

    const clientFailures: ImportFailure[] = [];

    rawRows.forEach((row, index) => {
      const rowNumber = index + rowOffset;
      const candidate = normalizeImportedRow(row);
      const clientError = validateImportedCandidate(candidate);

      if (clientError) {
        clientFailures.push({ row: rowNumber, reason: clientError });
      }
    });

    const mergedFailures: ImportFailure[] = [
      ...clientFailures,
      ...batchResult.failures.filter(
        (failure) => !clientFailures.some((item) => item.row === failure.row)
      ),
    ];

    const summary: ImportSummary = {
      fileName,
      total: rawRows.length,
      created: batchResult.created,
      failed: mergedFailures.length,
      failures: mergedFailures.sort((left, right) => left.row - right.row),
    };

    setImportSummary(summary);

    if (batchResult.created > 0) {
      await loadApplications();
    }

    if (mergedFailures.length === 0) {
      toast({
        title: 'Batch import completed',
        description: `${batchResult.created} applications were added successfully.`,
        variant: 'success',
      });
      return;
    }

    toast({
      title: 'Batch import completed with issues',
      description: `${batchResult.created} added, ${mergedFailures.length} skipped. Check the row report below.`,
      variant: 'warning',
    });
  };

  const handleBatchFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportSummary(null);
    setSelectedFileName(file.name);
    setImportingBatch(true);

    try {
      const text = await file.text();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      let rawRows: Array<Record<string, string>> = [];

      if (fileExtension === 'json') {
        const parsed = JSON.parse(text) as unknown;
        const list = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === 'object' && 'applications' in parsed
            ? (parsed as { applications?: unknown[] }).applications || []
            : [];

        if (!Array.isArray(list)) {
          throw new Error('JSON must be an array of application objects.');
        }

        rawRows = list.map((entry) => {
          const record = (entry || {}) as Record<string, unknown>;
          return {
            brandName: String(record.brandName ?? ''),
            colaNumber: String(record.colaNumber ?? ''),
            alcoholByVolume: String(record.alcoholByVolume ?? ''),
            netContents: String(record.netContents ?? ''),
            producerName: String(record.producerName ?? ''),
            approvalDate: String(record.approvalDate ?? ''),
          };
        });
      } else if (fileExtension === 'csv') {
        rawRows = parseCsv(text);
      } else {
        throw new Error('Please upload a .csv or .json file.');
      }

      if (rawRows.length === 0) {
        throw new Error('No valid rows were found. Please check your file format.');
      }

      const firstRow = rawRows[0] || {};
      const hasRequiredColumns = REQUIRED_BATCH_COLUMNS.every((column) =>
        Object.prototype.hasOwnProperty.call(firstRow, column)
      );

      if (!hasRequiredColumns) {
        throw new Error(
          'Missing required columns. Use: brandName, alcoholByVolume, netContents, producerName.'
        );
      }

      const rowOffset = fileExtension === 'csv' ? 2 : 1;
      await processImportRows(file.name, rawRows, rowOffset);
    } catch (error) {
      console.error('Batch import failed:', error);
      const message = error instanceof Error ? error.message : 'Unable to import this file.';
      toast({
        title: 'Import failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
      setImportingBatch(false);
    }
  };

  return (
    <div className={`bg-white ${spacing.pageVertical}`}>
      <div className={spacing.pageContainer}>
        <div className={spacing.headerSection}>
          <div className="text-center">
            <h1 className={typography.pageTitle}>Application Data Entry</h1>
            <p className={typography.pageSubtitle}>
              Add one application manually, or upload a CSV/JSON file to add many at once.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="border-b border-slate-200">
            <div className="flex gap-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'manual'}
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                  mode === 'manual'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-5 w-5" />
                Manual Entry
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'batch'}
                onClick={() => setMode('batch')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                  mode === 'batch'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="h-5 w-5" />
                Batch Upload
              </button>
            </div>
          </div>
        </div>

        {mode === 'manual' ? (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Manual Application Entry</CardTitle>
              <CardDescription>
                Fill in the fields below. Friendly prompts will help if anything looks off.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={submitManual} noValidate>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="app-brand">Brand Name *</Label>
                    <Input
                      id="app-brand"
                      placeholder="Premium Craft Beer"
                      value={formData.brandName}
                      onChange={(event) => handleFieldChange('brandName', event.target.value)}
                      onBlur={() => handleFieldBlur('brandName')}
                      aria-invalid={Boolean(visibleErrors.brandName)}
                    />
                    {visibleErrors.brandName && (
                      <p className="text-sm text-red-600">{visibleErrors.brandName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cola-id">COLA ID (optional)</Label>
                    <Input
                      id="cola-id"
                      placeholder="COLA-2024-001"
                      value={formData.colaNumber}
                      onChange={(event) => handleFieldChange('colaNumber', event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      We automatically convert this to uppercase.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="app-abv">ABV (%) *</Label>
                    <Input
                      id="app-abv"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="5.5"
                      value={formData.alcoholByVolume}
                      onChange={(event) => handleFieldChange('alcoholByVolume', event.target.value)}
                      onBlur={() => handleFieldBlur('alcoholByVolume')}
                      aria-invalid={Boolean(visibleErrors.alcoholByVolume)}
                    />
                    {visibleErrors.alcoholByVolume && (
                      <p className="text-sm text-red-600">{visibleErrors.alcoholByVolume}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-contents">Net Contents *</Label>
                    <Input
                      id="app-contents"
                      placeholder="12 fl oz"
                      value={formData.netContents}
                      onChange={(event) => handleFieldChange('netContents', event.target.value)}
                      onBlur={() => handleFieldBlur('netContents')}
                      aria-invalid={Boolean(visibleErrors.netContents)}
                    />
                    {visibleErrors.netContents && (
                      <p className="text-sm text-red-600">{visibleErrors.netContents}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-producer">Producer/Importer *</Label>
                  <Input
                    id="app-producer"
                    placeholder="ABC Brewery"
                    value={formData.producerName}
                    onChange={(event) => handleFieldChange('producerName', event.target.value)}
                    onBlur={() => handleFieldBlur('producerName')}
                    aria-invalid={Boolean(visibleErrors.producerName)}
                  />
                  {visibleErrors.producerName && (
                    <p className="text-sm text-red-600">{visibleErrors.producerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approval-date">Approval Date (optional)</Label>
                  <Input
                    id="approval-date"
                    type="date"
                    value={formData.approvalDate}
                    onChange={(event) => handleFieldChange('approvalDate', event.target.value)}
                    onBlur={() => handleFieldBlur('approvalDate')}
                    aria-invalid={Boolean(visibleErrors.approvalDate)}
                  />
                  {visibleErrors.approvalDate && (
                    <p className="text-sm text-red-600">{visibleErrors.approvalDate}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submittingManual} className="w-full sm:w-auto">
                    {submittingManual ? 'Saving...' : 'Save Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Batch Upload (CSV or JSON)</CardTitle>
              <CardDescription>
                Upload a file with columns/keys: brandName, alcoholByVolume, netContents,
                producerName, and optional colaNumber, approvalDate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-slate-400 hover:bg-slate-100">
                <Upload className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {importingBatch ? 'Importing file...' : 'Choose .csv or .json file'}
                </span>
                <input
                  type="file"
                  accept=".csv,.json,application/json,text/csv"
                  onChange={handleBatchFileChange}
                  disabled={importingBatch}
                  className="hidden"
                />
              </label>

              {selectedFileName && (
                <p className="text-sm text-slate-600">
                  Selected file:{' '}
                  <span className="font-medium text-slate-900">{selectedFileName}</span>
                </p>
              )}

              <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    Need a template to get started?
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">
                    Download a pre-formatted template file with all required headers and an example
                    row.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadCsvTemplate}
                    className="h-11 border-slate-300 bg-white font-medium shadow-sm hover:bg-slate-50 hover:shadow"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Download CSV Template</span>
                      <Download className="h-4 w-4" />
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadJsonTemplate}
                    className="h-11 border-slate-300 bg-white font-medium shadow-sm hover:bg-slate-50 hover:shadow"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Download JSON Template</span>
                      <Download className="h-4 w-4" />
                    </div>
                  </Button>
                </div>
              </div>

              {importSummary && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Created: {importSummary.created}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Skipped: {importSummary.failed}
                    </span>
                    <span className="text-sm text-slate-600">
                      Total rows: {importSummary.total}
                    </span>
                  </div>

                  {importSummary.failures.length > 0 && (
                    <div className="mt-3 space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <p className="font-semibold">Rows that were skipped</p>
                      {importSummary.failures.slice(0, 8).map((failure) => (
                        <p key={`${failure.row}-${failure.reason}`}>
                          Row {failure.row}: {failure.reason}
                        </p>
                      ))}
                      {importSummary.failures.length > 8 && (
                        <p>...and {importSummary.failures.length - 8} more row(s).</p>
                      )}
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8 border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                          onClick={() => downloadImportFailuresCsv(importSummary)}
                        >
                          Export Import Errors (CSV)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Current Application Dataset</CardTitle>
            <CardDescription>
              {loadingApplications
                ? 'Loading applications...'
                : `${applications.length} application${applications.length === 1 ? '' : 's'} available`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingApplications ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : applications.length === 0 ? (
              <p className="text-sm text-slate-500">No applications added yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {applications.map((application) => (
                  <li
                    key={application.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="font-medium text-slate-900">{application.brandName}</span> ·{' '}
                    {application.colaNumber || 'No COLA ID'} · {application.alcoholByVolume}% ABV ·{' '}
                    {application.netContents} · {application.producerName}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
