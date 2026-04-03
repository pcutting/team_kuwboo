import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { S3Provider } from './providers/s3.provider';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MikroOrmModule.forFeature([Media]), UsersModule],
  controllers: [MediaController],
  providers: [MediaService, S3Provider],
  exports: [MediaService],
})
export class MediaModule {}
