import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateApplicationDto, UpdateApplicationDto } from './application.dto';
import { ApplicationData } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';
import { getValidTestApplications } from '../../fixtures/test-applications.fixture';

/**
 * Application Service
 * Handles COLA application operations and persistence
 */
@Injectable()
export class ApplicationService {
  private applications: Map<string, ApplicationData> = new Map();

  constructor(private logger: LoggerService) {}

  /**
   * Seed the in-memory database with test fixtures
   * Call this during app initialization for development/testing
   */
  seedTestData(): void {
    this.logger.info('Seeding application test data...');
    const testScenarios = getValidTestApplications();

    testScenarios.forEach((scenario) => {
      const id = this.generateId();
      const application: ApplicationData = {
        id,
        ...scenario.application,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.applications.set(id, application);
    });

    this.logger.info(`Seeded ${testScenarios.length} test applications`);
  }

  create(createApplicationDto: CreateApplicationDto): ApplicationData {
    const id = this.generateId();
    const normalizedColaNumber = this.normalizeColaNumber(createApplicationDto.colaNumber);

    const application: ApplicationData = {
      id,
      ...createApplicationDto,
      colaNumber: normalizedColaNumber,
      approvalDate: createApplicationDto.approvalDate
        ? new Date(createApplicationDto.approvalDate)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.applications.set(id, application);
    this.logger.info(`Application created: ${id}`, { applicationId: id });

    return application;
  }

  findAll(): ApplicationData[] {
    return Array.from(this.applications.values());
  }

  findOne(id: string): ApplicationData {
    const application = this.applications.get(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  findByColaNumber(colaNumber: string): ApplicationData | undefined {
    const normalizedColaNumber = this.normalizeColaNumber(colaNumber);

    if (!normalizedColaNumber) {
      return undefined;
    }

    return Array.from(this.applications.values()).find(
      (app) => this.normalizeColaNumber(app.colaNumber) === normalizedColaNumber
    );
  }

  findByColaNumberOrThrow(colaNumber: string): ApplicationData {
    const application = this.findByColaNumber(colaNumber);

    if (!application) {
      throw new NotFoundException(`Application with COLA number ${colaNumber} not found`);
    }

    return application;
  }

  update(id: string, updateApplicationDto: UpdateApplicationDto): ApplicationData {
    const application = this.findOne(id);
    const normalizedColaNumber = this.normalizeColaNumber(updateApplicationDto.colaNumber);

    const updatedApplication: ApplicationData = {
      ...application,
      ...updateApplicationDto,
      colaNumber: normalizedColaNumber ?? application.colaNumber,
      approvalDate: updateApplicationDto.approvalDate
        ? new Date(updateApplicationDto.approvalDate)
        : application.approvalDate,
      updatedAt: new Date(),
    };

    this.applications.set(id, updatedApplication);
    this.logger.info(`Application updated: ${id}`, { applicationId: id });

    return updatedApplication;
  }

  delete(id: string): void {
    if (!this.applications.has(id)) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    this.applications.delete(id);
    this.logger.info(`Application deleted: ${id}`, { applicationId: id });
  }

  private generateId(): string {
    return randomUUID();
  }

  private normalizeColaNumber(colaNumber?: string): string | undefined {
    if (!colaNumber) {
      return undefined;
    }

    const normalized = colaNumber.trim().toUpperCase();
    return normalized.length ? normalized : undefined;
  }
}
