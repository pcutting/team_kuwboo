import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

@Module({
  imports: [MikroOrmModule.forFeature([Session])],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
