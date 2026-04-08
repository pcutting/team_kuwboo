import { UseGuards, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface NotificationReadPayload {
  notificationId: string;
}

@WebSocketGateway({ namespace: '/notifications', cors: true })
@UseGuards(WsAuthGuard)
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket): void {
    const userId = client.data?.userId;

    if (userId) {
      client.join(`user:${userId}`);
    }

    this.logger.log(
      `Client connected to notifications: ${client.id} (user: ${userId})`,
    );
  }

  @SubscribeMessage('notification:read')
  handleRead(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: NotificationReadPayload,
  ): { event: string; data: { id: string } } {
    const notificationId = data?.notificationId;

    if (!notificationId) {
      return { event: 'notification:error', data: { id: '' } };
    }

    return {
      event: 'notification:read:ack',
      data: { id: notificationId },
    };
  }

  /**
   * Emit a new notification to a specific user.
   * Call this from NotificationsService when a notification is created.
   */
  emitNotification(userId: string, notification: NotificationPayload): void {
    this.server
      .to(`user:${userId}`)
      .emit('notification:new', notification);
  }

  /**
   * Emit a badge count update to a specific user.
   * Call this from NotificationsService when unread count changes.
   */
  emitBadgeUpdate(userId: string, count: number): void {
    this.server
      .to(`user:${userId}`)
      .emit('badge:update', { count });
  }
}
