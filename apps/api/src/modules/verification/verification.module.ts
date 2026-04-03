import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';

@Module({
  imports: [MikroOrmModule.forFeature([Verification])],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
