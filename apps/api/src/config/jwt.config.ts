import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
}));
