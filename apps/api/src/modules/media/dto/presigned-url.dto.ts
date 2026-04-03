import { IsString, IsEnum, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { MediaType } from '../../../common/enums';

export class PresignedUrlRequestDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(100)
  contentType!: string;

  @IsEnum(MediaType)
  type!: MediaType;

  @IsNumber()
  @Min(1)
  @Max(104857600) // 100MB
  sizeBytes!: number;
}

export class PresignedUrlResponseDto {
  uploadUrl!: string;
  mediaId!: string;
  s3Key!: string;
}
