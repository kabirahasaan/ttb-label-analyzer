import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Validation API Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/validate/label (POST)', () => {
    it('should validate a created label by id', async () => {
      const labelResponse = await request(app.getHttpServer())
        .post('/labels')
        .send({
          brandName: 'Integration IPA',
          alcoholByVolume: 6.1,
          netContents: '12 fl oz',
          governmentWarning:
            'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
          classType: 'Malt Beverage',
          producerName: 'Integration Brewery',
        })
        .expect(201);

      const labelId = labelResponse.body.id;

      return request(app.getHttpServer())
        .post('/validate/label')
        .send({ labelId })
        .expect(201)
        .expect((res) => {
          expect(res.body.labelId).toBe(labelId);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('isCompliant');
          expect(Array.isArray(res.body.errors)).toBe(true);
          expect(Array.isArray(res.body.warnings)).toBe(true);
        });
    });
  });

  describe('/validate/cross-check (POST)', () => {
    it('should cross-check a label against an application', async () => {
      const labelResponse = await request(app.getHttpServer())
        .post('/labels')
        .send({
          brandName: 'CrossCheck Lager',
          alcoholByVolume: 5.0,
          netContents: '12 fl oz',
          governmentWarning:
            'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
          classType: 'Beer',
          producerName: 'CrossCheck Brewery',
        })
        .expect(201);

      const applicationResponse = await request(app.getHttpServer())
        .post('/applications')
        .send({
          brandName: 'CrossCheck Lager',
          alcoholByVolume: 5.0,
          netContents: '12 fl oz',
          producerName: 'CrossCheck Brewery',
          governmentWarning:
            'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/validate/cross-check')
        .send({
          labelId: labelResponse.body.id,
          applicationId: applicationResponse.body.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('labelId');
          expect(res.body).toHaveProperty('applicationId');
          expect(res.body).toHaveProperty('match');
          expect(res.body).toHaveProperty('matchPercentage');
          expect(Array.isArray(res.body.discrepancies)).toBe(true);
        });
    });
  });

  describe('/validate/results lifecycle', () => {
    it('should save, list, fetch and clear validation results', async () => {
      const saveResponse = await request(app.getHttpServer())
        .post('/validate/results')
        .send({
          labelId: 'label-1',
          applicationId: 'app-1',
          brandName: 'Result Test Brand',
          status: 'COMPLIANT',
          errors: [],
          warnings: [],
          discrepancies: [],
          validationTime: 120,
        })
        .expect(201);

      const resultId = saveResponse.body.id;
      expect(resultId).toBeDefined();

      await request(app.getHttpServer())
        .get('/validate/results')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });

      await request(app.getHttpServer())
        .get(`/validate/results/${resultId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(resultId);
          expect(res.body.brandName).toBe('Result Test Brand');
        });

      await request(app.getHttpServer())
        .delete('/validate/results')
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.cleared).toBe('number');
        });
    });
  });
});
