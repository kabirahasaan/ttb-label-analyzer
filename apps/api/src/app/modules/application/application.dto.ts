import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  brandName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  alcoholByVolume: number;

  @IsString()
  netContents: string;

  @IsString()
  producerName: string;

  @IsOptional()
  @IsString()
  colaNumber?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alcoholByVolume?: number;

  @IsOptional()
  @IsString()
  netContents?: string;

  @IsOptional()
  @IsString()
  producerName?: string;

  @IsOptional()
  @IsString()
  colaNumber?: string;
}
