import { Controller, Post, Get, Param, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LabelService } from './label.service';
import { CreateLabelDto } from './label.dto';
import { LabelData } from '@ttb/shared-types';

@ApiTags('labels')
@Controller('labels')
export class LabelController {
  constructor(private labelService: LabelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new label' })
  @ApiResponse({ status: 201, description: 'Label created' })
  create(@Body() createLabelDto: CreateLabelDto): LabelData {
    return this.labelService.create(createLabelDto);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload label image' })
  @ApiResponse({ status: 200, description: 'Image uploaded' })
  upload(@Param('id') id: string, @Body() body: any): LabelData {
    return this.labelService.uploadImage(id, body.filename, body.mimeType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all labels' })
  @ApiResponse({ status: 200, description: 'List of labels' })
  findAll(): LabelData[] {
    return this.labelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get label by ID' })
  @ApiResponse({ status: 200, description: 'Label found' })
  findOne(@Param('id') id: string): LabelData {
    return this.labelService.findOne(id);
  }
}
