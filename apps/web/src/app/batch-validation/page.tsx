'use client';

import { useState } from 'react';
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Batch Validation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Multiple Labels</CardTitle>
          <CardDescription>
            Upload multiple label images or CSV file for batch validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <input
              type="file"
              multiple
              accept="image/*,.csv,.zip"
              onChange={handleFileSelect}
              id="batch-upload"
              className="hidden"
            />
            <label htmlFor="batch-upload" className="cursor-pointer">
              <div className="text-5xl mb-2">📦</div>
              <p className="text-slate-600 font-medium">Drag and drop files here</p>
              <p className="text-sm text-slate-500 mt-1">
                or click to select images, CSV, or ZIP file
              </p>
              {fileCount > 0 && (
                <p className="text-sm text-blue-600 mt-2">{fileCount} file(s) selected</p>
              )}
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Supported Formats:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Individual images (PNG, JPG, WEBP)</li>
              <li>• CSV file with label data</li>
              <li>• ZIP archive with multiple images</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || fileCount === 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : `Validate ${fileCount} File(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
