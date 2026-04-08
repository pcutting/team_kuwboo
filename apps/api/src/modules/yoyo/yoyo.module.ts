import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProximityGateway } from './proximity.gateway';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [WsAuthGuard, ProximityGateway],
  exports: [ProximityGateway],
})
export class YoyoModule {}
