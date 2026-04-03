import { Entity, PrimaryKey, Property, ManyToOne, Enum, Index, OptionalProps } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../../../common/enums';

@Entity({ tableName: 'notifications' })
@Index({ properties: ['user', 'readAt'] })
export class Notification {
  [OptionalProps]?: 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => NotificationType })
  type!: NotificationType;

  @Property({ type: 'varchar', length: 255 })
  title!: string;

  @Property({ type: 'text' })
  body!: string;

  @Property({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @Property({ type: 'varchar', length: 100, nullable: true })
  groupKey?: string;

  @Property({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  createdAt: Date = new Date();
}
