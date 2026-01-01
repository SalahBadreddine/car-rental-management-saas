import { IsString, IsEmail, IsOptional, IsUrl, IsObject } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string; // This is set automatically by the controller when a file is uploaded

  @IsOptional()
  @IsObject()
  websiteConfig?: Record<string, any>;
}

