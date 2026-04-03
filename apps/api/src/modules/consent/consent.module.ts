import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserConsent } from './entities/user-consent.entity';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MikroOrmModule.forFeature([UserConsent]), UsersModule],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
