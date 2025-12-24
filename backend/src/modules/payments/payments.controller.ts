import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Record a new payment (Admin only)
   */
  @Post()
  async recordPayment(@Body() dto: CreatePaymentDto, @Request() req: any) {
    const tenantId = req.user?.user_metadata?.tenant_id;
    const userId = req.user?.id;
    return this.paymentsService.recordPayment(dto, tenantId, userId);
  }

  /**
   * Get all payments for the tenant (Admin only)
   */
  @Get()
  async findAll(@Request() req: any) {
    const tenantId = req.user?.user_metadata?.tenant_id;
    return this.paymentsService.findAllByTenant(tenantId);
  }

  /**
   * Get payment statistics (Admin only)
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const tenantId = req.user?.user_metadata?.tenant_id;
    return this.paymentsService.getPaymentStats(tenantId);
  }

  /**
   * Get payments for a specific reservation
   */
  @Get('reservation/:reservationId')
  async findByReservation(
    @Param('reservationId') reservationId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user?.user_metadata?.tenant_id;
    return this.paymentsService.findByReservation(reservationId, tenantId);
  }

  /**
   * Delete a payment (Admin only)
   */
  @Delete(':id')
  async deletePayment(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.user_metadata?.tenant_id;
    return this.paymentsService.deletePayment(id, tenantId);
  }
}
