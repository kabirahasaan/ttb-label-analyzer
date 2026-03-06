import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  brandName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  alcoholByVolume: number;

  @IsString()
  netContents: string;

  @IsString()
  governmentWarning: string;

  @IsString()
  classType: string;

  @IsString()
  producerName: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UploadLabelDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;
}
