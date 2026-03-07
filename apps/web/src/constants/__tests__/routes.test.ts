import { APP_ROUTES, PRIMARY_NAV_LINKS, FOOTER_PRODUCT_LINKS } from '../routes';

describe('Route Constants', () => {
  describe('APP_ROUTES', () => {
    it('should define all application routes', () => {
      expect(APP_ROUTES.home).toBe('/');
      expect(APP_ROUTES.uploadLabel).toBe('/upload-label');
      expect(APP_ROUTES.batchValidation).toBe('/batch-validation');
      expect(APP_ROUTES.applicationForm).toBe('/application-form');
      expect(APP_ROUTES.validationResults).toBe('/validation-results');
    });
  });

  describe('PRIMARY_NAV_LINKS', () => {
    it('should define navigation links in correct order', () => {
      expect(PRIMARY_NAV_LINKS).toHaveLength(4);
      expect(PRIMARY_NAV_LINKS[0].name).toBe('Validate Label');
      expect(PRIMARY_NAV_LINKS[1].name).toBe('Batch Validation');
      expect(PRIMARY_NAV_LINKS[2].name).toBe('Application Form');
      expect(PRIMARY_NAV_LINKS[3].name).toBe('Results');
    });

    it('should link to correct routes', () => {
      expect(PRIMARY_NAV_LINKS[0].href).toBe(APP_ROUTES.uploadLabel);
      expect(PRIMARY_NAV_LINKS[1].href).toBe(APP_ROUTES.batchValidation);
      expect(PRIMARY_NAV_LINKS[2].href).toBe(APP_ROUTES.applicationForm);
      expect(PRIMARY_NAV_LINKS[3].href).toBe(APP_ROUTES.validationResults);
    });
  });

  describe('FOOTER_PRODUCT_LINKS', () => {
    it('should define footer links', () => {
      expect(FOOTER_PRODUCT_LINKS).toHaveLength(4);
      expect(FOOTER_PRODUCT_LINKS[0].name).toBe('Upload Label');
      expect(FOOTER_PRODUCT_LINKS[1].name).toBe('Batch Validation');
      expect(FOOTER_PRODUCT_LINKS[2].name).toBe('Application Form');
      expect(FOOTER_PRODUCT_LINKS[3].name).toBe('Results');
    });

    it('should match primary nav routes', () => {
      PRIMARY_NAV_LINKS.forEach((link, index) => {
        expect(FOOTER_PRODUCT_LINKS[index].href).toBe(link.href);
      });
    });
  });
});
