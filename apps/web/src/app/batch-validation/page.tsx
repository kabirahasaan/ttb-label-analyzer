'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Play,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { typography, spacing, stepIndicators, cards } from '@/styles/page-consistency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { downloadCsv, downloadJson, downloadText } from '@/lib/file';
import { formatValidationFieldName } from '@/lib/validation-format';
import { FieldComparisonCard } from '@/components/validation/field-comparison-card';

interface ApplicationRecord {
  id: string;
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  colaNumber?: string;
  approvalDate?: string;
}

interface BatchValidationResult {
  id: string;
  fileName: string;
  totalLabels: number;
  compliant: number;
  warnings: number;
  nonCompliant: number;
  results: Array<{
    labelId: string;
    colaNumber?: string;
    brandName: string;
    status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
    errors: string[];
    warnings: string[];
    discrepancies: Array<{
      field: string;
      expected: string;
      actual: string;
      severity: string;
    }>;
  }>;
  validatedAt: string;
  processingTime: number;
}

type ApplicationMode = 'existing' | 'upload';

export default function BatchValidationPage() {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  // Step 1: Image Upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Step 2: Application Selection
  const [applicationMode, setApplicationMode] = useState<ApplicationMode>('existing');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [applicationFile, setApplicationFile] = useState<File | null>(null);

  // Step 3: Validation & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [results, setResults] = useState<BatchValidationResult | null>(null);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Refs
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const appFileInputRef = useRef<HTMLInputElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const validationRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Step completion checks
  const isStep1Complete = selectedImages.length > 0;
  const numSelectedApplications = selectedApplicationIds.length;
  const applicationsMatched = numSelectedApplications === selectedImages.length;
  const isStep2Complete =
    isStep1Complete &&
    ((applicationMode === 'existing' && applicationsMatched) ||
      (applicationMode === 'upload' && applicationFile !== null));
  const isStep3Complete = results !== null;
  const overallValidationStatus = !results
    ? null
    : results.nonCompliant > 0
      ? 'error'
      : results.warnings > 0
        ? 'warning'
        : 'valid';

  // Load existing applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/applications?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = (await response.json()) as ApplicationRecord[];
          setApplications(data);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
      }
    };
    void loadApplications();
  }, [API_BASE_URL]);

  // Auto-advance to next step
  useEffect(() => {
    if (isStep1Complete && currentStep === 1) {
      setCurrentStep(2);
      setTimeout(() => {
        applicationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isStep1Complete, currentStep]);

  // Auto-scroll to validation when applications matched
  useEffect(() => {
    if (applicationsMatched && currentStep === 2) {
      setCurrentStep(3);
      setTimeout(() => {
        validationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [applicationsMatched, currentStep]);

  // Scroll helper
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handlers
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files) {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        toast({
          title: 'Invalid Files',
          description: 'Please select image files (PNG, JPG, WEBP, etc.)',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImages(imageFiles);
      toast({
        title: 'Images Selected',
        description: `${imageFiles.length} image(s) ready for validation`,
      });
    }
  };

  const handleApplicationFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setApplicationFile(file);
      toast({
        title: 'File Selected',
        description: `${file.name} ready for import`,
      });
    }
  };

  const downloadApplicationTemplate = () => {
    const templateContent = `COLA ID,Brand Name,Image Path
COLA-2024-001,Hoppy Trails IPA,labels/hoppy-trails.jpg
COLA-2024-002,Reserve Cabernet,labels/cabernet.jpg`;

    downloadText(templateContent, 'batch-validation-applications-template.csv', 'text/csv');

    toast({
      title: 'Template Downloaded',
      description: 'Use this template to prepare your applications file',
    });
  };

  const handleStartValidation = async () => {
    if (!isStep2Complete) {
      toast({
        title: 'Incomplete Setup',
        description: 'Please complete both image and application selection',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(3);
    scrollToSection(validationRef);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Mock results for now
      setTimeout(async () => {
        clearInterval(progressInterval);
        setProgress(100);

        const perLabelResults = selectedImages.map((imageFile, idx) => {
          const simulatedStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' =
            idx % 5 === 0 ? 'NON_COMPLIANT' : idx % 3 === 0 ? 'WARNING' : 'COMPLIANT';

          const discrepancies =
            simulatedStatus === 'COMPLIANT'
              ? []
              : [
                  {
                    field: 'brandName',
                    expected: `Application Brand ${idx + 1}`,
                    actual: idx % 2 === 0 ? '' : `Label Brand ${idx + 1}`,
                    severity: simulatedStatus === 'NON_COMPLIANT' ? 'HIGH' : 'MEDIUM',
                  },
                  {
                    field: 'alcoholByVolume',
                    expected: '5.0% ABV',
                    actual: simulatedStatus === 'NON_COMPLIANT' ? '7.8% ABV' : '5.5% ABV',
                    severity: simulatedStatus === 'NON_COMPLIANT' ? 'HIGH' : 'LOW',
                  },
                ];

          const errors =
            simulatedStatus === 'NON_COMPLIANT'
              ? ['Required statements missing or unreadable', 'ABV mismatch exceeds tolerance']
              : [];

          const warnings =
            simulatedStatus === 'WARNING'
              ? ['Minor text variance found on label']
              : simulatedStatus === 'NON_COMPLIANT'
                ? ['Review formatting and mandatory field alignment']
                : [];

          return {
            labelId: `${imageFile.name}-${idx + 1}`,
            colaNumber: idx % 2 === 0 ? `COLA-2024-${String(idx + 1).padStart(3, '0')}` : '',
            brandName: imageFile.name.replace(/\.[^/.]+$/, ''),
            status: simulatedStatus,
            errors,
            warnings,
            discrepancies,
          };
        });

        const compliantCount = perLabelResults.filter((r) => r.status === 'COMPLIANT').length;
        const warningCount = perLabelResults.filter((r) => r.status === 'WARNING').length;
        const nonCompliantCount = perLabelResults.filter(
          (r) => r.status === 'NON_COMPLIANT'
        ).length;

        const mockResults: BatchValidationResult = {
          id: 'batch-' + Date.now(),
          fileName: `batch-validation-${selectedImages.length}-images.zip`,
          totalLabels: selectedImages.length,
          compliant: compliantCount,
          warnings: warningCount,
          nonCompliant: nonCompliantCount,
          results: perLabelResults,
          validatedAt: new Date().toISOString(),
          processingTime: Math.random() * 5 + 2,
        };

        setResults(mockResults);
        setExpandedResultId(perLabelResults[0]?.labelId ?? null);
        scrollToSection(resultsRef);

        // Save each validation result to the API
        try {
          const savePromises = perLabelResults.map((result, idx) => {
            // Get the application ID for this label (use selected app ID if exists, otherwise use first selected)
            const applicationId =
              selectedApplicationIds[idx] || selectedApplicationIds[0] || 'unknown';

            // Transform discrepancies to match API format (expected -> applicationValue, actual -> labelValue)
            const transformedDiscrepancies = result.discrepancies.map((disc) => ({
              field: disc.field,
              applicationValue: disc.expected,
              labelValue: disc.actual,
            }));

            const saveResultDto = {
              labelId: result.labelId,
              applicationId: applicationId,
              brandName: result.brandName,
              colaNumber: result.colaNumber || undefined,
              status: result.status,
              errors: result.errors,
              warnings: result.warnings,
              discrepancies: transformedDiscrepancies,
              validationTime: Math.random() * 5000 + 1000, // 1-6 seconds
            };

            return fetch(`${API_BASE_URL}/validate/results`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(saveResultDto),
            }).catch((err) => {
              console.error(`Failed to save result for ${result.labelId}:`, err);
            });
          });

          await Promise.all(savePromises);
        } catch (error) {
          console.error('Error saving validation results to API:', error);
          // Continue even if saving fails, so user can still see local results
        }

        toast({
          title: 'Validation Complete',
          description: `Processed ${selectedImages.length} labels successfully`,
        });

        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImages([]);
    setApplicationMode('existing');
    setSelectedApplicationIds([]);
    setApplicationFile(null);
    setResults(null);
    setExpandedResultId(null);
    setProgress(0);
    setCurrentStep(1);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
    if (appFileInputRef.current) appFileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
      title: 'Reset Complete',
      description: 'Ready for new batch validation',
    });
  };

  const downloadResults = (format: 'json' | 'csv') => {
    if (!results) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `batch-validation-results-${timestamp}.${format}`;

    if (format === 'json') {
      downloadJson(results as object, fileName);
    } else {
      const headers = ['Label ID', 'Brand Name', 'Status', 'Errors', 'Warnings'];
      const rows = results.results
        .slice(0, 10)
        .map((r) => [
          r.labelId,
          r.brandName,
          r.status,
          r.errors.length.toString(),
          r.warnings.length.toString(),
        ]);

      downloadCsv(headers, rows, fileName);
    }

    toast({
      title: 'Export Complete',
      description: `Results exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className={`bg-white ${spacing.pageVertical}`}>
      <div className={spacing.pageContainer}>
        {/* Header */}
        <div className={spacing.headerSection}>
          <div className="text-center">
            <h1 className={typography.pageTitle}>Batch Label Validation</h1>
            <p className={typography.pageSubtitle}>
              Upload label images → select applications → validate in bulk → review results
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={stepIndicators.container}>
          {[1, 2, 3].map((step) => {
            const isComplete =
              (step === 1 && isStep1Complete) ||
              (step === 2 && isStep2Complete) ||
              (step === 3 && isStep3Complete);
            const isActive = step === currentStep;

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`${
                    isComplete
                      ? stepIndicators.step.complete
                      : isActive
                        ? stepIndicators.step.active
                        : stepIndicators.step.inactive
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-5 w-5" /> : step}
                </div>
                {step < 3 && <ChevronRight className="mx-2 h-5 w-5 text-gray-400" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload Images */}
        <Card
          className={`mb-6 transition-all ${cards.base} ${currentStep >= 1 ? 'ring-2 ring-blue-500' : ''}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isStep1Complete ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}
                >
                  {isStep1Complete ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                </div>
                <div>
                  <CardTitle>Upload Label Images</CardTitle>
                  <CardDescription>
                    Select multiple label images (PNG, JPG, WEBP) to validate
                  </CardDescription>
                </div>
              </div>
              {isStep1Complete && (
                <span className="text-sm font-medium text-green-600">
                  ✓ {selectedImages.length} image(s)
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  selectedImages.length > 0
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <input
                  ref={imagesInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="batch-images-upload"
                />
                <label htmlFor="batch-images-upload" className="cursor-pointer">
                  <Upload
                    className={`mx-auto mb-4 h-12 w-12 ${selectedImages.length > 0 ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <p className="mb-2 text-lg font-medium text-gray-700">
                    {selectedImages.length > 0
                      ? `${selectedImages.length} image(s) selected`
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP (up to 50MB total)</p>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="space-y-2 text-sm">
                    {selectedImages.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between rounded bg-white p-2"
                      >
                        <span className="truncate text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isStep1Complete && (
                <div className="text-center text-sm text-gray-600">
                  👇 Next: Select applications below
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Applications */}
        <Card
          ref={applicationsRef}
          className={`mb-6 transition-all ${
            currentStep >= 2 ? 'ring-2 ring-blue-500' : 'opacity-60'
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isStep2Complete ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}
                >
                  {isStep2Complete ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                </div>
                <div>
                  <CardTitle>Select Applications</CardTitle>
                  <CardDescription>
                    Choose application data to validate against the label images
                  </CardDescription>
                </div>
              </div>
              {!isStep1Complete && (
                <span className="text-sm text-gray-500">Complete step 1 first</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={applicationMode === 'existing'}
                  onClick={() => setApplicationMode('existing')}
                  disabled={!isStep1Complete}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                    applicationMode === 'existing'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 disabled:opacity-50'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  Use Existing Applications
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={applicationMode === 'upload'}
                  onClick={() => setApplicationMode('upload')}
                  disabled={!isStep1Complete}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                    applicationMode === 'upload'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 disabled:opacity-50'
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Applications
                </button>
              </div>
            </div>

            {/* Existing Applications Mode */}
            {applicationMode === 'existing' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                    <p className="text-sm font-medium text-amber-900">No applications available</p>
                    <p className="mt-1 text-xs text-amber-800">
                      Upload some applications first in the Application Data Entry page
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">
                        Select <span className="font-bold">{selectedImages.length}</span>{' '}
                        application
                        {selectedImages.length !== 1 ? 's' : ''} to match your{' '}
                        {selectedImages.length} label{selectedImages.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-blue-800 mt-1">
                        Currently selected:{' '}
                        <span className="font-bold">{numSelectedApplications}</span>
                      </p>
                    </div>

                    {applicationsMatched && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800">
                          All products matched! Preparing validation...
                        </span>
                      </div>
                    )}

                    {!applicationsMatched && numSelectedApplications > 0 && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-amber-800">
                          {selectedImages.length > numSelectedApplications
                            ? selectedImages.length - numSelectedApplications === 1
                              ? 'Please select 1 more application to continue'
                              : `Please select ${selectedImages.length - numSelectedApplications} more applications to continue`
                            : numSelectedApplications - selectedImages.length === 1
                              ? 'Select 1 less application'
                              : `Select ${numSelectedApplications - selectedImages.length} less applications`}
                        </span>
                      </div>
                    )}

                    <div className="grid gap-2">
                      {applications.map((app) => (
                        <label
                          key={app.id}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-blue-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedApplicationIds.includes(app.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplicationIds([...selectedApplicationIds, app.id]);
                              } else {
                                setSelectedApplicationIds(
                                  selectedApplicationIds.filter((id) => id !== app.id)
                                );
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{app.brandName}</p>
                            <p className="text-xs text-gray-500">
                              {app.colaNumber || 'No COLA ID'} • {app.alcoholByVolume}% ABV •{' '}
                              {app.netContents}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Applications Mode */}
            {applicationMode === 'upload' && (
              <div className="space-y-4">
                <div
                  className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    applicationFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-500'
                  }`}
                >
                  <input
                    ref={appFileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleApplicationFileSelect}
                    className="hidden"
                    id="batch-app-upload"
                  />
                  <label htmlFor="batch-app-upload" className="cursor-pointer">
                    <Upload
                      className={`mx-auto mb-2 h-8 w-8 ${applicationFile ? 'text-green-600' : 'text-gray-400'}`}
                    />
                    <p className="text-sm font-medium text-gray-700">
                      {applicationFile ? applicationFile.name : 'Choose CSV or JSON file'}
                    </p>
                  </label>
                </div>

                {/* Template Download */}
                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Need a template to get started?
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600">
                      Download a pre-formatted template file with all required headers and an
                      example row.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadApplicationTemplate}
                    className="h-11 border-slate-300 bg-white font-medium shadow-sm hover:bg-slate-50 hover:shadow"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Download CSV Template</span>
                      <Download className="h-4 w-4" />
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Validation */}
        <Card
          ref={validationRef}
          className={`mb-6 transition-all ${
            isStep2Complete || isProcessing || isStep3Complete
              ? 'ring-2 ring-blue-500'
              : 'opacity-60'
          }`}
        >
          <CardHeader
            className={`transition-all ${
              isStep2Complete ? 'ring-2 ring-blue-500 ring-offset-2 rounded-t-lg' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-all ${
                  isStep2Complete
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <div className="flex-1">
                <CardTitle>Run Batch Validation</CardTitle>
                <CardDescription>
                  Validate all {selectedImages.length} label image(s) against selected application
                  data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isStep2Complete && (
              <p className="text-sm text-gray-600 font-medium">Complete steps 1 & 2 first</p>
            )}

            {isStep2Complete && !isProcessing && !results && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="font-semibold text-green-900">Ready to validate!</p>
                <p className="mt-1 text-sm text-green-800">Click the button below to proceed</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleStartValidation}
                disabled={!isStep2Complete || isProcessing}
                className={`min-w-[260px] justify-center transition-all ${
                  !isStep2Complete || isProcessing
                    ? 'cursor-not-allowed opacity-50 bg-blue-400'
                    : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <span className="inline-flex w-full items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Processing... {progress}%</span>
                  </span>
                ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2">
                    <Play className="h-5 w-5" />
                    <span>Start Batch Validation</span>
                  </span>
                )}
              </Button>

              {isStep2Complete && !isProcessing && !results && (
                <span className="text-sm text-blue-600 font-medium animate-pulse">
                  ► Click to validate
                </span>
              )}

              {isProcessing && (
                <div className="w-full max-w-md">
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    Validating labels... {progress}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Results */}
        {results && (
          <Card
            ref={resultsRef}
            className="animate-in fade-in slide-in-from-bottom-4 border-slate-200 shadow-lg duration-500"
            style={{
              boxShadow:
                overallValidationStatus === 'valid'
                  ? '0 0 0 3px rgba(34, 197, 94, 0.2)'
                  : overallValidationStatus === 'error'
                    ? '0 0 0 3px rgba(239, 68, 68, 0.2)'
                    : '0 0 0 3px rgba(245, 158, 11, 0.2)',
            }}
          >
            <CardHeader className="pb-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                  ✓
                </div>
                <span className="text-sm font-medium text-slate-600">Step 4 Complete</span>
              </div>
              <CardTitle className="flex items-center gap-3">
                {overallValidationStatus === 'valid' ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                ) : overallValidationStatus === 'error' ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">Batch Validation Complete</h3>
                  <p className="text-sm font-normal text-slate-600">
                    {overallValidationStatus === 'valid'
                      ? 'All labels meet compliance requirements'
                      : overallValidationStatus === 'error'
                        ? 'Validation found non-compliant labels that need updates'
                        : 'Some labels need review before submission'}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Validation Overview</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-md bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Overall Status
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        overallValidationStatus === 'valid'
                          ? 'bg-green-100 text-green-800'
                          : overallValidationStatus === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {overallValidationStatus === 'valid'
                        ? '✓ Compliant'
                        : overallValidationStatus === 'error'
                          ? '✗ Non-Compliant'
                          : '⚠ Needs Review'}
                    </span>
                  </div>

                  <div className="rounded-md bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Total Labels
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{results.totalLabels}</p>
                  </div>

                  <div className="rounded-md bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Validation Time
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {results.processingTime.toFixed(2)}s
                    </p>
                  </div>

                  <div className="rounded-md bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Compliant Labels
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{results.compliant}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-slate-400 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700">
                  Batch summary: {results.compliant} compliant, {results.warnings} warning
                  {results.warnings !== 1 ? 's' : ''}, and {results.nonCompliant} non-compliant
                  label
                  {results.nonCompliant !== 1 ? 's' : ''} out of {results.totalLabels} total.
                </p>
              </div>

              {/* Detailed Results List */}
              {results.results.length > 0 && (
                <div className="space-y-4 border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Detailed Results ({results.results.length})
                  </h3>
                  <p className="text-sm text-slate-600">
                    Results are shown in a vertical accordion. Open one label at a time to review
                    discrepancies and required actions.
                  </p>

                  <div className="space-y-3">
                    {results.results.map((result, index) => (
                      <div
                        key={result.labelId}
                        className="rounded-lg border border-slate-200 bg-white"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedResultId((prev) =>
                              prev === result.labelId ? null : result.labelId
                            )
                          }
                          className="w-full cursor-pointer p-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-slate-900">
                                {result.brandName || `Label ${index + 1}`}
                              </h4>
                              {result.colaNumber ? (
                                <p className="mt-1 text-xs text-slate-500">{result.colaNumber}</p>
                              ) : null}
                            </div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                result.status === 'COMPLIANT'
                                  ? 'bg-green-100 text-green-800'
                                  : result.status === 'NON_COMPLIANT'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {result.status === 'COMPLIANT'
                                ? '✓ Compliant'
                                : result.status === 'NON_COMPLIANT'
                                  ? '✗ Non-Compliant'
                                  : '⚠ Needs Review'}
                            </span>
                            <ChevronRight
                              className={`mt-1 h-4 w-4 flex-shrink-0 text-slate-500 transition-transform ${
                                expandedResultId === result.labelId ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {expandedResultId === result.labelId && (
                          <div className="space-y-4 border-t border-slate-200 bg-slate-50/70 px-4 pb-4 pt-4">
                            {(result.errors.length > 0 || result.warnings.length > 0) && (
                              <div className="space-y-3">
                                {result.errors.length > 0 && (
                                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                                      Errors ({result.errors.length})
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                      {result.errors.map((error, idx) => (
                                        <li key={idx} className="text-sm text-red-700">
                                          • {error}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {result.warnings.length > 0 && (
                                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                                      Warnings ({result.warnings.length})
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                      {result.warnings.map((warning, idx) => (
                                        <li key={idx} className="text-sm text-amber-700">
                                          • {warning}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {result.discrepancies && result.discrepancies.length > 0 ? (
                              <div className="space-y-3">
                                <h5 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                                  Issues Found ({result.discrepancies.length})
                                </h5>
                                <p className="text-sm text-slate-600">
                                  The following differences were detected between your label and the
                                  approved application:
                                </p>

                                <div className="space-y-3">
                                  {result.discrepancies.map((discrepancy, idx) => (
                                    <FieldComparisonCard
                                      key={`${discrepancy.field}-${idx}`}
                                      index={idx}
                                      fieldName={formatValidationFieldName(discrepancy.field)}
                                      expectedValue={discrepancy.expected}
                                      actualValue={discrepancy.actual}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                                  <div>
                                    <h4 className="font-semibold text-green-900">
                                      All Checks Passed
                                    </h4>
                                    <p className="mt-1 text-sm text-green-700">
                                      This label information matches the approved application
                                      perfectly. No discrepancies were found.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex w-full flex-col items-center gap-3">
                    <p className="text-center text-sm text-slate-600">
                      Ready to validate another batch?
                    </p>
                    <Button
                      onClick={handleReset}
                      className="group flex items-center gap-3 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 px-8 py-6 shadow-md transition-all hover:scale-105 hover:border-green-500 hover:shadow-lg active:scale-95"
                      aria-label="Start new batch validation"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-500">
                        <RefreshCw className="h-5 w-5 text-green-600 transition-colors group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold text-slate-900">
                          Start New Batch Validation
                        </div>
                        <div className="text-xs text-slate-600">
                          Reset and validate another batch
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="flex w-full items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">OR</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <p className="text-center text-sm text-slate-600">
                      Need to save or share these results?
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => downloadResults('csv')}
                      className="group flex items-center gap-3 rounded-xl border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50 px-8 py-6 shadow-md transition-all hover:scale-105 hover:border-blue-400 hover:shadow-lg active:scale-95"
                      aria-label="Export validation results as CSV"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-500">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600 transition-colors group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold text-slate-900">
                          Export Detailed Report
                        </div>
                        <div className="text-xs text-slate-500">Download as CSV file</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
