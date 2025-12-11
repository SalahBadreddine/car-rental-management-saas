import { Controller, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get dashboard statistics (Admin only)
   * GET /dashboard/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can access dashboard stats.');
    }

    return this.dashboardService.getStats(user.tenant_id);
  }
}
