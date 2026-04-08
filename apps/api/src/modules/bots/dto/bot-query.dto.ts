import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BotSimulationStatus } from '../../../common/enums';

export class BotQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(BotSimulationStatus)
  simulationStatus?: BotSimulationStatus;

  @IsOptional()
  @IsString()
  displayPersona?: string;
}
