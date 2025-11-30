import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCarsDto {
  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  startingPrice?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  endingPrice?: number;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}