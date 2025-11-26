import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateLocationRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "Oran Airport"

  @IsString()
  @IsNotEmpty()
  city: string; // e.g., "Oran"

  @IsString()
  @IsOptional()
  address?: string; // e.g., "Parking B, Terminal 1"
}

export class CreateLocationDto extends CreateLocationRequestDto {
  @IsUrl()
  imageUrl!: string; // image url of the location
}