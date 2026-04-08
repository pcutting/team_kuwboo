import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PresenceGateway } from './presence.gateway';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [WsAuthGuard, PresenceGateway],
  exports: [PresenceGateway],
})
export class PresenceModule {}
