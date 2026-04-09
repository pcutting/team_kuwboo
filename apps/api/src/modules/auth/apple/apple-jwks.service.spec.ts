import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import {
  generateKeyPair,
  SignJWT,
  exportJWK,
  createLocalJWKSet,
  type JWK,
  type KeyLike,
} from 'jose';
import { AppleJwksService } from './apple-jwks.service';

/**
 * Unit tests for AppleJwksService.
 *
 * Strategy: generate a local ES256 key pair, mint tokens on demand with
 * the private key, and override the service's internal JWKS getter with
 * a createLocalJWKSet built from the matching public key. This means the
 * tests exercise the real jwtVerify code path — including algorithm
 * enforcement, audience matching, issuer checking, and claim validation —
 * without any network IO.
 *
 * The "wrong signature" test uses a SECOND unrelated key pair to prove
 * that signature verification actually runs and rejects tokens signed
 * by the wrong key.
 */
describe('AppleJwksService', () => {
  const BUNDLE_ID = 'com.kuwboo.app';
  const SERVICE_ID = 'com.kuwboo.web';
  const ISSUER = 'https://appleid.apple.com';
  const KID = 'test-key-1';

  let service: AppleJwksService;
  let privateKey: KeyLike;
  let publicJwk: JWK;
  let otherPrivateKey: KeyLike; // unrelated key for signature-failure tests

  async function buildService(audiences: {
    bundle?: string;
    serviceId?: string;
  }): Promise<AppleJwksService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleJwksService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'apple.bundleId') return audiences.bundle;
              if (key === 'apple.serviceId') return audiences.serviceId;
              return undefined;
            },
          },
        },
      ],
    }).compile();

    const svc = module.get(AppleJwksService);
    svc.onModuleInit();

    // Override the (real) remote JWKS fetcher with a local one backed by
    // the fixture public key. Cast via unknown to reach the private field.
    (svc as unknown as { jwks: ReturnType<typeof createLocalJWKSet> }).jwks =
      createLocalJWKSet({ keys: [publicJwk] });

    return svc;
  }

  interface SignOptions {
    iss?: string;
    aud?: string | string[];
    exp?: number;
    iat?: number;
    sub?: string;
    kid?: string;
    alg?: 'ES256' | 'RS256';
    signWith?: KeyLike;
    extraClaims?: Record<string, unknown>;
  }

  async function mint(opts: SignOptions = {}): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const jwt = new SignJWT({
      ...(opts.extraClaims ?? {}),
    })
      .setProtectedHeader({
        alg: opts.alg ?? 'ES256',
        kid: opts.kid ?? KID,
        typ: 'JWT',
      })
      .setIssuer(opts.iss ?? ISSUER)
      .setAudience(opts.aud ?? BUNDLE_ID)
      .setIssuedAt(opts.iat ?? now)
      .setExpirationTime(opts.exp ?? now + 600)
      .setSubject(opts.sub ?? '001234.abcdef.0001');

    return jwt.sign(opts.signWith ?? privateKey);
  }

  beforeAll(async () => {
    // Primary fixture key — used by the service's local JWKS
    const kp = await generateKeyPair('ES256', { extractable: true });
    privateKey = kp.privateKey;
    publicJwk = {
      ...(await exportJWK(kp.publicKey)),
      kid: KID,
      alg: 'ES256',
      use: 'sig',
    };

    // Unrelated key — used to prove signature verification actually runs
    const other = await generateKeyPair('ES256', { extractable: true });
    otherPrivateKey = other.privateKey;
  });

  describe('with bundle ID only', () => {
    beforeEach(async () => {
      service = await buildService({ bundle: BUNDLE_ID });
    });

    it('verifies a well-formed token signed by Apple', async () => {
      const token = await mint();
      const claims = await service.verify(token);
      expect(claims.sub).toBe('001234.abcdef.0001');
      expect(claims.iss).toBe(ISSUER);
      expect(claims.aud).toBe(BUNDLE_ID);
    });

    it('rejects a token with the wrong audience', async () => {
      const token = await mint({ aud: 'com.evil.app' });
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a token with the wrong issuer', async () => {
      const token = await mint({ iss: 'https://evil.example.com' });
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an expired token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const token = await mint({ iat: now - 7200, exp: now - 3600 });
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a token signed by an unrelated key', async () => {
      const token = await mint({ signWith: otherPrivateKey });
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a malformed token', async () => {
      await expect(service.verify('not.a.jwt')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('preserves S2S-specific claims when present', async () => {
      const eventsJson = JSON.stringify({
        type: 'consent-revoked',
        sub: '001234.abcdef.0001',
        event_time: Date.now(),
      });
      const token = await mint({
        extraClaims: { events: eventsJson },
      });
      const claims = await service.verify(token);
      expect(claims.events).toBe(eventsJson);
    });

    it('preserves identity-token claims (email, is_private_email)', async () => {
      const token = await mint({
        extraClaims: {
          email: 'user@privaterelay.appleid.com',
          is_private_email: 'true',
          email_verified: 'true',
        },
      });
      const claims = await service.verify(token);
      expect(claims.email).toBe('user@privaterelay.appleid.com');
      expect(claims.is_private_email).toBe('true');
    });
  });

  describe('with bundle ID + service ID', () => {
    beforeEach(async () => {
      service = await buildService({
        bundle: BUNDLE_ID,
        serviceId: SERVICE_ID,
      });
    });

    it('accepts a token minted for the bundle ID audience', async () => {
      const token = await mint({ aud: BUNDLE_ID });
      const claims = await service.verify(token);
      expect(claims.aud).toBe(BUNDLE_ID);
    });

    it('accepts a token minted for the service ID audience', async () => {
      const token = await mint({ aud: SERVICE_ID });
      const claims = await service.verify(token);
      expect(claims.aud).toBe(SERVICE_ID);
    });

    it('rejects a token for an audience not on the list', async () => {
      const token = await mint({ aud: 'com.someone.else' });
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('with no audiences configured', () => {
    beforeEach(async () => {
      service = await buildService({});
    });

    it('rejects every token (fails closed)', async () => {
      const token = await mint();
      await expect(service.verify(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
