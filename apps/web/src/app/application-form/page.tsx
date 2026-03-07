'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function ApplicationFormPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    colaNumber: '',
    alcoholByVolume: '',
    netContents: '',
    producerName: '',
    approvalDate: '',
  });

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/applications`);
        if (!response.ok) {
          console.warn('Failed to load applications, API returned:', response.status);
          return;
        }

        const data = (await response.json()) as ApplicationRecord[];
        setApplications(data);
      } catch (error) {
        console.error('Failed to connect to API server:', error);
        toast({
          title: 'API Connection Error',
          description: `Cannot reach API server at ${API_BASE_URL}. Please ensure the API is running.`,
          variant: 'destructive',
        });
        setApplications([]);
      }
    };

    void loadApplications();
  }, [API_BASE_URL]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.brandName.trim() ||
      !formData.alcoholByVolume.trim() ||
      !formData.netContents.trim() ||
      !formData.producerName.trim()
    ) {
      toast({
        title: 'Missing required fields',
        description: 'Please complete all required application fields.',
        variant: 'destructive',
      });
      return;
    }

    const abv = Number(formData.alcoholByVolume);
    if (isNaN(abv) || abv < 0 || abv > 100) {
      toast({
        title: 'Invalid ABV',
        description: 'ABV must be a number between 0 and 100.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting application to:', `${API_BASE_URL}/applications`);
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brandName,
          colaNumber: formData.colaNumber || undefined,
          alcoholByVolume: abv,
          netContents: formData.netContents,
          producerName: formData.producerName,
          approvalDate: formData.approvalDate || undefined,
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error:', errorData);
        const errorMessage =
          errorData?.message || `Failed to create application (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const createdApplication = (await response.json()) as ApplicationRecord;
      console.log('Application created successfully:', createdApplication);
      setApplications((prev) => [...prev, createdApplication]);

      setFormData({
        brandName: '',
        colaNumber: '',
        alcoholByVolume: '',
        netContents: '',
        producerName: '',
        approvalDate: '',
      });

      toast({
        title: 'Application submitted',
        description: 'Application stored in the in-memory dataset.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Application submission error:', error);
      const message =
        error instanceof Error ? error.message : 'Unable to store application data right now.';
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-brand" className="text-sm font-medium text-slate-700">
                    Brand Name
                  </Label>
                  <Input
                    id="app-brand"
                    placeholder="Premium Craft Beer"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, brandName: e.target.value }))
                    }
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="Brand name from COLA application"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cola-number" className="text-sm font-medium text-slate-700">
                    COLA ID
                  </Label>
                  <Input
                    id="cola-number"
                    placeholder="COLA-2024-001"
                    value={formData.colaNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, colaNumber: e.target.value }))
                    }
                    className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                    aria-label="TTB COLA identification number"
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
                    value={formData.alcoholByVolume}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, alcoholByVolume: e.target.value }))
                    }
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
                    value={formData.netContents}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, netContents: e.target.value }))
                    }
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
                  value={formData.producerName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, producerName: e.target.value }))
                  }
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
                  value={formData.approvalDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, approvalDate: e.target.value }))
                  }
                  className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                  aria-label="COLA approval date"
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500"
                  type="submit"
                  disabled={loading}
                  aria-label="Submit COLA application"
                >
                  {loading ? 'Submitting...' : 'Create Application'}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                In-memory Application List
              </h2>
              {applications.length === 0 ? (
                <p className="text-sm text-slate-500">No applications submitted yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700">
                  {applications.map((application) => (
                    <li
                      key={application.id}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                    >
                      {application.colaNumber || 'No COLA ID'} · {application.brandName} ·{' '}
                      {application.alcoholByVolume}% ABV · {application.netContents} ·{' '}
                      {application.producerName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
