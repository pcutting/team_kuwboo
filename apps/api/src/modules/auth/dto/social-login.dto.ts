import { IsString, IsOptional } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  idToken!: string;
}

export class AppleLoginDto {
  @IsString()
  identityToken!: string;

  @IsString()
  authorizationCode!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
