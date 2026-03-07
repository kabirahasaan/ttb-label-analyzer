import { Test, TestingModule } from '@nestjs/testing';
import { LabelService } from '../src/app/modules/label/label.service';
import { LoggerService } from '@ttb/logger';

describe('LabelService', () => {
  let service: LabelService;
  let logger: LoggerService;

  beforeEach(async () => {
    logger = new LoggerService({ level: 'info', format: 'json' });
    service = new LabelService(logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a label', () => {
      const createLabelDto = {
        brandName: 'Test Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'Warning text',
        classType: 'beer',
        producerName: 'Test Brewery',
      };

      const result = service.create(createLabelDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.brandName).toBe('Test Brand');
    });
  });

  describe('findOne', () => {
    it('should find a label by id', () => {
      const createLabelDto = {
        brandName: 'Test Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'Warning text',
        classType: 'beer',
        producerName: 'Test Brewery',
      };

      const created = service.create(createLabelDto);
      const found = service.findOne(created.id!);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException for non-existent label', () => {
      expect(() => service.findOne('non-existent-id')).toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all labels', () => {
      const createLabelDto = {
        brandName: 'Test Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'Warning text',
        classType: 'beer',
        producerName: 'Test Brewery',
      };

      service.create(createLabelDto);
      service.create({ ...createLabelDto, brandName: 'Test Brand 2' });

      const all = service.findAll();
      expect(all.length).toBe(2);
    });
  });
});
