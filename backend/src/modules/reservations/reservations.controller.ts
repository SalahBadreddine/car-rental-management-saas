import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Create a new reservation (Customer only)
   * POST /reservations
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateReservationDto, @CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to create a reservation.');
    }

    return this.reservationsService.create(body, user.tenant_id, user.id);
  }

  /**
   * Get all reservations for the tenant (Admin only)
   * GET /reservations
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    // Admin should see all reservations for their tenant
    if (user.role === 'client_admin') {
      return this.reservationsService.findAllByTenant(user.tenant_id);
    }

    // Customers only see their own reservations
    return this.reservationsService.findByCustomer(user.id);
  }

  /**
   * Get single reservation details
   * GET /reservations/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    return this.reservationsService.findOne(id, user.tenant_id);
  }

  /**
   * Update reservation status (Admin only)
   * PATCH /reservations/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can update reservation status.');
    }

    return this.reservationsService.updateStatus(id, status, user.tenant_id);
  }

  /**
   * Cancel/Delete a reservation (Admin only)
   * DELETE /reservations/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can cancel reservations.');
    }

    return this.reservationsService.cancel(id, user.tenant_id);
  }
}
