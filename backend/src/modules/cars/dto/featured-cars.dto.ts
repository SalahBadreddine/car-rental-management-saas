// src/cars/dto/featured-cars.dto.ts
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FeaturedCarsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 4;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
