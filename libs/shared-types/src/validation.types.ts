/**
 * Validation and compliance related types
 */

export enum ValidationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum ComplianceLevel {
  COMPLIANT = 'COMPLIANT',
  WARNING = 'WARNING',
  NON_COMPLIANT = 'NON_COMPLIANT',
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  applyRule(labelData: unknown): ValidationRuleResult;
}

export interface ValidationRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: ErrorSeverity;
  message?: string;
  suggestion?: string;
}

export interface ValidationResult {
  id?: string;
  labelId: string;
  status: ValidationStatus;
  isCompliant: boolean;
  complianceLevel: ComplianceLevel;
  ttbValidationResult?: TTBValidationResult;
  errors: ValidationError[];
  warnings: ValidationError[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TTBValidationResult {
  brandNameValid: boolean;
  abvValid: boolean;
  netContentsValid: boolean;
  governmentWarningValid: boolean;
  classTypeValid: boolean;
  producerNameValid: boolean;
  allFieldsPresent: boolean;
}

export interface ValidationError {
  id?: string;
  errorCode: string;
  errorMessage: string;
  severity: ErrorSeverity;
  field?: string;
  suggestedFix?: string;
  createdAt?: Date;
}

export interface CrossCheckDiscrepancy {
  field: string;
  labelValue: unknown;
  applicationValue: unknown;
  mismatch: boolean;
  severity: ErrorSeverity;
}

export interface CrossCheckResult {
  labelId: string;
  applicationId: string;
  match: boolean;
  discrepancies: CrossCheckDiscrepancy[];
  matchPercentage: number;
}

export interface BatchValidationRequest {
  labelIds: string[];
  applicationIds?: string[];
  runCrossCheck?: boolean;
}

export interface BatchValidationResponse {
  batchId: string;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  results: ValidationResult[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}
