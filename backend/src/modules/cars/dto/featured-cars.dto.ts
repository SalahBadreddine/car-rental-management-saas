// src/cars/dto/featured-cars.dto.ts
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class FeaturedCarsDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 4;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
