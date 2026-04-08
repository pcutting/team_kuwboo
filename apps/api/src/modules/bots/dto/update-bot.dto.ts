import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';

export class UpdateBotDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayPersona?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  backstory?: string;

  @IsOptional()
  @IsObject()
  behaviorConfig?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  homeLatitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  homeLongitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  roamRadiusKm?: number;
}
