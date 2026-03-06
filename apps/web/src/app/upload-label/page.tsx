'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function UploadLabelPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Upload Label
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Upload a label image for OCR extraction or enter label data manually
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upload Image Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Upload className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle>Upload Image</CardTitle>
                    <CardDescription>Upload a label image for OCR processing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="group relative rounded-xl border-2 border-dashed border-slate-300 p-12 text-center transition-colors hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-500 focus-within:ring-offset-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      id="file-upload"
                      aria-label="Upload label image"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-medium text-slate-700">
                            Drag and drop or click to select
                          </p>
                          <p className="text-sm text-slate-500">PNG, JPG, WEBP up to 50MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <Button
                    className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500"
                    variant="default"
                    aria-label="Upload selected image"
                  >
                    Upload Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle>Enter Label Data</CardTitle>
                    <CardDescription>Manually enter label information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium text-slate-700">
                      Brand Name
                    </Label>
                    <Input
                      id="brand"
                      placeholder="Premium Craft Beer"
                      required
                      className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                      aria-required="true"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="abv" className="text-sm font-medium text-slate-700">
                        ABV (%)
                      </Label>
                      <Input
                        id="abv"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="5.5"
                        required
                        className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contents" className="text-sm font-medium text-slate-700">
                        Net Contents
                      </Label>
                      <Input
                        id="contents"
                        placeholder="12 fl oz"
                        required
                        className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="producer" className="text-sm font-medium text-slate-700">
                      Producer/Importer
                    </Label>
                    <Input
                      id="producer"
                      placeholder="ABC Brewery"
                      required
                      className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-sm font-medium text-slate-700">
                      Class Type
                    </Label>
                    <select
                      id="class"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      aria-label="Select beverage class type"
                    >
                      <option value="beer">Beer</option>
                      <option value="wine">Wine</option>
                      <option value="distilled-spirit">Distilled Spirit</option>
                      <option value="mead">Mead</option>
                      <option value="cider">Cider</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warning" className="text-sm font-medium text-slate-700">
                      Government Warning
                    </Label>
                    <Textarea
                      id="warning"
                      placeholder="GOVERNMENT WARNING..."
                      rows={3}
                      required
                      className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                      aria-required="true"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500"
                    disabled={loading}
                    aria-label={loading ? 'Uploading label data' : 'Submit label data'}
                  >
                    {loading ? 'Uploading...' : 'Submit Label Data'}
                  </Button>

                  {success && (
                    <div
                      className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700"
                      role="status"
                      aria-live="polite"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Label uploaded successfully!</span>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
