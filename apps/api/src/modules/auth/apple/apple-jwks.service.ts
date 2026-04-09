import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';

/**
 * Claims we expect on Apple-issued JWTs — both identity tokens (sign-in
 * flow) and Server-to-Server notification payloads.
 *
 * Notes on the shape:
 *  - `sub` is Apple's stable per-user-per-team identifier. We store it
 *    on `User.appleId`.
 *  - `is_private_email` is a STRING ("true" / "false") on identity tokens.
 *    Apple documents the type inconsistently; we tolerate both.
 *  - `events` is a JSON-encoded STRING on S2S payloads. Callers must
 *    `JSON.parse` it before use.
 */
export interface AppleJwtClaims extends JWTPayload {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  events?: string;
  transfer_sub?: string;
}

/**
 * Verifies JSON Web Signatures issued by Apple for both:
 *   1. Sign In with Apple identity tokens (client sign-in flow)
 *   2. Server-to-Server notifications (account-delete, consent-revoked,
 *      email-disabled, email-enabled)
 *
 * Apple signs with ES256 (elliptic curve) and publishes its JWKS at
 * https://appleid.apple.com/auth/keys. Keys rotate roughly twice a year.
 *
 * `jose.createRemoteJWKSet` handles:
 *   - HTTP fetch with timeout
 *   - In-process cache with configurable TTL (default 10 min; we set 1h)
 *   - Cooldown window between forced refreshes on unknown `kid`
 *   - Key selection by `kid` from the header
 *
 * The service accepts an ARRAY of audiences because Kuwboo may eventually
 * offer both an iOS ("Sign in with Apple" from the mobile app, audience =
 * bundle ID) and a web ("Sign in with Apple" button on kuwboo.com,
 * audience = Services ID) flow. A single verifier satisfies both.
 *
 * The service is shared by AuthService (identity token verification on
 * sign-in) and the Apple S2S notifications ingest pipeline. Centralizing
 * verification here means the signature-check path is defined once,
 * tested once, and cannot be bypassed by accident.
 */
@Injectable()
export class AppleJwksService implements OnModuleInit {
  private readonly logger = new Logger(AppleJwksService.name);
  private readonly issuer = 'https://appleid.apple.com';
  private readonly jwksUrl = new URL(`${this.issuer}/auth/keys`);

  private jwks!: JWTVerifyGetKey;
  private audiences: string[] = [];

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.jwks = createRemoteJWKSet(this.jwksUrl, {
      cacheMaxAge: 60 * 60 * 1000, // 1 hour
      cooldownDuration: 30 * 1000, // 30 seconds
      timeoutDuration: 5_000, // 5 seconds
    });

    const bundleId = this.config.get<string>('apple.bundleId');
    const serviceId = this.config.get<string>('apple.serviceId');

    const audiences: string[] = [];
    if (bundleId) audiences.push(bundleId);
    if (serviceId) audiences.push(serviceId);

    this.audiences = audiences;

    if (this.audiences.length === 0) {
      this.logger.warn(
        'AppleJwksService initialized with no audiences — ' +
          'verification will reject all tokens until APPLE_BUNDLE_ID is set.',
      );
    } else {
      this.logger.log(
        `AppleJwksService ready — accepting ${this.audiences.length} audience(s)`,
      );
    }
  }

  /**
   * Verify an Apple-issued JWS and return its claims.
   *
   * Throws `UnauthorizedException` on any verification failure:
   *   - unknown or expired signing key
   *   - wrong issuer
   *   - wrong audience (none of the configured audiences matched)
   *   - wrong algorithm (anything other than ES256)
   *   - expired `exp` / future `nbf`
   *   - malformed JWT
   *
   * Callers should NOT log the token itself on failure — the redact
   * config in app.module handles this, but exception messages here are
   * intentionally generic to avoid oracle attacks.
   */
  async verify(token: string): Promise<AppleJwtClaims> {
    if (this.audiences.length === 0) {
      // Fail closed if misconfigured. Better to 401 everything than
      // accept tokens with an empty audience list.
      throw new UnauthorizedException('Apple verification unavailable');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audiences,
        algorithms: ['ES256'],
      });

      if (!payload.sub) {
        throw new UnauthorizedException('Apple token missing sub');
      }

      return payload as AppleJwtClaims;
    } catch (err) {
      // Log the failure reason at warn level — helps debugging misconfigs
      // and detecting attacks, but the raw token is never logged.
      const message = err instanceof Error ? err.message : 'unknown error';
      this.logger.warn(`Apple JWS verification failed: ${message}`);
      throw new UnauthorizedException('Invalid Apple token');
    }
  }
}
