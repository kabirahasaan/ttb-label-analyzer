'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Download,
  FileImage,
  Play,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ValidationProgress,
  type ValidationStepStatusMap,
  type ValidationJobStatus,
  VALIDATION_PIPELINE_STEP_KEYS,
} from '@/components/ui/validation-progress';
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

interface ValidationDisplayResult {
  status: 'valid' | 'warning' | 'error';
  summary: string;
  discrepancies?: Array<{
    field: string;
    labelValue: string;
    applicationValue: string;
  }>;
  validationTime?: number; // milliseconds
  confidenceScore?: number;
}

export default function UploadLabelPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const initialProgress = useMemo<ValidationStepStatusMap>(() => {
    return VALIDATION_PIPELINE_STEP_KEYS.reduce<ValidationStepStatusMap>((acc, key) => {
      acc[key] = 'pending';
      return acc;
    }, {});
  }, []);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [applicationMode, setApplicationMode] = useState<'existing' | 'manual'>('existing');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [manualData, setManualData] = useState({
    brandName: '',
    alcoholByVolume: '',
    netContents: '',
    producerName: '',
    colaNumber: '',
    approvalDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ValidationStepStatusMap>(initialProgress);
  const [jobStatus, setJobStatus] = useState<ValidationJobStatus>('running');
  const [result, setResult] = useState<ValidationDisplayResult | null>(null);
  const [formError, setFormError] = useState<string>('');
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Refs for guided workflow
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);
  const applicationSectionRef = useRef<HTMLDivElement | null>(null);
  const validationSectionRef = useRef<HTMLDivElement | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);

  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState({
    upload: false,
    application: false,
    validation: false,
  });

  const canRunValidation = useMemo(() => {
    if (!file) {
      return false;
    }

    if (applicationMode === 'existing') {
      return Boolean(selectedApplicationId);
    }

    return Boolean(
      manualData.brandName.trim() &&
      manualData.alcoholByVolume.trim() &&
      manualData.netContents.trim() &&
      manualData.producerName.trim()
    );
  }, [applicationMode, file, manualData, selectedApplicationId]);

  // Smooth scroll helper
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, offset = -100) => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Track step completion
  useEffect(() => {
    setCompletedSteps({
      upload: Boolean(file),
      application: canRunValidation,
      validation: Boolean(result),
    });
  }, [file, canRunValidation, result]);

  // Auto-scroll to validation when application data is complete
  useEffect(() => {
    if (canRunValidation && !loading && !result) {
      setTimeout(() => scrollToSection(validationSectionRef), 500);
    }
  }, [canRunValidation, loading, result]);

  // Load applications on mount
  useEffect(() => {
    void loadApplications();
  }, []);

  const loadApplications = async (): Promise<void> => {
    if (applicationsLoaded) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      if (response.ok) {
        const data = (await response.json()) as ApplicationRecord[];
        setApplications(data);
      } else {
        console.warn('Failed to load applications, API returned:', response.status);
      }
    } catch (error) {
      console.error('Failed to connect to API server:', error);
      toast({
        title: 'API Connection Error',
        description: `Cannot reach API server at ${API_BASE_URL}. Please ensure the API is running.`,
        variant: 'destructive',
      });
      setApplications([]);
    } finally {
      setApplicationsLoaded(true);
    }
  };

  const handleFileSelection = (nextFile: File | null): void => {
    if (!nextFile) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResult(null);

    toast({
      title: 'Label uploaded successfully',
      description: 'Image received and queued for validation.',
      variant: 'success',
    });

    // Guide user to next step
    setTimeout(() => scrollToSection(applicationSectionRef), 500);
  };

  const mapBackendStepsToProgress = (steps: Array<{ status: ValidationStepStatusMap[string] }>) => {
    const nextProgress = { ...initialProgress };

    steps.forEach((step, index) => {
      const key = VALIDATION_PIPELINE_STEP_KEYS[index];
      if (key && step.status) {
        nextProgress[key] = step.status;
      }
    });

    return nextProgress;
  };

  const pollValidationProgress = async (jobId: string): Promise<ValidationJobStatus> => {
    let status: ValidationJobStatus = 'running';

    while (status === 'running') {
      const response = await fetch(`${API_BASE_URL}/validate/progress/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve validation progress');
      }

      const data = await response.json();
      setProgress(mapBackendStepsToProgress(data.steps || []));
      status = data.status as ValidationJobStatus;
      setJobStatus(status);

      if (status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return status;
  };

  const createLabelPayload = () => {
    return {
      brandName: '',
      alcoholByVolume: 0,
      netContents: '',
      governmentWarning: '',
      classType: 'beer',
      producerName: '',
      imageUrl: file ? `/uploads/${file.name}` : undefined,
    };
  };

  const resolveApplication = async (): Promise<ApplicationRecord> => {
    if (applicationMode === 'existing') {
      const existing = applications.find((app) => app.id === selectedApplicationId);
      if (!existing) {
        throw new Error('Please select an application from the dataset');
      }
      return existing;
    }

    toast({
      title: 'Application data submitted',
      description: 'Ready to run validation.',
    });

    const abv = Number(manualData.alcoholByVolume);
    if (isNaN(abv) || abv < 0 || abv > 100) {
      throw new Error('ABV must be a number between 0 and 100');
    }

    console.log('Creating application for validation:', `${API_BASE_URL}/applications`);
    const createResponse = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: manualData.brandName,
        alcoholByVolume: abv,
        netContents: manualData.netContents,
        producerName: manualData.producerName,
        governmentWarning:
          'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
        colaNumber: manualData.colaNumber || undefined,
        approvalDate: manualData.approvalDate || undefined,
      }),
    });

    console.log('Create response status:', createResponse.status);
    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => null);
      console.error('API error creating application:', errorData);
      const errorMessage =
        errorData?.message ||
        `Failed to create application data (Status: ${createResponse.status})`;
      throw new Error(errorMessage);
    }

    const createdApplication = (await createResponse.json()) as ApplicationRecord;
    console.log('Application created for validation:', createdApplication);

    setApplications((prev) => {
      const exists = prev.some((app) => app.id === createdApplication.id);
      if (exists) {
        return prev;
      }

      return [...prev, createdApplication];
    });

    return createdApplication;
  };

  const fetchFinalResults = async (
    labelId: string,
    applicationId: string,
    status: ValidationJobStatus
  ): Promise<ValidationDisplayResult> => {
    const [validationResponse, crossCheckResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/validate/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelId }),
      }),
      fetch(`${API_BASE_URL}/validate/cross-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelId, applicationId }),
      }),
    ]);

    if (!validationResponse.ok || !crossCheckResponse.ok) {
      return {
        status: status === 'warning' ? 'warning' : status === 'success' ? 'valid' : 'error',
        summary: 'Validation completed. Detailed result export is available.',
      };
    }

    const validationData = await validationResponse.json();
    const crossCheckData = await crossCheckResponse.json();

    const discrepancies = (crossCheckData.discrepancies || []).map((item: any) => ({
      field: item.field,
      labelValue: String(item.labelValue ?? ''),
      applicationValue: String(item.applicationValue ?? ''),
    }));

    const hasWarnings =
      status === 'warning' || Boolean(validationData?.warnings?.length) || discrepancies.length > 0;

    return {
      status: status === 'error' ? 'error' : hasWarnings ? 'warning' : 'valid',
      summary:
        status === 'error'
          ? 'Validation could not be completed.'
          : hasWarnings
            ? 'Validation completed with discrepancies detected.'
            : 'Validation completed successfully with no discrepancies.',
      discrepancies,
    };
  };

  const calculateConfidenceScore = (
    status: ValidationDisplayResult['status'],
    discrepancyCount: number,
    validationTime: number
  ): number => {
    const baseScore = status === 'valid' ? 97 : status === 'warning' ? 88 : 74;
    const discrepancyPenalty = Math.min(20, discrepancyCount * 4);
    const timePenalty = validationTime > 5000 ? 3 : validationTime > 2000 ? 1 : 0;

    return Math.max(55, Math.min(99, baseScore - discrepancyPenalty - timePenalty));
  };

  const runValidation = async (): Promise<void> => {
    if (!canRunValidation || !file) {
      return;
    }

    const validationStartTime = performance.now();
    setLoading(true);
    setResult(null);
    setProgress(initialProgress);
    setJobStatus('running');

    try {
      const application = await resolveApplication();

      const labelCreateResponse = await fetch(`${API_BASE_URL}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createLabelPayload()),
      });

      if (!labelCreateResponse.ok) {
        throw new Error('Failed to create label for validation');
      }

      const labelData = await labelCreateResponse.json();

      const uploadResponse = await fetch(`${API_BASE_URL}/labels/${labelData.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to process uploaded label image');
      }

      const progressStartResponse = await fetch(`${API_BASE_URL}/validate/progress/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          labelId: labelData.id,
          applicationId: application.id,
        }),
      });

      if (!progressStartResponse.ok) {
        throw new Error('Failed to start validation progress job');
      }

      const progressJob = await progressStartResponse.json();
      const finalStatus = await pollValidationProgress(progressJob.jobId);
      const finalResult = await fetchFinalResults(labelData.id, application.id, finalStatus);

      const validationEndTime = performance.now();
      const validationTime = Math.round(validationEndTime - validationStartTime);
      const discrepancyCount = finalResult.discrepancies?.length || 0;
      const confidenceScore = calculateConfidenceScore(
        finalResult.status,
        discrepancyCount,
        validationTime
      );

      setResult({ ...finalResult, validationTime, confidenceScore });

      // Field name mapping for human-readable warnings
      const fieldNameMap: Record<string, string> = {
        brandName: 'Brand Name',
        alcoholByVolume: 'Alcohol by Volume (ABV)',
        netContents: 'Net Contents',
        producerName: 'Producer Name',
        governmentWarning: 'Government Warning',
        colaNumber: 'TTB COLA ID',
        classType: 'Product Type',
      };

      // Save validation result for later retrieval on Results page
      const saveResultResponse = await fetch(`${API_BASE_URL}/validate/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelId: labelData.id,
          applicationId: application.id,
          brandName: application.brandName,
          colaNumber: application.colaNumber,
          status:
            finalResult.status === 'valid'
              ? 'COMPLIANT'
              : finalResult.status === 'warning'
                ? 'WARNING'
                : 'NON_COMPLIANT',
          errors: finalResult.status === 'error' ? ['Validation process encountered an error'] : [],
          warnings:
            finalResult.discrepancies && finalResult.discrepancies.length > 0
              ? finalResult.discrepancies.map((d) => {
                  const friendlyFieldName = fieldNameMap[d.field] || d.field;
                  return `${friendlyFieldName}: Label shows "${d.labelValue}" but approved application has "${d.applicationValue}"`;
                })
              : [],
          discrepancies: finalResult.discrepancies || [],
          validationTime: validationTime,
        }),
      });

      if (!saveResultResponse.ok) {
        const errorBody = await saveResultResponse.text();
        console.error('Failed to persist validation result:', {
          status: saveResultResponse.status,
          body: errorBody,
        });

        toast({
          title: 'Validation completed, but result was not saved',
          description: 'Please refresh Validation Results and try again.',
          variant: 'warning',
        });
      }

      if (finalStatus === 'success') {
        toast({
          title: 'Validation completed',
          description: 'Compliance report is ready.',
          variant: 'success',
        });
      } else if (finalStatus === 'warning') {
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

      // Guide user to results
      setTimeout(() => scrollToSection(resultSectionRef), 800);
    } catch {
      setJobStatus('error');
      setProgress({
        ...initialProgress,
        uploadReceived: 'error',
      });

      setResult({
        status: 'error',
        summary: 'Validation failed. Please check your input and uploaded image.',
      });

      toast({
        title: 'Validation failed',
        description: 'Please check the uploaded files.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunValidationClick = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!canRunValidation) {
      const message =
        'Please complete all required inputs: select/take an image and provide complete application data.';
      setFormError(message);
      toast({
        title: 'Validation cannot start',
        description: message,
        variant: 'destructive',
      });

      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorRef.current?.focus();
      });

      return;
    }

    setFormError('');
    await runValidation();
  };

  const exportResult = (): void => {
    if (!result) {
      return;
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'validation-result.json';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleStartNewValidation = (): void => {
    // Reset all state
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedApplicationId('');
    setManualData({
      brandName: '',
      alcoholByVolume: '',
      netContents: '',
      producerName: '',
      colaNumber: '',
      approvalDate: '',
    });
    setResult(null);
    setProgress(initialProgress);
    setJobStatus('running');
    setFormError('');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show success message
    toast({
      title: 'Ready for new validation',
      description: 'Start by uploading a new label image.',
      variant: 'default',
    });

    // Focus on upload section after scroll
    setTimeout(() => {
      if (uploadSectionRef.current) {
        uploadSectionRef.current.focus();
      }
    }, 600);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6" aria-live="polite">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900">Validate Label</h1>
      <p className="mb-6 text-slate-600">
        Follow these steps to validate your label against the approved application
      </p>

      {/* Step Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${completedSteps.upload ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {completedSteps.upload ? '✓' : '1'}
          </div>
          <span
            className={`hidden text-sm sm:inline ${completedSteps.upload ? 'text-green-600 font-medium' : 'text-slate-600'}`}
          >
            Upload
          </span>
        </div>
        <div
          className={`h-0.5 w-8 sm:w-16 ${completedSteps.upload ? 'bg-green-500' : 'bg-slate-200'}`}
        />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${completedSteps.application ? 'bg-green-500 text-white' : completedSteps.upload ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {completedSteps.application ? '✓' : '2'}
          </div>
          <span
            className={`hidden text-sm sm:inline ${completedSteps.application ? 'text-green-600 font-medium' : completedSteps.upload ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Application
          </span>
        </div>
        <div
          className={`h-0.5 w-8 sm:w-16 ${completedSteps.application ? 'bg-green-500' : 'bg-slate-200'}`}
        />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${completedSteps.validation ? 'bg-green-500 text-white' : completedSteps.application ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {completedSteps.validation ? '✓' : '3'}
          </div>
          <span
            className={`hidden text-sm sm:inline ${completedSteps.validation ? 'text-green-600 font-medium' : completedSteps.application ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Results
          </span>
        </div>
      </div>

      <Card
        ref={uploadSectionRef}
        tabIndex={-1}
        className={`mb-6 border-slate-200 shadow-sm transition-all outline-none ${!completedSteps.upload ? 'ring-2 ring-blue-500' : ''}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${completedSteps.upload ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
            >
              {completedSteps.upload ? '✓' : '1'}
            </div>
            Select Label Image
            {completedSteps.upload && (
              <span className="ml-auto text-sm font-normal text-green-600">✓ Complete</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <FileImage className="h-4 w-4" />
              Select from disk
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                aria-label="Select image file from disk"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Camera className="h-4 w-4" />
              Take picture
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                aria-label="Take picture using mobile camera"
              />
            </label>
          </div>

          {previewUrl && file ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-2 text-sm font-medium text-green-700">Selected: {file.name}</p>
                <div className="relative h-56 w-full overflow-hidden rounded-lg bg-slate-50">
                  <Image
                    src={previewUrl}
                    alt="Selected label preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {!completedSteps.application && (
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <div className="text-lg">👇</div>
                  <span className="font-medium">
                    Next: Select or enter the application data below
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <FileImage className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">No image selected yet</p>
              <p className="mt-1 text-xs text-slate-500">Choose an option above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        ref={applicationSectionRef}
        className={`mb-6 border-slate-200 shadow-sm transition-all ${completedSteps.upload && !completedSteps.application ? 'ring-2 ring-blue-500' : ''}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${completedSteps.application ? 'bg-green-500 text-white' : completedSteps.upload ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-500'}`}
            >
              {completedSteps.application ? '✓' : '2'}
            </div>
            Application Data
            {completedSteps.application && (
              <span className="ml-auto text-sm font-normal text-green-600">✓ Complete</span>
            )}
            {!completedSteps.upload && (
              <span className="ml-auto text-sm font-normal text-slate-500">
                Complete step 1 first
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="application-mode"
                checked={applicationMode === 'existing'}
                onChange={() => {
                  setApplicationMode('existing');
                  setResult(null);
                  void loadApplications();
                }}
              />
              Select existing application
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="application-mode"
                checked={applicationMode === 'manual'}
                onChange={() => {
                  setApplicationMode('manual');
                  setResult(null);
                }}
              />
              Enter application manually
            </label>
          </div>

          {applicationMode === 'existing' ? (
            <div className="space-y-2">
              <Label htmlFor="application-select">Existing Application Dataset</Label>
              <select
                id="application-select"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedApplicationId}
                onChange={(e) => {
                  setSelectedApplicationId(e.target.value);
                  setResult(null);
                }}
                aria-label="Select existing application"
              >
                <option value="">Select application...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.colaNumber || 'No COLA ID'} · {app.brandName} · {app.alcoholByVolume}% ABV
                    · {app.netContents} · {app.producerName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-brand" className="text-sm font-medium text-slate-700">
                    Brand Name
                  </Label>
                  <Input
                    id="app-brand"
                    placeholder="Premium Craft Beer"
                    value={manualData.brandName}
                    onChange={(e) => {
                      setManualData((prev) => ({ ...prev, brandName: e.target.value }));
                      setResult(null);
                    }}
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
                    value={manualData.colaNumber}
                    onChange={(e) => {
                      setManualData((prev) => ({ ...prev, colaNumber: e.target.value }));
                      setResult(null);
                    }}
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
                    value={manualData.alcoholByVolume}
                    onChange={(e) => {
                      setManualData((prev) => ({ ...prev, alcoholByVolume: e.target.value }));
                      setResult(null);
                    }}
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
                    value={manualData.netContents}
                    onChange={(e) => {
                      setManualData((prev) => ({ ...prev, netContents: e.target.value }));
                      setResult(null);
                    }}
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
                  value={manualData.producerName}
                  onChange={(e) => {
                    setManualData((prev) => ({ ...prev, producerName: e.target.value }));
                    setResult(null);
                  }}
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
                  value={manualData.approvalDate}
                  onChange={(e) => {
                    setManualData((prev) => ({ ...prev, approvalDate: e.target.value }));
                    setResult(null);
                  }}
                  className="rounded-lg border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                  aria-label="COLA approval date"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        ref={validationSectionRef}
        className={`mb-6 border-slate-200 shadow-sm transition-all ${completedSteps.application && !completedSteps.validation && !loading ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${completedSteps.validation ? 'bg-green-500 text-white' : completedSteps.application ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-500'}`}
            >
              {completedSteps.validation ? '✓' : '3'}
            </div>
            Run Validation
            {!completedSteps.application && (
              <span className="ml-auto text-sm font-normal text-slate-500">
                Complete steps 1 & 2 first
              </span>
            )}
            {completedSteps.application && !loading && !completedSteps.validation && (
              <span className="ml-auto animate-pulse text-sm font-normal text-blue-600">
                ► Click to validate
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError ? (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {formError}
            </div>
          ) : null}

          <Button
            onClick={handleRunValidationClick}
            aria-disabled={!canRunValidation || loading}
            className={`mx-auto flex rounded-lg px-6 ${
              canRunValidation && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow'
                : 'cursor-not-allowed bg-slate-300 text-slate-600 hover:bg-slate-300'
            }`}
            aria-label="Run validation"
          >
            <Play className="mr-2 h-4 w-4" />
            {loading ? 'Validating...' : 'Run Validation'}
          </Button>

          {canRunValidation && !loading && !result ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">
                Ready to validate! Click the button above to start.
              </span>
            </div>
          ) : null}

          {!canRunValidation && !loading ? (
            <p className="text-center text-sm text-slate-500">
              Complete required data to enable validation.
            </p>
          ) : null}

          {loading ? <ValidationProgress progress={progress} status={jobStatus} /> : null}
        </CardContent>
      </Card>

      {result ? (
        <Card
          ref={resultSectionRef}
          className="animate-in fade-in slide-in-from-bottom-4 border-slate-200 shadow-lg duration-500"
          style={{
            boxShadow:
              result.status === 'valid'
                ? '0 0 0 3px rgba(34, 197, 94, 0.2)'
                : result.status === 'error'
                  ? '0 0 0 3px rgba(239, 68, 68, 0.2)'
                  : '0 0 0 3px rgba(245, 158, 11, 0.2)',
          }}
        >
          <CardHeader className="pb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-sm font-medium text-slate-600">Step 3 Complete</span>
            </div>
            <CardTitle className="flex items-center gap-3">
              {result.status === 'valid' ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : result.status === 'error' ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">Validation Complete</h3>
                <p className="text-sm font-normal text-slate-600">
                  {result.status === 'valid'
                    ? 'Your label meets all compliance requirements'
                    : result.status === 'error'
                      ? 'Validation encountered issues'
                      : 'Some issues were found that need attention'}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Validation Overview */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">Validation Overview</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Overall Status
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      result.status === 'valid'
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {result.status === 'valid'
                      ? '✓ Compliant'
                      : result.status === 'error'
                        ? '✗ Non-Compliant'
                        : '⚠ Needs Review'}
                  </span>
                </div>

                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Validation Time
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {result.validationTime !== undefined
                      ? `${(result.validationTime / 1000).toFixed(2)}s`
                      : 'N/A'}
                  </p>
                </div>

                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    AI Confidence
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {result.confidenceScore !== undefined ? `${result.confidenceScore}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg border-l-4 border-slate-400 bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
            </div>

            {/* Discrepancies Section */}
            {result.discrepancies && result.discrepancies.length > 0 ? (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Issues Found ({result.discrepancies.length})
                </h4>
                <p className="text-sm text-slate-600">
                  The following differences were detected between your uploaded label and the
                  approved application:
                </p>
                <div className="space-y-3">
                  {result.discrepancies.map((discrepancy, index) => {
                    const fieldDisplayName = discrepancy.field
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    const normalizeLabelValue = (value: string) => {
                      const trimmed = value.trim();
                      if (!trimmed) {
                        return '(Missing on label)';
                      }

                      const normalized = trimmed.toLowerCase();
                      if (
                        normalized === 'uploaded label' ||
                        normalized === 'uploaded label producer' ||
                        normalized === 'unknown producer' ||
                        normalized === 'missing' ||
                        /^cola[-\s]?\d{4}/i.test(trimmed)
                      ) {
                        return '(Missing on label)';
                      }

                      return trimmed;
                    };

                    const normalizeApplicationValue = (value: string) => {
                      const trimmed = value.trim();
                      return trimmed || '(Not specified in application)';
                    };

                    return (
                      <div
                        key={`${discrepancy.field}-${index}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                      >
                        <div className="mb-3 flex items-start gap-2">
                          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
                            <span className="text-xs font-bold text-amber-800">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-amber-900">{fieldDisplayName}</h5>
                            <p className="mt-1 text-xs text-amber-700">
                              The information on your label doesn&apos;t match the approved
                              application
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Application Value */}
                          <div className="rounded-md border border-green-300 bg-green-50 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide text-green-800">
                                Approved Application
                              </span>
                            </div>
                            <p className="break-words text-sm font-medium text-green-900">
                              {normalizeApplicationValue(discrepancy.applicationValue)}
                            </p>
                          </div>

                          {/* Label Value */}
                          <div className="rounded-md border border-red-300 bg-red-50 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <FileImage className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide text-red-800">
                                Your Label
                              </span>
                            </div>
                            <p className="break-words text-sm font-medium text-red-900">
                              {normalizeLabelValue(discrepancy.labelValue)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-md bg-white p-2 text-xs text-slate-600">
                          <strong>Action needed:</strong> Update your label to match the approved
                          application value
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">All Checks Passed</h4>
                    <p className="mt-1 text-sm text-green-700">
                      Your label information matches the approved application perfectly. No
                      discrepancies were found.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col items-center gap-4">
                {/* Start New Validation Button */}
                <div className="flex w-full flex-col items-center gap-3">
                  <p className="text-center text-sm text-slate-600">
                    Ready to validate another label?
                  </p>
                  <Button
                    onClick={handleStartNewValidation}
                    className="group flex items-center gap-3 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 px-8 py-6 shadow-md transition-all hover:scale-105 hover:border-green-500 hover:shadow-lg active:scale-95"
                    aria-label="Start new validation"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-500">
                      <RefreshCw className="h-5 w-5 text-green-600 transition-colors group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-slate-900">
                        Start New Validation
                      </div>
                      <div className="text-xs text-slate-600">Reset and validate another label</div>
                    </div>
                  </Button>
                </div>

                {/* Divider */}
                <div className="flex w-full items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Export Report Button */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-center text-sm text-slate-600">
                    Need to save or share these results?
                  </p>
                  <Button
                    variant="secondary"
                    onClick={exportResult}
                    className="group flex items-center gap-3 rounded-xl border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50 px-8 py-6 shadow-md transition-all hover:scale-105 hover:border-blue-400 hover:shadow-lg active:scale-95"
                    aria-label="Export validation result"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-500">
                      <Download className="h-5 w-5 text-blue-600 transition-colors group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-slate-900">
                        Export Detailed Report
                      </div>
                      <div className="text-xs text-slate-500">Download as JSON file</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
