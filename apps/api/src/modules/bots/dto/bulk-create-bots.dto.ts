import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class BulkCreateBotsDto {
  @IsInt()
  @Min(1)
  @Max(100)
  count!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayPersona?: string;

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
  @IsString()
  @MaxLength(50)
  namePrefix?: string;
}
