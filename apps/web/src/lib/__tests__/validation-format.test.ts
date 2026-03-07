import { formatValidationFieldName } from '../validation-format';

describe('formatValidationFieldName', () => {
  it('should format known field names using the mapping', () => {
    expect(formatValidationFieldName('brandName')).toBe('Brand Name');
    expect(formatValidationFieldName('alcoholByVolume')).toBe('Alcohol by Volume (ABV)');
    expect(formatValidationFieldName('netContents')).toBe('Net Contents');
    expect(formatValidationFieldName('producerName')).toBe('Producer Name');
    expect(formatValidationFieldName('governmentWarning')).toBe('Government Warning');
    expect(formatValidationFieldName('colaNumber')).toBe('TTB COLA ID');
    expect(formatValidationFieldName('classType')).toBe('Product Type');
  });

  it('should format unknown field names by converting camelCase to Title Case', () => {
    expect(formatValidationFieldName('customField')).toBe('Custom Field');
    expect(formatValidationFieldName('anotherFieldName')).toBe('Another Field Name');
    expect(formatValidationFieldName('simpleValue')).toBe('Simple Value');
  });

  it('should handle single-word field names', () => {
    expect(formatValidationFieldName('brand')).toBe('Brand');
    expect(formatValidationFieldName('name')).toBe('Name');
  });

  it('should handle already formatted names', () => {
    expect(formatValidationFieldName('AlreadyFormatted')).toBe('Already Formatted');
  });

  it('should handle empty strings', () => {
    expect(formatValidationFieldName('')).toBe('');
  });

  it('should preserve acronyms in camelCase', () => {
    expect(formatValidationFieldName('TTBApprovalNumber')).toBe('T T B Approval Number');
  });
});
