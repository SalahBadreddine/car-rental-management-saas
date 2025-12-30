import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateReservationDto, tenantId: string | null, customerId: string) {
    if (!customerId) {
      throw new BadRequestException('Customer ID is required to create a reservation.');
    }

    // Verify the car exists and get its price
    const { data: car, error: carError } = await this.supabaseClient
      .from('cars')
      .select('id, price_per_day, status, tenant_id')
      .eq('id', dto.carId)
      .single();

    if (carError || !car) {
      throw new BadRequestException('Car not found.');
    }

    // If user has tenant_id (admin), verify it matches the car's tenant
    // If user doesn't have tenant_id (customer), use the car's tenant
    const reservationTenantId = tenantId || car.tenant_id;
    
    if (tenantId && car.tenant_id !== tenantId) {
      throw new BadRequestException('Car does not belong to this tenant.');
    }

    if (car.status !== 'available') {
      throw new BadRequestException('Car is not available for reservation.');
    }

    // Calculate total price if not provided
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      throw new BadRequestException('End date must be after start date.');
    }

    const totalPrice = dto.totalPrice ?? (days * car.price_per_day);

    // Check for overlapping reservations to prevent duplicates
    // A reservation overlaps if: start_date <= endDate AND end_date >= startDate
    const { data: overlapping, error: overlapError } = await this.supabaseClient
      .from('reservations')
      .select('id')
      .eq('car_id', dto.carId)
      .neq('status', 'cancelled')
      .or(`and(start_date.lte.${dto.endDate},end_date.gte.${dto.startDate})`);

    if (overlapError) {
      throw new InternalServerErrorException(`Failed to check availability: ${overlapError.message}`);
    }

    if (overlapping && overlapping.length > 0) {
      throw new BadRequestException('Car is not available for the selected dates. Please choose different dates.');
    }

    const payload = {
      tenant_id: reservationTenantId,
      car_id: dto.carId,
      customer_id: customerId,
      start_date: dto.startDate,
      end_date: dto.endDate,
      total_price: totalPrice,
      status: 'pending',
    };

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to create reservation: ${error.message}`);
    }

    // Get car and customer details for notification
    const { data: carDetails } = await this.supabaseClient
      .from('cars')
      .select('make, model')
      .eq('id', dto.carId)
      .single();

    const { data: customerDetails } = await this.supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', customerId)
      .single();

    const vehicleName = carDetails ? `${carDetails.make} ${carDetails.model}` : 'Unknown Vehicle';
    const customerName = customerDetails?.full_name ?? 'Customer';

    // Notify tenant admins about new reservation
    await this.notificationsService.notifyTenantAdmins(
      reservationTenantId,
      'New Reservation',
      `A new reservation has been created for ${vehicleName}. Please review and confirm.`,
      'reservation_created',
      {
        vehicleName,
        customerName,
        reservationId: data.id,
        startDate: dto.startDate,
        endDate: dto.endDate,
        totalPrice: totalPrice,
      },
    );

    return data;
  }

  async findAllByTenant(
    tenantId: string,
    filters?: {
      status?: string;
      customerId?: string;
      carId?: string;
      pickupLocationId?: string;
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    // Start building query
    // We use cars!inner if filtering by location to ensure we only get reservations
    // for cars that match the location filter.
    const selectFields = filters?.pickupLocationId 
      ? '*, cars!inner(id, make, model, year, primary_image_url, location_id), profiles:customer_id(id, full_name, phone_number)'
      : '*, cars(id, make, model, year, primary_image_url), profiles:customer_id(id, full_name, phone_number)';
    
    let query = this.supabaseClient
      .from('reservations')
      .select(selectFields)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.carId) query = query.eq('car_id', filters.carId);
    
    // Filter by car's location (only if specified)
    if (filters?.pickupLocationId) {
      query = query.eq('cars.location_id', filters.pickupLocationId);
    }
    // If pickupLocationId is undefined/null, show all locations

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch reservations: ${error.message}`);
    }

    return data ?? [];
  }

  async findByCustomer(customerId: string) {
    if (!customerId) {
      throw new BadRequestException('Customer ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        cars (id, make, model, year, primary_image_url)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch reservations: ${error.message}`);
    }

    return data ?? [];
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*, cars(make, model), profiles:customer_id(id, full_name)')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to update reservation: ${error.message}`);
    }

    // Send notification to customer based on status change
    if (data && data.profiles?.id) {
      const vehicleName = data.cars ? `${data.cars.make} ${data.cars.model}` : 'your vehicle';
      const customerName = data.profiles?.full_name ?? 'Customer';
      
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType: 'reservation_confirmed' | 'reservation_cancelled' | 'reservation_completed' | null = null;

      switch (status) {
        case 'confirmed':
          notificationTitle = 'Reservation Confirmed';
          notificationMessage = `Your reservation for ${vehicleName} has been confirmed.`;
          notificationType = 'reservation_confirmed';
          break;
        case 'cancelled':
          notificationTitle = 'Reservation Cancelled';
          notificationMessage = `Your reservation for ${vehicleName} has been cancelled.`;
          notificationType = 'reservation_cancelled';
          break;
        case 'completed':
          notificationTitle = 'Rental Completed';
          notificationMessage = `Your rental of ${vehicleName} has been completed. Thank you!`;
          notificationType = 'reservation_completed';
          break;
      }

      if (notificationTitle && notificationType) {
        await this.notificationsService.createNotification({
          userId: data.profiles.id,
          tenantId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
        });
      }
    }

    return data;
  }

  async findOne(id: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        cars (id, make, model, year, primary_image_url, price_per_day),
        profiles:customer_id (id, full_name, phone_number)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw new InternalServerErrorException(`Reservation not found: ${error.message}`);
    }

    return data;
  }

  async findOneByCustomer(id: string, customerId: string) {
    if (!customerId) {
      throw new BadRequestException('Customer ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        cars (id, make, model, year, primary_image_url, price_per_day),
        profiles:customer_id (id, full_name, phone_number)
      `)
      .eq('id', id)
      .eq('customer_id', customerId)
      .single();

    if (error || !data) {
      throw new InternalServerErrorException('Reservation not found');
    }

    return data;
  }

  async cancel(id: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to cancel reservation: ${error.message}`);
    }

    return { id: data?.id, message: 'Reservation cancelled successfully' };
  }

  /**
   * Get reservation statistics for dashboard (Admin only)
   */
  async getStatistics(tenantId: string, locationId?: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    // Get reservations for this tenant (optionally filtered by location)
    // If locationId is undefined, show all locations for the tenant
    let query = this.supabaseClient
      .from('reservations')
      .select(
        locationId 
          ? 'id, start_date, end_date, total_price, status, created_at, cars!inner(location_id)'
          : 'id, start_date, end_date, total_price, status, created_at'
      )
      .eq('tenant_id', tenantId);

    // Only filter by location if specified (undefined = all locations)
    if (locationId) {
      query = query.eq('cars.location_id', locationId);
    }
    
    const { data: reservations, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch statistics: ${error.message}`);
    }

    const allReservations = (reservations ?? []) as any[];

    // Calculate total reservations
    const total_reservations = allReservations.length;

    // Calculate revenue by month
    const revenueMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    allReservations.forEach((r) => {
      if (r.status === 'completed' || r.status === 'confirmed') {
        const date = new Date(r.created_at);
        const monthKey = months[date.getMonth()];
        revenueMap[monthKey] = (revenueMap[monthKey] || 0) + Number(r.total_price);
      }
    });

    const revenue_by_month = Object.entries(revenueMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // Calculate average duration
    let totalDays = 0;
    let validCount = 0;
    allReservations.forEach((r) => {
      const start = new Date(r.start_date);
      const end = new Date(r.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        totalDays += days;
        validCount++;
      }
    });
    const average_duration = validCount > 0 ? Math.round((totalDays / validCount) * 10) / 10 : 0;

    // Count by status
    const by_status: Record<string, number> = {};
    allReservations.forEach((r) => {
      by_status[r.status] = (by_status[r.status] || 0) + 1;
    });

    return {
      total_reservations,
      revenue_by_month,
      average_duration,
      by_status,
    };
  }

  /**
   * Get all reservations for a specific customer (Admin only)
   */
  async findByCustomerId(customerId: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    if (!customerId) {
      throw new BadRequestException('Customer ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        cars (id, make, model, year, primary_image_url, price_per_day)
      `)
      .eq('tenant_id', tenantId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch customer reservations: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Get all reservations for a specific car (Admin only)
   */
  async findByCarId(carId: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    if (!carId) {
      throw new BadRequestException('Car ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        profiles:customer_id (id, full_name, phone_number)
      `)
      .eq('tenant_id', tenantId)
      .eq('car_id', carId)
      .order('start_date', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch car reservations: ${error.message}`);
    }

    return data ?? [];
  }
}

