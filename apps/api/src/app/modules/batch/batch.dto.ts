import { IsArray, IsString, IsOptional } from 'class-validator';

export class BatchValidateDto {
  @IsArray()
  @IsString({ each: true })
  labelIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicationIds?: string[];

  @IsOptional()
  runCrossCheck?: boolean;
}
