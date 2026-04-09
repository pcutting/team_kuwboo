import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appleConfig from '../../../config/apple.config';
import { AppleJwksService } from './apple-jwks.service';

/**
 * Apple-specific auth primitives.
 *
 * Currently exports AppleJwksService which verifies Apple's ES256 JWS
 * for both sign-in identity tokens and Server-to-Server notifications.
 *
 * Future members:
 *   - AppleTokenService (for the /auth/token and /auth/revoke flows
 *     that require a client secret signed with the .p8 private key)
 *   - AppleNotificationIngestService (S2S webhook ingest, PR 5)
 *   - AppleNotificationHandlerService (event processing, PR 6)
 */
@Module({
  imports: [ConfigModule.forFeature(appleConfig)],
  providers: [AppleJwksService],
  exports: [AppleJwksService],
})
export class AppleAuthModule {}
