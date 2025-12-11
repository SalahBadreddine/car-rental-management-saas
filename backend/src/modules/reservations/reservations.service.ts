import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async create(dto: CreateReservationDto, tenantId: string, customerId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to create a reservation.');
    }

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

    if (car.tenant_id !== tenantId) {
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

    const payload = {
      tenant_id: tenantId,
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

    return data;
  }

  async findAllByTenant(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('reservations')
      .select(`
        *,
        cars (id, make, model, year, primary_image_url),
        profiles:customer_id (id, full_name, phone_number)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

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
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to update reservation: ${error.message}`);
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
}
