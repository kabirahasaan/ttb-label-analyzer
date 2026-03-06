'use client';

import { useState } from 'react';
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Upload Label</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>Upload a label image for OCR processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input type="file" accept="image/*" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-slate-600">Drag and drop or click to select image</p>
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP up to 50MB</p>
                </label>
              </div>
              <Button className="w-full" variant="default">
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enter Label Data</CardTitle>
            <CardDescription>Manually enter label information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="brand">Brand Name</Label>
                <Input id="brand" placeholder="Premium Craft Beer" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="abv">ABV (%)</Label>
                  <Input
                    id="abv"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="5.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contents">Net Contents</Label>
                  <Input id="contents" placeholder="12 fl oz" required />
                </div>
              </div>
              <div>
                <Label htmlFor="producer">Producer/Importer</Label>
                <Input id="producer" placeholder="ABC Brewery" required />
              </div>
              <div>
                <Label htmlFor="class">Class Type</Label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option>beer</option>
                  <option>wine</option>
                  <option>distilled spirit</option>
                  <option>mead</option>
                  <option>cider</option>
                </select>
              </div>
              <div>
                <Label htmlFor="warning">Government Warning</Label>
                <Textarea id="warning" placeholder="GOVERNMENT WARNING..." rows={3} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Label'}
              </Button>
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  Label uploaded successfully!
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
