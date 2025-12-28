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
  Query,
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
    // For customers without tenant_id, we'll get it from the car they're booking
    // For admins with tenant_id, we'll validate it matches the car's tenant
    return this.reservationsService.create(body, user.tenant_id || null, user.id);
  }

  /**
   * Get all reservations for the tenant (Admin only)
   * GET /reservations
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('customer_id') customerId?: string,
    @Query('car_id') carId?: string,
    @Query('pickup_location_id') pickupLocationId?: string,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    // Admin should see all reservations for their tenant
    if (user.role === 'client_admin') {
      return this.reservationsService.findAllByTenant(user.tenant_id, {
        status,
        customerId,
        carId,
        pickupLocationId,
      });
    }

    // Customers only see their own reservations
    return this.reservationsService.findByCustomer(user.id);
  }

  /**
   * Get reservation statistics for dashboard (Admin only)
   * GET /reservations/statistics
   * NOTE: Must be declared BEFORE :id route to avoid path conflict
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@CurrentUser() user: any, @Query('locationId') locationId?: string) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can access reservation statistics.');
    }

    return this.reservationsService.getStatistics(user.tenant_id, locationId);
  }

  /**
   * Get all reservations for a specific customer (Admin only)
   * GET /reservations/customer/:customer_id
   */
  @Get('customer/:customer_id')
  @UseGuards(JwtAuthGuard)
  async findByCustomerId(
    @Param('customer_id') customerId: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can view customer reservations.');
    }

    return this.reservationsService.findByCustomerId(customerId, user.tenant_id);
  }

  /**
   * Get all reservations for a specific car (Admin only)
   * GET /reservations/car/:car_id
   */
  @Get('car/:car_id')
  @UseGuards(JwtAuthGuard)
  async findByCarId(
    @Param('car_id') carId: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    if (user.role !== 'client_admin') {
      throw new BadRequestException('Only admins can view car reservations.');
    }

    return this.reservationsService.findByCarId(carId, user.tenant_id);
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
