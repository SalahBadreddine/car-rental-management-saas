import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { SearchCarsDto } from './dto/search-cars.dto';

@Injectable()
export class CarsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async search(dto: SearchCarsDto) {
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId query parameter is required.');
    }

    let query = this.supabaseClient
      .from('cars')
      .select('*')
      .eq('tenant_id', dto.tenantId);

    // Search filter - search in make, model, and category
    if (dto.search) {
      const searchTerm = dto.search.toLowerCase();
      query = query.or(
        `make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
      );
    }

    // Brand (make) filter
    if (dto.brand) {
      query = query.eq('make', dto.brand);
    }

    // Type (category) filter
    if (dto.type) {
      query = query.eq('category', dto.type);
    }

    // Price range filters
    if (dto.startingPrice !== null && dto.startingPrice !== undefined) {
      query = query.gte('price_per_day', dto.startingPrice);
    }
    if (dto.endingPrice !== null && dto.endingPrice !== undefined) {
      query = query.lte('price_per_day', dto.endingPrice);
    }

    // Transmission filter
    if (dto.transmission) {
      query = query.eq('transmission', dto.transmission);
    }

    // Fuel type filter
    if (dto.fuelType) {
      query = query.eq('fuel_type', dto.fuelType);
    }

    // Location filter
    if (dto.locationId) {
      query = query.eq('location_id', dto.locationId);
    }

    // Status filter (default to 'available' if not specified)
    if (dto.status) {
      query = query.eq('status', dto.status);
    } else {
      query = query.eq('status', 'available');
    }

    // Order by rental_count (most popular first) by default
    query = query.order('rental_count', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Failed to search cars: ${error.message}`);
    }

    return data ?? [];
  }

  async findAll(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId query parameter is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('cars')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('rental_count', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch cars: ${error.message}`);
    }

    return data ?? [];
  }
}