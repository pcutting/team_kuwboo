import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { DevicePlatform } from '../../../common/enums';

export class RegisterDeviceDto {
  @IsString()
  @MaxLength(512)
  fcmToken!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  appVersion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceModel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  osVersion?: string;
}
