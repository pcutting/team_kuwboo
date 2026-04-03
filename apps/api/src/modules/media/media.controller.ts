import { Controller, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { PresignedUrlRequestDto } from './dto/presigned-url.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly usersService: UsersService,
  ) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @CurrentUser('id') userId: string,
    @Body() dto: PresignedUrlRequestDto,
  ) {
    const user = await this.usersService.findById(userId);
    return this.mediaService.generatePresignedUrl(user, dto);
  }

  @Post(':id/confirm')
  async confirmUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.mediaService.confirmUpload(id, userId);
  }
}
