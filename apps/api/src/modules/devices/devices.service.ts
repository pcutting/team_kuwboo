import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Device } from './entities/device.entity';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DevicesService {
  constructor(private readonly em: EntityManager) {}

  async register(user: User, dto: RegisterDeviceDto): Promise<Device> {
    // Upsert: if token exists, update ownership; otherwise create
    let device = await this.em.findOne(Device, { fcmToken: dto.fcmToken });

    if (device) {
      device.user = user;
      device.platform = dto.platform;
      device.appVersion = dto.appVersion;
      device.deviceModel = dto.deviceModel;
      device.osVersion = dto.osVersion;
      device.isActive = true;
      device.lastActiveAt = new Date();
    } else {
      device = this.em.create(Device, {
        user,
        ...dto,
      } as any);
    }

    await this.em.flush();
    return device;
  }

  async getActiveDevices(userId: string): Promise<Device[]> {
    return this.em.find(Device, { user: { id: userId }, isActive: true });
  }

  async deactivate(fcmToken: string): Promise<void> {
    await this.em.nativeUpdate(Device, { fcmToken }, { isActive: false });
  }

  async deactivateAllForUser(userId: string): Promise<void> {
    await this.em.nativeUpdate(Device, { user: { id: userId } }, { isActive: false });
  }
}
