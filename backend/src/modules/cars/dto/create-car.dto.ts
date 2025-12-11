import { IsString, IsInt, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarRequestDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year: number;

  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsString()
  category: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @IsOptional()
  @IsString()
  transmission?: 'Automatic' | 'Manual';

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  locationId?: string;
}

export class CreateCarDto extends CreateCarRequestDto {
  primaryImageUrl?: string;
  galleryUrls?: string[];
}
