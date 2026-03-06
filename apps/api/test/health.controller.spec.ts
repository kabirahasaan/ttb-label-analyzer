import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../src/app/modules/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    controller = new HealthController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toBeGreaterThan(0);
    });
  });
});
