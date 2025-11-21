import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async findBySlug(slug: string): Promise<TenantResponseDto> {
    if (!slug) {
      throw new NotFoundException('Tenant slug is required');
    }

    // Public access: Only select public fields (exclude subscription_status)
    const { data, error } = await this.supabaseClient
      .from('tenants')
      .select('id, name, slug, logo_url, contact_email, phone_number')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        throw new NotFoundException(`Tenant with slug "${slug}" not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch tenant: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    }

    return data as TenantResponseDto;
  }

  async findOne(id: string): Promise<any> {
    if (!id) {
      throw new NotFoundException('Tenant ID is required');
    }

    // Admin access: Select all fields including subscription_status
    const { data, error } = await this.supabaseClient
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Tenant with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch tenant: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return data;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<any> {
    if (!id) {
      throw new NotFoundException('Tenant ID is required');
    }

    // Build update payload, mapping DTO fields to database columns
    const updatePayload: any = {};
    
    if (dto.name !== undefined) {
      updatePayload.name = dto.name;
    }
    if (dto.contactEmail !== undefined) {
      updatePayload.contact_email = dto.contactEmail;
    }
    if (dto.phoneNumber !== undefined) {
      updatePayload.phone_number = dto.phoneNumber;
    }
    if (dto.logoUrl !== undefined) {
      updatePayload.logo_url = dto.logoUrl;
    }

    // If no fields to update, return current record
    if (Object.keys(updatePayload).length === 0) {
      return this.findOne(id);
    }

    const { data, error } = await this.supabaseClient
      .from('tenants')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Tenant with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(`Failed to update tenant: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return data;
  }
}

