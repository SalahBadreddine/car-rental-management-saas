import { Inject, Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Record a new payment for a reservation
   */
  async recordPayment(dto: CreatePaymentDto, tenantId: string, recordedBy: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    // Get the reservation and verify it belongs to this tenant
    const { data: reservation, error: resError } = await this.supabaseClient
      .from('reservations')
      .select('*, cars(make, model), profiles:customer_id(id, full_name, email)')
      .eq('id', dto.reservationId)
      .eq('tenant_id', tenantId)
      .single();

    if (resError || !reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    // Insert the payment
    const { data: payment, error: payError } = await this.supabaseClient
      .from('payments')
      .insert({
        tenant_id: tenantId,
        reservation_id: dto.reservationId,
        amount: dto.amount,
        payment_method: dto.paymentMethod,
        notes: dto.notes || null,
        recorded_by: recordedBy,
      })
      .select('*')
      .single();

    if (payError) {
      throw new InternalServerErrorException(`Failed to record payment: ${payError.message}`);
    }

    // Calculate new total paid
    const currentPaid = Number(reservation.amount_paid) || 0;
    const newTotalPaid = currentPaid + dto.amount;
    const totalPrice = Number(reservation.total_price);

    // Determine payment status
    let paymentStatus = 'unpaid';
    if (newTotalPaid >= totalPrice) {
      paymentStatus = 'paid';
    } else if (newTotalPaid > 0) {
      paymentStatus = 'partial';
    }

    // Update reservation with new payment totals
    const { error: updateError } = await this.supabaseClient
      .from('reservations')
      .update({
        amount_paid: newTotalPaid,
        payment_status: paymentStatus,
      })
      .eq('id', dto.reservationId);

    if (updateError) {
      console.error('Failed to update reservation payment status:', updateError);
    }

    // Notify customer about payment received
    const vehicleName = reservation.cars 
      ? `${reservation.cars.make} ${reservation.cars.model}` 
      : 'Vehicle';

    if (reservation.profiles?.id) {
      await this.notificationsService.createNotification({
        userId: reservation.profiles.id,
        tenantId,
        title: 'Payment Received',
        message: `Your payment of ${dto.amount} DZD for ${vehicleName} has been recorded.`,
        type: 'payment_received',
      });
    }

    // Send payment confirmation email if customer has email
    if (reservation.profiles?.email) {
      await this.emailService.sendPaymentConfirmationEmail(
        reservation.profiles.email,
        dto.amount,
        dto.reservationId,
        vehicleName,
      );
    }

    return {
      payment,
      reservation: {
        id: dto.reservationId,
        total_price: totalPrice,
        amount_paid: newTotalPaid,
        payment_status: paymentStatus,
      },
    };
  }

  /**
   * Get all payments for a reservation
   */
  async findByReservation(reservationId: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('payments')
      .select('*, profiles:recorded_by(full_name)')
      .eq('reservation_id', reservationId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch payments: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Get all payments for the tenant
   */
  async findAllByTenant(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('payments')
      .select(`
        *,
        reservations (
          id,
          total_price,
          cars (make, model),
          profiles:customer_id (full_name)
        ),
        profiles:recorded_by (full_name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch payments: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Delete a payment and update reservation totals
   */
  async deletePayment(paymentId: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    // Get the payment first
    const { data: payment, error: getError } = await this.supabaseClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('tenant_id', tenantId)
      .single();

    if (getError || !payment) {
      throw new NotFoundException('Payment not found.');
    }

    // Delete the payment
    const { error: deleteError } = await this.supabaseClient
      .from('payments')
      .delete()
      .eq('id', paymentId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      throw new InternalServerErrorException(`Failed to delete payment: ${deleteError.message}`);
    }

    // Recalculate reservation totals
    const { data: remainingPayments } = await this.supabaseClient
      .from('payments')
      .select('amount')
      .eq('reservation_id', payment.reservation_id);

    const newTotalPaid = (remainingPayments ?? []).reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // Get reservation total price
    const { data: reservation } = await this.supabaseClient
      .from('reservations')
      .select('total_price')
      .eq('id', payment.reservation_id)
      .single();

    const totalPrice = Number(reservation?.total_price) || 0;

    // Determine new payment status
    let paymentStatus = 'unpaid';
    if (newTotalPaid >= totalPrice) {
      paymentStatus = 'paid';
    } else if (newTotalPaid > 0) {
      paymentStatus = 'partial';
    }

    // Update reservation
    await this.supabaseClient
      .from('reservations')
      .update({
        amount_paid: newTotalPaid,
        payment_status: paymentStatus,
      })
      .eq('id', payment.reservation_id);

    return { 
      message: 'Payment deleted successfully',
      reservation: {
        id: payment.reservation_id,
        amount_paid: newTotalPaid,
        payment_status: paymentStatus,
      },
    };
  }

  /**
   * Get payment statistics for dashboard
   */
  async getPaymentStats(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data: payments, error } = await this.supabaseClient
      .from('payments')
      .select('amount, payment_method, created_at')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch payment stats: ${error.message}`);
    }

    const allPayments = payments ?? [];

    // Total collected
    const totalCollected = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // By payment method
    const byMethod: Record<string, number> = {};
    allPayments.forEach((p) => {
      byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + Number(p.amount);
    });

    // Recent payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPayments = allPayments.filter(
      (p) => new Date(p.created_at) >= thirtyDaysAgo
    );
    const recentTotal = recentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      total_collected: totalCollected,
      by_method: byMethod,
      recent_30_days: recentTotal,
      total_transactions: allPayments.length,
    };
  }
}
