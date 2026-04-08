import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  OptionalProps,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BotProfile } from './bot-profile.entity';

@Entity({ tableName: 'bot_activity_logs' })
@Index({ properties: ['botProfile', 'executedAt'] })
export class BotActivityLog {
  [OptionalProps]?: 'success' | 'executedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => BotProfile)
  botProfile!: BotProfile;

  @Property({ type: 'varchar', length: 50 })
  actionType!: string;

  @Property({ type: 'uuid', nullable: true })
  targetId?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ type: 'boolean', default: true })
  success: boolean = true;

  @Property({ type: 'varchar', length: 255, nullable: true })
  errorMessage?: string;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  executedAt: Date = new Date();
}
