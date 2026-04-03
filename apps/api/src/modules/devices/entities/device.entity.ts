import { Entity, PrimaryKey, Property, ManyToOne, Enum, OptionalProps } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { DevicePlatform } from '../../../common/enums';

@Entity({ tableName: 'devices' })
export class Device {
  [OptionalProps]?: 'isActive' | 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'varchar', length: 512, unique: true })
  fcmToken!: string;

  @Enum({ items: () => DevicePlatform })
  platform!: DevicePlatform;

  @Property({ type: 'varchar', length: 20, nullable: true })
  appVersion?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  deviceModel?: string;

  @Property({ type: 'varchar', length: 20, nullable: true })
  osVersion?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  lastActiveAt: Date = new Date();

  @Property({ type: 'timestamptz', defaultRaw: 'now()' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
