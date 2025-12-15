import { Inject, Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async create(dto: CreateCarDto, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to create a car.');
    }

    const payload = {
      tenant_id: tenantId,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      license_plate: dto.licensePlate,
      color: dto.color ?? null,
      category: dto.category,
      price_per_day: dto.pricePerDay,
      deposit_amount: dto.depositAmount ?? 0,
      transmission: dto.transmission ?? null,
      fuel_type: dto.fuelType ?? null,
      seats: dto.seats ?? null,
      features: dto.features ?? [],
      location_id: dto.locationId ?? null,
      primary_image_url: dto.primaryImageUrl ?? null,
      gallery_urls: dto.galleryUrls ?? [],
    };

    const { data, error } = await this.supabaseClient
      .from('cars')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to create car: ${error.message}`);
    }

    return data;
  }

  async findAll(tenantId: string, filters?: { category?: string; status?: string; locationId?: string }) {
    if (!tenantId) {
      throw new BadRequestException('tenantId query parameter is required.');
    }

    let query = this.supabaseClient
      .from('cars')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.locationId) {
      query = query.eq('location_id', filters.locationId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch cars: ${error.message}`);
    }

    return data ?? [];
  }

  async findOne(id: string, tenantId?: string) {
    let query = this.supabaseClient
      .from('cars')
      .select('*')
      .eq('id', id);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new NotFoundException(`Car not found: ${error.message}`);
    }

    return data;
  }

  async update(id: string, dto: UpdateCarDto, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to update a car.');
    }

    const updatePayload: Record<string, any> = {};

    if (dto.make !== undefined) updatePayload.make = dto.make;
    if (dto.model !== undefined) updatePayload.model = dto.model;
    if (dto.year !== undefined) updatePayload.year = dto.year;
    if (dto.licensePlate !== undefined) updatePayload.license_plate = dto.licensePlate;
    if (dto.color !== undefined) updatePayload.color = dto.color;
    if (dto.category !== undefined) updatePayload.category = dto.category;
    if (dto.pricePerDay !== undefined) updatePayload.price_per_day = dto.pricePerDay;
    if (dto.depositAmount !== undefined) updatePayload.deposit_amount = dto.depositAmount;
    if (dto.transmission !== undefined) updatePayload.transmission = dto.transmission;
    if (dto.fuelType !== undefined) updatePayload.fuel_type = dto.fuelType;
    if (dto.seats !== undefined) updatePayload.seats = dto.seats;
    if (dto.features !== undefined) updatePayload.features = dto.features;
    if (dto.locationId !== undefined) updatePayload.location_id = dto.locationId;
    if (dto.primaryImageUrl !== undefined) updatePayload.primary_image_url = dto.primaryImageUrl;
    if (dto.galleryUrls !== undefined) updatePayload.gallery_urls = dto.galleryUrls;
    if (dto.status !== undefined) updatePayload.status = dto.status;

    const { data, error } = await this.supabaseClient
      .from('cars')
      .update(updatePayload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to update car: ${error.message}`);
    }

    return data;
  }

  async remove(id: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to delete a car.');
    }

    const { data, error } = await this.supabaseClient
      .from('cars')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to delete car: ${error.message}`);
    }

    return { id: data?.id };
  }

  async checkAvailability(carId: string, startDate: string, endDate: string) {
    // Check if there are any overlapping reservations
    const { data: overlapping, error } = await this.supabaseClient
      .from('reservations')
      .select('id, start_date, end_date, status')
      .eq('car_id', carId)
      .neq('status', 'cancelled')
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (error) {
      throw new InternalServerErrorException(`Failed to check availability: ${error.message}`);
    }

    const isAvailable = !overlapping || overlapping.length === 0;

    return {
      carId,
      startDate,
      endDate,
      isAvailable,
      conflictingReservations: overlapping ?? [],
    };
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    const validStatuses = ['available', 'rented', 'maintenance'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await this.supabaseClient
      .from('cars')
      .update({ status })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to update car status: ${error.message}`);
    }

    return data;
  }
}
