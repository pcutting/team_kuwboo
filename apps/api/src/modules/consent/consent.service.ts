import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserConsent } from './entities/user-consent.entity';
import { GrantConsentDto } from './dto/grant-consent.dto';
import { User } from '../users/entities/user.entity';
import { ConsentType } from '../../common/enums';

@Injectable()
export class ConsentService {
  constructor(private readonly em: EntityManager) {}

  async grant(user: User, dto: GrantConsentDto, ipAddress?: string): Promise<UserConsent> {
    // Revoke previous version of same consent type (if any)
    const existing = await this.em.findOne(UserConsent, {
      user,
      consentType: dto.consentType,
      revokedAt: null,
    });
    if (existing) {
      existing.revokedAt = new Date();
    }

    const consent = this.em.create(UserConsent, {
      user,
      consentType: dto.consentType,
      version: dto.version,
      source: dto.source,
      ipAddress,
    } as any);

    await this.em.flush();
    return consent;
  }

  async revoke(userId: string, consentType: ConsentType): Promise<void> {
    await this.em.nativeUpdate(
      UserConsent,
      { user: { id: userId }, consentType, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  async getActiveConsents(userId: string): Promise<UserConsent[]> {
    return this.em.find(UserConsent, { user: { id: userId }, revokedAt: null });
  }

  async hasActiveConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const count = await this.em.count(UserConsent, {
      user: { id: userId },
      consentType,
      revokedAt: null,
    });
    return count > 0;
  }
}
