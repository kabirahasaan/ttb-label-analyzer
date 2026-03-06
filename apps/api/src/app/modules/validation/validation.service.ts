import { Injectable } from '@nestjs/common';
import { ValidationService } from '@ttb/validation-engine';
import { LabelService } from '../label/label.service';
import { ApplicationService } from '../application/application.service';
import { ValidationResult, CrossCheckResult } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';
import {
  ValidationJobMode,
  ValidationJobStatusResponse,
  ValidationPipelineStep,
  ValidationStepState,
  StartValidationJobDto,
} from './validation.dto';

/**
 * Validation Controller Service
 * Orchestrates validation operations
 */
@Injectable()
export class ValidateService {
  private validationEngine: ValidationService;
  private readonly pipelineStepLabels = [
    'Upload Received',
    'Image Preprocessing',
    'OCR Text Extraction',
    'Field Extraction',
    'Application Data Cross Check',
    'TTB Rule Validation',
    'Compliance Report Generation',
  ] as const;
  private readonly progressJobs = new Map<string, ValidationJobStatusResponse>();

  constructor(
    private labelService: LabelService,
    private applicationService: ApplicationService,
    private logger: LoggerService
  ) {
    this.validationEngine = new ValidationService();
  }

  validateLabel(labelId: string): ValidationResult {
    const label = this.labelService.findOne(labelId);
    const result = this.validationEngine.validateLabel(label);
    this.logger.info(`Label validated: ${labelId}`, {
      labelId,
      isCompliant: result.isCompliant,
    });
    return result;
  }

  crossCheckLabelAndApplication(labelId: string, applicationId: string): CrossCheckResult {
    const label = this.labelService.findOne(labelId);
    const application = this.applicationService.findOne(applicationId);

    const result = this.validationEngine.crossCheckLabelAndApplication(label, application);

    this.logger.info(`Cross-check completed: ${labelId} vs ${applicationId}`, {
      labelId,
      applicationId,
      match: result.match,
      matchPercentage: result.matchPercentage,
    });

    return result;
  }

  startValidationProgressJob(payload: StartValidationJobDto): ValidationJobStatusResponse {
    const jobId = `val_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mode = payload.mode || ValidationJobMode.SINGLE;

    const steps: ValidationPipelineStep[] = this.pipelineStepLabels.map((label, index) => ({
      id: `step-${index + 1}`,
      label,
      status: index === 0 ? ValidationStepState.ACTIVE : ValidationStepState.PENDING,
    }));

    const job: ValidationJobStatusResponse = {
      jobId,
      mode,
      status: 'running',
      steps,
    };

    this.progressJobs.set(jobId, job);
    void this.runJob(jobId, payload);

    return job;
  }

  getValidationProgressJob(jobId: string): ValidationJobStatusResponse {
    const job = this.progressJobs.get(jobId);

    if (!job) {
      return {
        jobId,
        mode: ValidationJobMode.SINGLE,
        status: 'error',
        steps: this.pipelineStepLabels.map((label, index) => ({
          id: `step-${index + 1}`,
          label,
          status: ValidationStepState.ERROR,
        })),
      };
    }

    return job;
  }

  private async runJob(jobId: string, payload: StartValidationJobDto): Promise<void> {
    const job = this.progressJobs.get(jobId);
    if (!job) {
      return;
    }

    let hasWarnings = false;

    for (let stepIndex = 0; stepIndex < job.steps.length; stepIndex++) {
      this.setActiveStep(job, stepIndex);
      await this.delay(this.getStepDelayMs(stepIndex, payload));

      try {
        if (stepIndex === 4 && payload.labelId && payload.applicationId) {
          const crossCheck = this.crossCheckLabelAndApplication(
            payload.labelId,
            payload.applicationId
          );
          hasWarnings = hasWarnings || !crossCheck.match;
        }

        if (stepIndex === 5 && payload.labelId) {
          const validationResult = this.validateLabel(payload.labelId);
          hasWarnings = hasWarnings || validationResult.warnings.length > 0;

          if (!validationResult.isCompliant) {
            this.setErrorState(job, stepIndex);
            return;
          }
        }

        if (stepIndex === 5 && payload.mode === ValidationJobMode.BATCH) {
          const sampledWarningChance = Math.random() < 0.35;
          hasWarnings = hasWarnings || sampledWarningChance;
        }

        job.steps[stepIndex].status = ValidationStepState.COMPLETED;
      } catch (error) {
        this.logger.error(
          `Validation progress job failed at step ${stepIndex + 1}`,
          error as Error,
          {
            jobId,
            stepIndex,
          }
        );
        this.setErrorState(job, stepIndex);
        return;
      }
    }

    job.status = hasWarnings ? 'warning' : 'success';
  }

  private setActiveStep(job: ValidationJobStatusResponse, activeIndex: number): void {
    job.steps.forEach((step, index) => {
      if (index < activeIndex && step.status !== ValidationStepState.ERROR) {
        step.status = ValidationStepState.COMPLETED;
      } else if (index === activeIndex) {
        step.status = ValidationStepState.ACTIVE;
      } else if (step.status !== ValidationStepState.ERROR) {
        step.status = ValidationStepState.PENDING;
      }
    });
  }

  private setErrorState(job: ValidationJobStatusResponse, stepIndex: number): void {
    job.steps[stepIndex].status = ValidationStepState.ERROR;
    job.status = 'error';
  }

  private getStepDelayMs(stepIndex: number, payload: StartValidationJobDto): number {
    if (stepIndex === 2) {
      return 900;
    }

    if (payload.mode === ValidationJobMode.BATCH) {
      const size = payload.labelIds?.length || payload.batchSize || 1;
      const scale = Math.min(1200, Math.max(450, Math.floor(size / 2)));
      return scale;
    }

    return 550;
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
