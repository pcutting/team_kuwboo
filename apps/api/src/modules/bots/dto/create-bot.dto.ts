import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateBotDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(50)
  displayPersona!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  backstory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  homeLatitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  homeLongitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  roamRadiusKm?: number;

  @IsOptional()
  @IsObject()
  behaviorConfigOverrides?: Record<string, unknown>;
}
