import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLabelDto } from './label.dto';
import { LabelData } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';

/**
 * Label Service
 * Handles label operations and persistence
 */
@Injectable()
export class LabelService {
  private labels: Map<string, LabelData> = new Map();

  constructor(private logger: LoggerService) {}

  create(createLabelDto: CreateLabelDto): LabelData {
    const id = this.generateId();
    const label: LabelData = {
      id,
      ...createLabelDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.labels.set(id, label);
    this.logger.info(`Label created: ${id}`, { labelId: id });

    return label;
  }

  findAll(): LabelData[] {
    return Array.from(this.labels.values());
  }

  findOne(id: string): LabelData {
    const label = this.labels.get(id);
    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    return label;
  }

  uploadImage(labelId: string, filename: string, mimeType: string): LabelData {
    const label = this.findOne(labelId);
    const updatedLabel: LabelData = {
      ...label,
      imageUrl: `/uploads/${filename}`,
      updatedAt: new Date(),
    };

    this.labels.set(labelId, updatedLabel);
    this.logger.info(`Image uploaded for label: ${labelId}`, {
      labelId,
      filename,
    });

    return updatedLabel;
  }

  delete(id: string): void {
    if (!this.labels.has(id)) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    this.labels.delete(id);
    this.logger.info(`Label deleted: ${id}`, { labelId: id });
  }

  private generateId(): string {
    return `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
