import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Application API Integration Tests (e2e)', () => {
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

  describe('/applications (POST)', () => {
    it('should create a new application', () => {
      const createDto = {
        brandName: 'Test Beer Brand',
        alcoholByVolume: 5.2,
        netContents: '12 fl oz',
        producerName: 'Test Brewery Inc.',
        governmentWarning:
          'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
        colaNumber: 'COLA-TEST-001',
      };

      return request(app.getHttpServer())
        .post('/applications')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.brandName).toBe(createDto.brandName);
          expect(res.body.alcoholByVolume).toBe(createDto.alcoholByVolume);
          expect(res.body.netContents).toBe(createDto.netContents);
          expect(res.body.producerName).toBe(createDto.producerName);
        });
    });

    it('should reject invalid application data', () => {
      const invalidDto = {
        brandName: '',
        alcoholByVolume: -1,
        netContents: '',
      };

      return request(app.getHttpServer())
        .post('/applications')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/applications/:id (GET)', () => {
    let createdApplicationId: string;

    beforeAll(async () => {
      const createDto = {
        brandName: 'Test Lookup Brand',
        alcoholByVolume: 4.8,
        netContents: '16 fl oz',
        producerName: 'Test Producer',
        governmentWarning:
          'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
        colaNumber: 'COLA-LOOKUP-001',
      };

      const response = await request(app.getHttpServer())
        .post('/applications')
        .send(createDto)
        .expect(201);

      createdApplicationId = response.body.id;
    });

    it('should retrieve an application by ID', () => {
      return request(app.getHttpServer())
        .get(`/applications/${createdApplicationId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdApplicationId);
          expect(res.body.brandName).toBe('Test Lookup Brand');
        });
    });

    it('should return 404 for non-existent application', () => {
      return request(app.getHttpServer())
        .get('/applications/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/applications/batch (POST)', () => {
    it('should validate multiple applications', () => {
      const batchDto = {
        applications: [
          {
            brandName: 'Batch Test A',
            alcoholByVolume: 5.2,
            netContents: '12 fl oz',
            producerName: 'Batch Brewery',
            colaNumber: 'COLA-BATCH-001',
            rowNumber: 1,
          },
          {
            brandName: 'Batch Test B',
            alcoholByVolume: 6.0,
            netContents: '12 fl oz',
            producerName: 'Batch Brewery',
            colaNumber: 'COLA-BATCH-002',
            rowNumber: 2,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/applications/batch')
        .send(batchDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.total).toBe(2);
          expect(res.body.created).toBe(2);
          expect(res.body.failed).toBe(0);
          expect(Array.isArray(res.body.applications)).toBe(true);
          expect(res.body.applications.length).toBe(2);
        });
    });

    it('should handle batch validation with errors', () => {
      const batchDto = {
        applications: [
          {
            brandName: 'Valid Brand',
            alcoholByVolume: 5.0,
            netContents: '12 fl oz',
            producerName: 'Valid Producer',
            rowNumber: 1,
          },
          {
            brandName: '',
            alcoholByVolume: 150, // Invalid ABV
            netContents: '',
            producerName: '',
            rowNumber: 2,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/applications/batch')
        .send(batchDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.total).toBe(2);
          expect(res.body.created).toBe(1);
          expect(res.body.failed).toBe(1);
          expect(Array.isArray(res.body.failures)).toBe(true);
          expect(res.body.failures.length).toBe(1);
        });
    });
  });
});
