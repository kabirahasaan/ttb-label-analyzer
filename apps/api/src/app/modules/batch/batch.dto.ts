import { IsArray, IsString, IsOptional, IsBoolean, IsInt, Max, Min } from 'class-validator';

export class BatchValidateDto {
  @IsArray()
  @IsString({ each: true })
  labelIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicationIds?: string[];

  @IsOptional()
  @IsBoolean()
  runCrossCheck?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxConcurrency?: number;
}
