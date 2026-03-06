'use client';

import { useState } from 'react';
import { Layers, Upload, FileText, Archive, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BatchValidationPage() {
  const [loading, setLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileCount(e.target.files.length);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
