import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto, UpdateApplicationDto } from './application.dto';
import { ApplicationData } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';

/**
 * Application Service
 * Handles COLA application operations and persistence
 */
@Injectable()
export class ApplicationService {
  private applications: Map<string, ApplicationData> = new Map();

  constructor(private logger: LoggerService) {}

  create(createApplicationDto: CreateApplicationDto): ApplicationData {
    const id = this.generateId();
    const application: ApplicationData = {
      id,
      ...createApplicationDto,
      approvalDate: new Date(),
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
    return Array.from(this.applications.values()).find((app) => app.colaNumber === colaNumber);
  }

  update(id: string, updateApplicationDto: UpdateApplicationDto): ApplicationData {
    const application = this.findOne(id);
    const updatedApplication: ApplicationData = {
      ...application,
      ...updateApplicationDto,
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
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
