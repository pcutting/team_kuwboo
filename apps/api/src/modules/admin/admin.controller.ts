import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuditService } from './admin-audit.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateContentStatusDto } from './dto/update-content-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, UserStatus, ContentStatus, ContentType } from '../../common/enums';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get('users')
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: UserStatus,
    @Query('role') role?: Role,
    @Query('isBot') isBot?: string,
  ) {
    return this.adminService.listUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
      role,
      isBot !== undefined ? isBot === 'true' : undefined,
    );
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('role') adminRole: Role,
  ) {
    return this.adminService.updateUserStatus(id, dto.status, adminRole);
  }

  @Patch('users/:id/role')
  @Roles(Role.SUPER_ADMIN)
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('role') adminRole: Role,
  ) {
    return this.adminService.updateUserRole(id, dto.role, adminRole);
  }

  @Delete('media/:id')
  async deleteMedia(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteMedia(id);
    return { message: 'Media deleted' };
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // --- Content Moderation ---

  @Get('content')
  async listContent(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ContentStatus,
    @Query('type') type?: ContentType,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.adminService.listContent(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
      type,
      creatorId,
    );
  }

  @Get('content/flagged')
  async listFlaggedContent(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listFlaggedContent(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('content/:id/status')
  async updateContentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContentStatusDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.adminService.updateContentStatus(id, dto.status, adminUserId);
  }

  @Post('content/:id/restore')
  async restoreContent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.adminService.restoreContent(id, adminUserId);
  }

  // --- Comment Moderation ---

  @Get('comments')
  async listComments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('contentId') contentId?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.adminService.listComments(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      contentId,
      authorId,
    );
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    await this.adminService.deleteComment(id, adminUserId);
    return { message: 'Comment deleted' };
  }

  // --- Audit Log ---

  @Get('audit-log')
  async listAuditLog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('adminUserId') adminUserId?: string,
    @Query('actionType') actionType?: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.auditService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      adminUserId,
      actionType,
      targetType,
    );
  }
}
