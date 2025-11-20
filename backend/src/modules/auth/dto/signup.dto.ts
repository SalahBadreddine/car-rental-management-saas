import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  role?: 'customer' | 'client_admin'; 
  
  @IsOptional()
  tenantId?: string; 
}