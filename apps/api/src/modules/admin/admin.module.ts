import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminAuditService } from './admin-audit.service';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([AdminAuditLog]),
    SessionsModule,
    ContentModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminAuditService],
})
export class AdminModule {}
