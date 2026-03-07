export const APP_ROUTES = {
  home: '/',
  uploadLabel: '/upload-label',
  batchValidation: '/batch-validation',
  applicationForm: '/application-form',
  validationResults: '/validation-results',
} as const;

export const PRIMARY_NAV_LINKS = [
  { name: 'Validate Label', href: APP_ROUTES.uploadLabel },
  { name: 'Batch Validation', href: APP_ROUTES.batchValidation },
  { name: 'Application Form', href: APP_ROUTES.applicationForm },
  { name: 'Results', href: APP_ROUTES.validationResults },
] as const;

export const FOOTER_PRODUCT_LINKS = [
  { name: 'Upload Label', href: APP_ROUTES.uploadLabel },
  { name: 'Batch Validation', href: APP_ROUTES.batchValidation },
  { name: 'Application Form', href: APP_ROUTES.applicationForm },
  { name: 'Results', href: APP_ROUTES.validationResults },
] as const;
