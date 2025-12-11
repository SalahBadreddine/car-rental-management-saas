import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString()
  carId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalPrice?: number;
}
