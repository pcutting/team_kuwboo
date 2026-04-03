import { IsEnum, IsString, MaxLength } from 'class-validator';
import { ConsentType, ConsentSource } from '../../../common/enums';

export class GrantConsentDto {
  @IsEnum(ConsentType)
  consentType!: ConsentType;

  @IsString()
  @MaxLength(20)
  version!: string;

  @IsEnum(ConsentSource)
  source!: ConsentSource;
}
