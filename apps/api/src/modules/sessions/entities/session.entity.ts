import { Entity, PrimaryKey, Property, ManyToOne, OptionalProps } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';

@Entity({ tableName: 'sessions' })
export class Session {
  [OptionalProps]?: 'isRevoked' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'varchar', length: 255, hidden: true })
  refreshTokenHash!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Property({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Property({ type: 'timestamptz' })
  expiresAt!: Date;

  @Property({ type: 'boolean', default: false })
  isRevoked: boolean = false;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  createdAt: Date = new Date();
}
