import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, IsNumber } from 'class-validator';

export class ValidateLabelDto {
  @IsString()
  labelId: string;

  @IsOptional()
  @IsString()
  applicationId?: string;
}

export class CrossCheckDto {
  @IsString()
  labelId: string;

  @IsString()
  applicationId: string;
}

export enum ValidationJobMode {
  SINGLE = 'single',
  BATCH = 'batch',
}

export enum ValidationStepState {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export class StartValidationJobDto {
  @IsOptional()
  @IsEnum(ValidationJobMode)
  mode?: ValidationJobMode;

  @IsOptional()
  @IsString()
  labelId?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labelIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  batchSize?: number;
}

export interface ValidationPipelineStep {
  id: string;
  label: string;
  status: ValidationStepState;
}

export interface ValidationJobStatusResponse {
  jobId: string;
  mode: ValidationJobMode;
  status: 'running' | 'success' | 'warning' | 'error';
  steps: ValidationPipelineStep[];
}

export interface StoredValidationResult {
  id: string;
  labelId: string;
  applicationId: string;
  brandName: string;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  errors: string[];
  warnings: string[];
  discrepancies: Array<{
    field: string;
    labelValue: string;
    applicationValue: string;
  }>;
  validationTime: number; // milliseconds
  createdAt: Date;
}

export class SaveValidationResultDto {
  @IsString()
  labelId: string;

  @IsString()
  applicationId: string;

  @IsString()
  brandName: string;

  @IsString()
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';

  @IsArray()
  @IsString({ each: true })
  errors: string[];

  @IsArray()
  @IsString({ each: true })
  warnings: string[];

  @IsOptional()
  @IsArray()
  discrepancies?: Array<{
    field: string;
    labelValue: string;
    applicationValue: string;
  }>;

  @IsNumber()
  validationTime: number; // milliseconds
}
