import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string; // This is set automatically by the controller when a file is uploaded
}

