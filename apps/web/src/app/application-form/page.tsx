'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApplicationFormPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            COLA Application
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Enter COLA application information for validation against label data
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  Enter the COLA application information for cross-checking
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-brand" className="text-sm font-medium text-slate-700">
                    Brand Name
                  </Label>
                  <Input
                    id="app-brand"
                    placeholder="Premium Craft Beer"
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="Brand name from COLA application"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cola-number" className="text-sm font-medium text-slate-700">
                    COLA Number
                  </Label>
                  <Input
                    id="cola-number"
                    placeholder="COLA-123456"
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="COLA identification number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-abv" className="text-sm font-medium text-slate-700">
                    ABV (%)
                  </Label>
                  <Input
                    id="app-abv"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="5.5"
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="Alcohol by volume percentage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-contents" className="text-sm font-medium text-slate-700">
                    Net Contents
                  </Label>
                  <Input
                    id="app-contents"
                    placeholder="12 fl oz"
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="Net contents volume"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-producer" className="text-sm font-medium text-slate-700">
                  Producer/Importer
                </Label>
                <Input
                  id="app-producer"
                  placeholder="ABC Brewery"
                  className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                  aria-label="Producer or importer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-date" className="text-sm font-medium text-slate-700">
                  Approval Date
                </Label>
                <Input
                  id="approval-date"
                  type="date"
                  className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                  aria-label="COLA approval date"
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500"
                  type="submit"
                  aria-label="Submit COLA application"
                >
                  Create Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
