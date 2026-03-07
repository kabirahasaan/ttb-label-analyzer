'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationStepStatus = 'pending' | 'active' | 'completed' | 'error';
export type ValidationJobStatus = 'running' | 'success' | 'warning' | 'error';
export type ValidationStepStatusMap = Record<string, ValidationStepStatus>;

export interface ValidationStep {
  id: string;
  label: string;
  status: ValidationStepStatus;
}

interface ValidationProgressProps {
  title?: string;
  steps?: ValidationStep[];
  progress?: ValidationStepStatusMap;
  status?: ValidationJobStatus;
  className?: string;
}

export const VALIDATION_PIPELINE_STEP_LABELS = [
  'Upload Received',
  'Image Preprocessing',
  'OCR Text Extraction',
  'Field Extraction',
  'Application Data Cross Check',
  'TTB Rule Validation',
  'Compliance Report Generation',
] as const;

const VALIDATION_PIPELINE_STEP_DEFS: Array<{ key: string; label: string }> = [
  { key: 'uploadReceived', label: 'Upload Received' },
  { key: 'imagePreprocessing', label: 'Image Preprocessing' },
  { key: 'ocrTextExtraction', label: 'OCR Text Extraction' },
  { key: 'fieldExtraction', label: 'Field Extraction' },
  { key: 'applicationCrossCheck', label: 'Application Data Cross Check' },
  { key: 'ttbRuleValidation', label: 'TTB Rule Validation' },
  { key: 'complianceReportGeneration', label: 'Compliance Report Generation' },
];

export const VALIDATION_PIPELINE_STEP_KEYS = VALIDATION_PIPELINE_STEP_DEFS.map((item) => item.key);

function StepIcon({ status }: { status: ValidationStepStatus }): JSX.Element {
  if (status === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />;
  }

  if (status === 'active') {
    return <Loader2 className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />;
  }

  if (status === 'error') {
    return <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />;
  }

  return <Circle className="h-5 w-5 text-slate-400" aria-hidden="true" />;
}

export function createValidationSteps(activeIndex: number, hasError = false): ValidationStep[] {
  return VALIDATION_PIPELINE_STEP_LABELS.map((label, index) => {
    let status: ValidationStepStatus = 'pending';

    if (index < activeIndex) {
      status = 'completed';
    } else if (index === activeIndex) {
      status = hasError ? 'error' : 'active';
    }

    return {
      id: `step-${index + 1}`,
      label,
      status,
    };
  });
}

export function ValidationProgress({
  title = 'Validation Progress',
  steps,
  progress,
  status = 'running',
  className,
}: ValidationProgressProps): JSX.Element {
  const resolvedSteps: ValidationStep[] = steps
    ? steps
    : VALIDATION_PIPELINE_STEP_DEFS.map((stepDef, index) => ({
        id: `step-${index + 1}`,
        label: stepDef.label,
        status: progress?.[stepDef.key] || 'pending',
      }));

  const activeStep = resolvedSteps.find(
    (step) => step.status === 'active' || step.status === 'error'
  );

  return (
    <section
      className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}
      aria-labelledby="validation-progress-title"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <h3 id="validation-progress-title" className="text-base font-semibold text-slate-900">
        {title}
      </h3>
      <p className="sr-only">
        {status === 'running'
          ? activeStep
            ? `Current step: ${activeStep.label}`
            : 'Validation is running.'
          : status === 'success'
            ? 'Validation completed successfully.'
            : status === 'warning'
              ? 'Validation completed with warnings.'
              : 'Validation failed.'}
      </p>

      <ol className="mt-4 space-y-3" aria-label="Validation pipeline steps">
        {resolvedSteps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isError = step.status === 'error';

          return (
            <li key={step.id} className="relative flex items-start gap-3">
              {index < resolvedSteps.length - 1 ? (
                <span
                  className={cn(
                    'absolute left-2.5 top-6 h-7 w-px transition-colors',
                    isCompleted ? 'bg-green-300' : 'bg-slate-200'
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <span className="mt-0.5 flex h-5 w-5 items-center justify-center">
                <StepIcon status={step.status} />
              </span>

              <span
                className={cn(
                  'text-sm transition-colors',
                  isCompleted && 'text-green-700',
                  isActive && 'font-medium text-blue-700',
                  isError && 'font-medium text-red-700',
                  step.status === 'pending' && 'text-slate-500'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
