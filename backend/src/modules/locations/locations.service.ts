import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async create(dto: CreateLocationDto, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to create a location.');
    }

    const payload = {
      tenant_id: tenantId,
      name: dto.name,
      city: dto.city,
      address: dto.address ?? null,
      image_url: dto.imageUrl ?? null,
    };

    const { data, error } = await this.supabaseClient
      .from('locations')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to create location: ${error.message}`);
    }

    return data;
  }

  async findAll(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId query parameter is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('locations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch locations: ${error.message}`);
    }

    return data ?? [];
  }

  async remove(id: string, tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to delete a location.');
    }

    const { data, error } = await this.supabaseClient
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to delete location: ${error.message}`);
    }

    return { id: data?.id };
  }
}

