import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  reservationId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  paymentMethod: string; // 'cash', 'cib', 'baridi_mob', 'bank_transfer', 'other'

  @IsOptional()
  @IsString()
  notes?: string;
}
