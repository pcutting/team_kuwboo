import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../users/entities/user.entity';
import { Media } from '../media/entities/media.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Content } from '../content/entities/content.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Report } from '../reports/entities/report.entity';
import { Connection } from '../connections/entities/connection.entity';
import { Device } from '../devices/entities/device.entity';
import { Role, UserStatus, ContentStatus, ContentType, ReportTargetType, NotificationType, ReportStatus } from '../../common/enums';
import { AdminAuditService } from './admin-audit.service';
import { SessionsService } from '../sessions/sessions.service';
import { ContentService } from '../content/content.service';
import { EnforceAction } from './dto/enforce-report.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectQueue('bot-actions') private readonly botQueue: Queue,
    private readonly em: EntityManager,
    private readonly auditService: AdminAuditService,
    private readonly sessionsService: SessionsService,
    private readonly contentService: ContentService,
  ) {}

  // --- Enhanced User Management ---

  async getUserDetail(userId: string) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const [contentCount, commentCount, connectionCount, reportCount, devices] =
      await Promise.all([
        this.em.count(Content, { creator: userId }),
        this.em.count(Comment, { author: userId }, { filters: { notDeleted: false } }),
        this.em.count(Connection, {
          $or: [{ fromUser: userId }, { toUser: userId }],
        }),
        this.em.count(Report, { reportedUser: userId }),
        this.em.find(Device, { user: userId }),
      ]);

    const recentReports = await this.em.find(
      Report,
      { reportedUser: userId },
      { orderBy: { createdAt: 'DESC' }, limit: 10 },
    );

    return {
      user,
      engagement: {
        contentCount,
        commentCount,
        connectionCount,
      },
      reportHistory: {
        totalReports: reportCount,
        recentReports,
      },
      devices,
    };
  }

  async suspendUser(
    userId: string,
    reason: string,
    adminUserId: string,
    durationDays?: number,
  ): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    user.status = UserStatus.SUSPENDED;
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'SUSPEND_USER',
      'USER',
      userId,
      { reason, durationDays },
    );

    return user;
  }

  async warnUser(
    userId: string,
    message: string,
    adminUserId: string,
  ): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    this.em.create(Notification, {
      user: this.em.getReference(User, userId),
      type: NotificationType.SYSTEM,
      title: 'Warning from Admin',
      body: message,
      data: { type: 'admin_warning' },
    });
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'WARN_USER',
      'USER',
      userId,
      { message },
    );
  }

  async revokeUserSessions(
    userId: string,
    adminUserId: string,
  ): Promise<{ revokedCount: number }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const revokedCount = await this.sessionsService.revokeAllForUser(userId);

    await this.auditService.log(
      adminUserId,
      'REVOKE_SESSIONS',
      'USER',
      userId,
      { revokedCount },
    );

    return { revokedCount };
  }

  async getUserContent(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: Content[]; total: number }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const [items, total] = await this.em.findAndCount(
      Content,
      { creator: userId },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
        filters: { notDeleted: false },
      },
    );

    return { items, total };
  }

  async getUserReports(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: Report[]; total: number }> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const [items, total] = await this.em.findAndCount(
      Report,
      { reportedUser: userId },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
        populate: ['reporter'],
      },
    );

    return { items, total };
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: User[]; total: number }> {
    const searchPattern = `%${query}%`;

    const [items, total] = await this.em.findAndCount(
      User,
      {
        $or: [
          { name: { $ilike: searchPattern } },
          { email: { $ilike: searchPattern } },
          { phone: { $like: searchPattern } },
        ],
      },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
      },
    );

    return { items, total };
  }

  // --- Report Enforcement ---

  async enforceReport(
    reportId: string,
    action: EnforceAction,
    adminUserId: string,
    reason?: string,
  ): Promise<Report> {
    const report = await this.em.findOne(Report, { id: reportId }, {
      populate: ['reportedUser', 'reportedContent'],
    });
    if (!report) throw new NotFoundException('Report not found');

    switch (action) {
      case EnforceAction.REMOVE_CONTENT: {
        if (!report.reportedContent) {
          throw new BadRequestException('Report has no associated content');
        }
        await this.contentService.softDelete(
          report.reportedContent.id,
          adminUserId,
          true,
        );
        report.status = ReportStatus.RESOLVED;
        break;
      }

      case EnforceAction.WARN_USER: {
        if (!report.reportedUser) {
          throw new BadRequestException('Report has no associated user');
        }
        this.em.create(Notification, {
          user: this.em.getReference(User, report.reportedUser.id),
          type: NotificationType.SYSTEM,
          title: 'Warning from Admin',
          body: reason || 'Your account has been flagged for violating community guidelines.',
          data: { type: 'admin_warning', reportId },
        });
        report.status = ReportStatus.RESOLVED;
        break;
      }

      case EnforceAction.SUSPEND_USER: {
        if (!report.reportedUser) {
          throw new BadRequestException('Report has no associated user');
        }
        report.reportedUser.status = UserStatus.SUSPENDED;
        report.status = ReportStatus.RESOLVED;
        break;
      }

      case EnforceAction.DISMISS: {
        report.status = ReportStatus.DISMISSED;
        break;
      }
    }

    report.reviewedBy = adminUserId;
    report.reviewNotes = reason;
    report.reviewedAt = new Date();
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'ENFORCE_REPORT',
      'REPORT',
      reportId,
      { action, reason },
    );

    return report;
  }

  async listUsers(
    page = 1,
    limit = 20,
    status?: UserStatus,
    role?: Role,
    isBot?: boolean,
  ): Promise<{ items: User[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (isBot !== undefined) where.isBot = isBot;

    const [items, total] = await this.em.findAndCount(User, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
    });

    return { items, total };
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    adminRole: Role,
  ): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    // Prevent non-super-admins from modifying admins
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      if (adminRole !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('Only super admins can modify admin accounts');
      }
    }

    user.status = status;
    await this.em.flush();
    return user;
  }

  async updateUserRole(
    userId: string,
    newRole: Role,
    adminRole: Role,
  ): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    // Only SUPER_ADMIN can promote to ADMIN or SUPER_ADMIN
    if (
      (newRole === Role.ADMIN || newRole === Role.SUPER_ADMIN) &&
      adminRole !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only super admins can promote to admin roles');
    }

    user.role = newRole;
    await this.em.flush();
    return user;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.em.findOne(Media, { id: mediaId });
    if (!media) throw new NotFoundException('Media not found');
    await this.em.removeAndFlush(media);
  }

  async getStats(): Promise<Record<string, number>> {
    const [totalUsers, activeUsers, totalMedia, totalNotifications, totalBots, activeBots] = await Promise.all([
      this.em.count(User, {}),
      this.em.count(User, { status: UserStatus.ACTIVE }),
      this.em.count(Media, {}),
      this.em.count(Notification, {}),
      this.em.count(User, { isBot: true }),
      this.em.count(User, { isBot: true, status: UserStatus.ACTIVE }),
    ]);

    return { totalUsers, activeUsers, totalMedia, totalNotifications, totalBots, activeBots };
  }

  // --- Content Moderation ---

  async listContent(
    page = 1,
    limit = 20,
    status?: ContentStatus,
    type?: ContentType,
    creatorId?: string,
  ): Promise<{ items: Content[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (creatorId) where.creator = creatorId;

    const [items, total] = await this.em.findAndCount(Content, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
      populate: ['creator'],
      filters: { notDeleted: false },
    });

    return { items, total };
  }

  async listFlaggedContent(
    page = 1,
    limit = 20,
  ): Promise<{ items: Content[]; total: number }> {
    const reports = await this.em.find(
      Report,
      { targetType: ReportTargetType.CONTENT },
      { fields: ['reportedContent'], filters: false },
    );

    const contentIds = reports
      .map((r) => r.reportedContent?.id)
      .filter((id): id is string => !!id);

    const uniqueIds = [...new Set(contentIds)];

    if (uniqueIds.length === 0) {
      return { items: [], total: 0 };
    }

    const [items, total] = await this.em.findAndCount(
      Content,
      { id: { $in: uniqueIds } },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
        populate: ['creator'],
        filters: { notDeleted: false },
      },
    );

    return { items, total };
  }

  async updateContentStatus(
    contentId: string,
    status: ContentStatus,
    adminUserId: string,
  ): Promise<Content> {
    const content = await this.em.findOne(
      Content,
      { id: contentId },
      { filters: { notDeleted: false } },
    );
    if (!content) throw new NotFoundException('Content not found');

    const previousStatus = content.status;
    content.status = status;
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'UPDATE_CONTENT_STATUS',
      'CONTENT',
      contentId,
      { previousStatus, newStatus: status },
    );

    return content;
  }

  async restoreContent(
    contentId: string,
    adminUserId: string,
  ): Promise<Content> {
    const content = await this.em.findOne(
      Content,
      { id: contentId },
      { filters: { notDeleted: false } },
    );
    if (!content) throw new NotFoundException('Content not found');

    content.deletedAt = undefined;
    content.status = ContentStatus.ACTIVE;
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'RESTORE_CONTENT',
      'CONTENT',
      contentId,
    );

    return content;
  }

  // --- Comment Moderation ---

  async listComments(
    page = 1,
    limit = 20,
    contentId?: string,
    authorId?: string,
  ): Promise<{ items: Comment[]; total: number }> {
    const where: any = {};
    if (contentId) where.content = contentId;
    if (authorId) where.author = authorId;

    const [items, total] = await this.em.findAndCount(Comment, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
      populate: ['author', 'content'],
      filters: { notDeleted: false },
    });

    return { items, total };
  }

  async deleteComment(
    commentId: string,
    adminUserId: string,
  ): Promise<void> {
    const comment = await this.em.findOne(Comment, { id: commentId });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.deletedAt = new Date();
    await this.em.flush();

    await this.auditService.log(
      adminUserId,
      'DELETE_COMMENT',
      'COMMENT',
      commentId,
    );
  }

  async getSystemHealth(): Promise<Record<string, unknown>> {
    const queueCounts = await this.botQueue.getJobCounts();

    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      queueStats: queueCounts,
    };
  }
}
