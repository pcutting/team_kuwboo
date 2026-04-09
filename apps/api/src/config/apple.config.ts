import { registerAs } from '@nestjs/config';

/**
 * Apple Sign In configuration.
 *
 * APPLE_BUNDLE_ID is the iOS App ID (e.g. com.kuwboo.app). Every Apple
 * identity token and Server-to-Server notification we accept MUST have
 * its `aud` claim equal to this value.
 *
 * APPLE_SERVICE_ID is the Services ID used for the optional web "Sign in
 * with Apple" button. When set, web-issued tokens with this audience
 * are also accepted.
 *
 * APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY are reserved for the
 * future Apple token / revoke endpoint. They are not consumed yet but are
 * registered here so the secret bundle is provisioned and validated in one
 * place.
 */
export default registerAs('apple', () => {
  const bundleId = process.env.APPLE_BUNDLE_ID;
  const serviceId = process.env.APPLE_SERVICE_ID;

  if (process.env.NODE_ENV === 'production' && !bundleId) {
    throw new Error(
      'APPLE_BUNDLE_ID is required in production — Apple Sign In cannot ' +
        'verify audience claims without it.',
    );
  }

  return {
    bundleId: bundleId ?? '',
    serviceId: serviceId ?? undefined,
    teamId: process.env.APPLE_TEAM_ID ?? undefined,
    keyId: process.env.APPLE_KEY_ID ?? undefined,
    privateKey: process.env.APPLE_PRIVATE_KEY ?? undefined,
  };
});
