import {
  LabelData,
  ApplicationData,
  CrossCheckResult,
  CrossCheckDiscrepancy,
  ErrorSeverity,
} from '@ttb/shared-types';

/**
 * Cross-Check Validator
 * Validates consistency between label data and application data
 */
export class CrossCheckValidator {
  validateLabelAgainstApplication(
    label: LabelData,
    application: ApplicationData
  ): CrossCheckResult {
    const discrepancies = this.findDiscrepancies(label, application);
    const match = discrepancies.length === 0;
    const matchPercentage = this.calculateMatchPercentage(discrepancies);

    return {
      labelId: label.id || 'unknown',
      applicationId: application.id || 'unknown',
      match,
      discrepancies,
      matchPercentage,
    };
  }

  private findDiscrepancies(
    label: LabelData,
    application: ApplicationData
  ): CrossCheckDiscrepancy[] {
    const discrepancies: CrossCheckDiscrepancy[] = [];

    // Brand name check
    if (!this.valuesMatch(label.brandName, application.brandName)) {
      discrepancies.push({
        field: 'brandName',
        labelValue: label.brandName,
        applicationValue: application.brandName,
        mismatch: true,
        severity: ErrorSeverity.ERROR,
      });
    }

    // ABV check (with small tolerance for rounding)
    if (!this.numbersMatch(label.alcoholByVolume, application.alcoholByVolume, 0.1)) {
      discrepancies.push({
        field: 'alcoholByVolume',
        labelValue: label.alcoholByVolume,
        applicationValue: application.alcoholByVolume,
        mismatch: true,
        severity: ErrorSeverity.ERROR,
      });
    }

    // Net contents check
    if (!this.valuesMatch(label.netContents, application.netContents)) {
      discrepancies.push({
        field: 'netContents',
        labelValue: label.netContents,
        applicationValue: application.netContents,
        mismatch: true,
        severity: ErrorSeverity.WARNING,
      });
    }

    // Producer name check
    if (!this.valuesMatch(label.producerName, application.producerName)) {
      discrepancies.push({
        field: 'producerName',
        labelValue: label.producerName,
        applicationValue: application.producerName,
        mismatch: true,
        severity: ErrorSeverity.WARNING,
      });
    }

    return discrepancies;
  }

  private valuesMatch(value1: unknown, value2: unknown): boolean {
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.toLowerCase().trim() === value2.toLowerCase().trim();
    }
    return value1 === value2;
  }

  private numbersMatch(
    num1: number | undefined,
    num2: number | undefined,
    tolerance: number = 0
  ): boolean {
    if (num1 === undefined || num2 === undefined) {
      return false;
    }
    return Math.abs(num1 - num2) <= tolerance;
  }

  private calculateMatchPercentage(discrepancies: CrossCheckDiscrepancy[]): number {
    const totalFields = 4; // brandName, ABV, netContents, producerName
    const matchedFields = totalFields - discrepancies.length;
    return Math.round((matchedFields / totalFields) * 100);
  }
}
