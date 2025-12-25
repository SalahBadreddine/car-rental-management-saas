import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get all notifications for current user
   * GET /notifications?is_read=true|false
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() user: any,
    @Query('is_read') isRead?: string,
  ) {
    if (!user?.id) {
      throw new BadRequestException('User context is required.');
    }

    // Parse is_read query param
    let isReadBool: boolean | undefined;
    if (isRead === 'true') isReadBool = true;
    if (isRead === 'false') isReadBool = false;

    return this.notificationsService.findAll(user.id, user.tenant_id, isReadBool);
  }

  /**
   * Mark a single notification as read
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.id) {
      throw new BadRequestException('User context is required.');
    }

    return this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new BadRequestException('User context is required.');
    }

    return this.notificationsService.markAllAsRead(user.id, user.tenant_id);
  }
}
