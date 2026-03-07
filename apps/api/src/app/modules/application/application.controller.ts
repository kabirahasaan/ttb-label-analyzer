import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, UpdateApplicationDto } from './application.dto';
import { ApplicationData } from '@ttb/shared-types';

@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(@Body() createApplicationDto: CreateApplicationDto): ApplicationData {
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  findAll(): ApplicationData[] {
    return this.applicationService.findAll();
  }

  @Get('cola/:colaNumber')
  @ApiOperation({ summary: 'Get application by COLA number' })
  @ApiResponse({ status: 200, description: 'Application found by COLA number' })
  findByColaNumber(@Param('colaNumber') colaNumber: string): ApplicationData {
    return this.applicationService.findByColaNumberOrThrow(colaNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application found' })
  findOne(@Param('id') id: string): ApplicationData {
    return this.applicationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ): ApplicationData {
    return this.applicationService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 204, description: 'Application deleted' })
  delete(@Param('id') id: string): void {
    this.applicationService.delete(id);
  }
}
