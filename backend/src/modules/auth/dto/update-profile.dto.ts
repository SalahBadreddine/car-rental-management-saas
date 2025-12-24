// src/auth/dto/update-profile.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Driver license expiry must be a valid date' })
  driverLicenseExpiry?: string;
}
