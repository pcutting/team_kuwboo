import { Entity, PrimaryKey, Property, Enum, Index, OptionalProps } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { VerificationType } from '../../../common/enums';

@Entity({ tableName: 'verifications' })
@Index({ properties: ['identifier', 'type'] })
export class Verification {
  [OptionalProps]?: 'attempts' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'varchar', length: 255 })
  identifier!: string;

  @Property({ type: 'varchar', length: 255, hidden: true })
  codeHash!: string;

  @Enum({ items: () => VerificationType })
  type!: VerificationType;

  @Property({ type: 'timestamptz' })
  expiresAt!: Date;

  @Property({ type: 'int', default: 0 })
  attempts: number = 0;

  @Property({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  createdAt: Date = new Date();
}
