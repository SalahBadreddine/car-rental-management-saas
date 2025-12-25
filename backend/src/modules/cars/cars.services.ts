import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { SearchCarsDto } from './dto/search-cars.dto';
import { FeaturedCarsDto } from './dto/featured-cars.dto';


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

  async getFeatured(query: FeaturedCarsDto) {
    const limit = query.limit || 4;

    let supabaseQuery = this.supabaseClient
      .from('cars')
      .select('*')
      .eq('is_featured', true)
      .order('rental_count', { ascending: false })
      .limit(limit);

    if (query.tenantId) supabaseQuery = supabaseQuery.eq('tenant_id', query.tenantId);

    const { data, error } = await supabaseQuery;

    if (error) throw new BadRequestException(error.message);

    return (data as Array<{
      id: string;
      make: string;
      category: string;
      price_per_day: number;
      rental_count: number;
      primary_image_url?: string;
      is_featured?: boolean;
      [key: string]: any;
    }>) ?? [];
  }

  // Get car statistics (admin only)
  async getStatistics(tenantId?: string) {
    const { data, error } = await this.supabaseClient
      .from('cars')
      .select('tenant_id, id, make, category, location_id, rental_count, status');

    if (error || !data) throw new BadRequestException(error?.message || 'Failed to fetch cars');

    const cars = data as Array<{
      id: string;
      tenant_id: string | null;
      make: string;
      category: string;
      location_id: string;
      rental_count: number;
      status: string;
      [key: string]: any;
    }>;

    const filteredCars = tenantId ? cars.filter(c => c.tenant_id === tenantId) : cars;

    const stats: {
      total_cars: number;
      by_status: Record<string, number>;
      by_category: Record<string, number>;
      by_location_id: Record<string, number>;
      average_rental_count: number;
      most_rented: { id: string; make: string; rental_count: number } | null;
      least_rented: { id: string; make: string; rental_count: number } | null;
    } = {
      total_cars: filteredCars.length,
      by_status: {},
      by_category: {},
      by_location_id: {},
      average_rental_count: 0,
      most_rented: null,
      least_rented: null,
    };

    if (filteredCars.length > 0) {
      let totalRental = 0;

      filteredCars.forEach(car => {
        totalRental += car.rental_count;
        stats.by_status[car.status] = (stats.by_status[car.status] || 0) + 1;
        stats.by_category[car.category] = (stats.by_category[car.category] || 0) + 1;
        if (car.location_id) {
          stats.by_location_id[car.location_id] = (stats.by_location_id[car.location_id] || 0) + 1;
        }
      });

      stats.average_rental_count = totalRental / filteredCars.length;

      const sortedByRental = [...filteredCars].sort((a, b) => b.rental_count - a.rental_count);

      stats.most_rented = {
        id: sortedByRental[0].id,
        make: sortedByRental[0].make,
        rental_count: sortedByRental[0].rental_count,
      };

      stats.least_rented = {
        id: sortedByRental[sortedByRental.length - 1].id,
        make: sortedByRental[sortedByRental.length - 1].make,
        rental_count: sortedByRental[sortedByRental.length - 1].rental_count,
      };
    }

    return { data: stats };
  }
}