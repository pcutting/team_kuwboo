import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class SessionsService {
  constructor(private readonly em: EntityManager) {}

  async create(
    user: User,
    refreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<Session> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    const session = this.em.create(Session, {
      user,
      refreshTokenHash,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt,
    } as any);

    await this.em.flush();
    return session;
  }

  async findValidSession(userId: string): Promise<Session | null> {
    return this.em.findOne(Session, {
      user: { id: userId },
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async validateRefreshToken(session: Session, token: string): Promise<boolean> {
    return bcrypt.compare(token, session.refreshTokenHash);
  }

  async revoke(session: Session): Promise<void> {
    session.isRevoked = true;
    await this.em.flush();
  }

  async revokeAllForUser(userId: string): Promise<number> {
    return this.em.nativeUpdate(
      Session,
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }
}
