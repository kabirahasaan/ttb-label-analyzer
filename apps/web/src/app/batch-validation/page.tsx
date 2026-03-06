'use client';

import { useState } from 'react';
import { Layers, Upload, FileText, Archive, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ValidationProgress,
  type ValidationStep,
  type ValidationJobStatus,
} from '@/components/ui/validation-progress';
import { toast } from '@/hooks/use-toast';

export default function BatchValidationPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const validationStepLabels = [
    'Upload Received',
    'Image Preprocessing',
    'OCR Text Extraction',
    'Field Extraction',
    'Application Data Cross Check',
    'TTB Rule Validation',
    'Compliance Report Generation',
  ];

  const initialSteps: ValidationStep[] = validationStepLabels.map((label, index) => ({
    id: `step-${index + 1}`,
    label,
    status: 'pending',
  }));

  const [loading, setLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [steps, setSteps] = useState<ValidationStep[]>(initialSteps);
  const [jobStatus, setJobStatus] = useState<ValidationJobStatus>('running');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileCount(e.target.files.length);

      if (e.target.files.length > 0) {
        toast({
          title: 'Batch upload started',
          description: 'Processing multiple labels.',
        });
      }
    }
  };

  const pollValidationProgress = async (jobId: string): Promise<ValidationJobStatus> => {
    let status: ValidationJobStatus = 'running';

    while (status === 'running') {
      const response = await fetch(`${API_BASE_URL}/validate/progress/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve validation progress');
      }

      const data = await response.json();
      setSteps(data.steps || initialSteps);
      status = data.status as ValidationJobStatus;
      setJobStatus(status);

      if (status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return status;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setJobStatus('running');
    setSteps(initialSteps);

    let result: ValidationJobStatus = 'error';

    try {
      const startResponse = await fetch(`${API_BASE_URL}/validate/progress/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: 'batch', batchSize: fileCount }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start batch validation progress job');
      }

      const startData = await startResponse.json();
      result = await pollValidationProgress(startData.jobId);
    } catch (_error) {
      result = 'error';
      setJobStatus('error');
      setSteps(
        initialSteps.map((step, index) => (index === 0 ? { ...step, status: 'error' } : step))
      );
    }

    if (result === 'success') {
      toast({
        title: 'Validation completed',
        description: 'Compliance report is ready.',
        variant: 'success',
      });
    } else if (result === 'warning') {
      toast({
        title: 'Validation completed with warnings',
        description: 'Some discrepancies were detected.',
        variant: 'warning',
      });
    } else {
      toast({
        title: 'Validation failed',
        description: 'Please check the uploaded files.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Batch Validation
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload multiple label images or CSV files for efficient batch processing
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Layers className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <CardTitle>Upload Multiple Labels</CardTitle>
                <CardDescription>
                  Upload multiple label images or CSV file for batch validation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="group relative rounded-xl border-2 border-dashed border-slate-300 p-12 text-center transition-colors hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-500 focus-within:ring-offset-2">
              <input
                type="file"
                multiple
                accept="image/*,.csv,.zip"
                onChange={handleFileSelect}
                id="batch-upload"
                className="sr-only"
                aria-label="Upload multiple files for batch validation"
              />
              <label htmlFor="batch-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                    <Upload className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-slate-700">Drag and drop files here</p>
                    <p className="text-sm text-slate-500">
                      or click to select images, CSV, or ZIP file
                    </p>
                  </div>
                  {fileCount > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                      <Layers className="h-4 w-4" />
                      <span>{fileCount} file(s) selected</span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4" />
                Supported Formats
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-slate-400" />
                  Individual images (PNG, JPG, WEBP)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  CSV file with label data
                </li>
                <li className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-slate-400" />
                  ZIP archive with multiple images
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || fileCount === 0}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50"
              size="lg"
              aria-label={loading ? 'Processing batch validation' : `Validate ${fileCount} file(s)`}
            >
              {loading ? 'Processing...' : `Validate ${fileCount} File(s)`}
            </Button>

            {loading && (
              <ValidationProgress
                title="Validation Progress"
                steps={steps}
                status={jobStatus}
                className="transition-all duration-300"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
