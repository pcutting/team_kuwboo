import { Entity, PrimaryKey, Property, ManyToOne, Enum, Unique, OptionalProps } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { ConsentType, ConsentSource } from '../../../common/enums';

@Entity({ tableName: 'user_consents' })
@Unique({ properties: ['user', 'consentType', 'version'] })
export class UserConsent {
  [OptionalProps]?: 'grantedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => ConsentType })
  consentType!: ConsentType;

  @Property({ type: 'varchar', length: 20 })
  version!: string;

  @Enum({ items: () => ConsentSource })
  source!: ConsentSource;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  grantedAt: Date = new Date();

  @Property({ type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Property({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;
}
