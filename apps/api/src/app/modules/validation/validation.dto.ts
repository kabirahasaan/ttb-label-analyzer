import { IsString, IsOptional } from 'class-validator';

export class ValidateLabelDto {
  @IsString()
  labelId: string;

  @IsOptional()
  @IsString()
  applicationId?: string;
}

export class CrossCheckDto {
  @IsString()
  labelId: string;

  @IsString()
  applicationId: string;
}
