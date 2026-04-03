import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Notification } from './entities/notification.entity';
import { DevicesService } from '../devices/devices.service';
import { NotificationType } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private firebaseApp: any;

  constructor(
    private readonly em: EntityManager,
    private readonly devicesService: DevicesService,
  ) {
    this.initFirebase();
  }

  private initFirebase(): void {
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          });
        }
      } else {
        this.firebaseApp = admin.app();
      }
    } catch {
      // Firebase not configured — push notifications disabled
    }
  }

  async send(
    user: User,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    // 1. Write to DB (inbox source of truth)
    const notification = this.em.create(Notification, {
      user,
      type,
      title,
      body,
      data,
    } as any);
    await this.em.flush();

    // 2. Send push to all active devices
    await this.sendPush(user.id, title, body, data);

    return notification;
  }

  async getForUser(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: Notification[]; nextCursor?: string }> {
    const where: any = { user: { id: userId } };
    if (cursor) {
      where.createdAt = { $lt: new Date(cursor) };
    }

    const items = await this.em.find(Notification, where, {
      orderBy: { createdAt: 'DESC' },
      limit: limit + 1,
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1].createdAt.toISOString();
    }

    return { items, nextCursor };
  }

  async markRead(id: string, userId: string): Promise<void> {
    const notification = await this.em.findOne(Notification, { id, user: { id: userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readAt = new Date();
    await this.em.flush();
  }

  async markAllRead(userId: string): Promise<number> {
    return this.em.nativeUpdate(
      Notification,
      { user: { id: userId }, readAt: null },
      { readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.em.count(Notification, { user: { id: userId }, readAt: null });
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.firebaseApp) return;

    const devices = await this.devicesService.getActiveDevices(userId);
    if (devices.length === 0) return;

    const admin = require('firebase-admin');
    const messaging = admin.messaging();

    const results = await Promise.allSettled(
      devices.map((device) =>
        messaging.send({
          token: device.fcmToken,
          notification: { title, body },
          data: data ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)]),
          ) : undefined,
        }),
      ),
    );

    // Deactivate stale tokens
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (
        result.status === 'rejected' &&
        (result.reason?.code === 'messaging/registration-token-not-registered' ||
          result.reason?.code === 'messaging/invalid-registration-token')
      ) {
        await this.devicesService.deactivate(devices[i].fcmToken);
      }
    }
  }
}
