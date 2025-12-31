import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';

import { StorageService } from '../storage/storage.service';
import type { UploadedFile as R2UploadedFile } from '../storage/storage.service';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
    private readonly storageService: StorageService,
  ) {}

  async create(createTenantDto: CreateTenantDto, userId: string, file?: R2UploadedFile): Promise<TenantResponseDto> {
    // 1. Create the tenant
    const { data: tenant, error: createError } = await this.supabaseClient
      .from('tenants')
      .insert({
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        contact_email: createTenantDto.contactEmail,
        phone_number: createTenantDto.phoneNumber,
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique violation
        throw new InternalServerErrorException('Tenant with this slug already exists');
      }
      throw new InternalServerErrorException(`Failed to create tenant: ${createError.message}`);
    }

    // 2. Upload Logo if provided
    let logoUrl: string | null = null;
    if (file) {
      try {
        const folderPath = `tenants/${tenant.id}/branding`;
        logoUrl = await this.storageService.uploadFile(file, folderPath);
        
        // Update tenant with logo URL
        await this.supabaseClient
          .from('tenants')
          .update({ logo_url: logoUrl })
          .eq('id', tenant.id);
          
        tenant.logo_url = logoUrl; // Update local object for response
      } catch (uploadError) {
        console.error('Failed to upload logo during tenant creation:', uploadError);
        // We continue intentionally, as the tenant is created. 
        // User can retry uploading logo via update endpoint.
      }
    }

    // 3. Link the user to the new tenant
    const { error: linkError } = await this.supabaseClient
      .from('profiles')
      .update({ tenant_id: tenant.id })
      .eq('id', userId);

    if (linkError) {
      // Rollback: delete the created tenant (and potentially logo) if linking fails
      await this.supabaseClient.from('tenants').delete().eq('id', tenant.id);
       // Note: We leave the orphaned file in R2 for now as we don't have atomic delete for it, 
       // but strictly we should delete it too.
      throw new InternalServerErrorException(`Failed to link user to tenant: ${linkError.message}`);
    }

    return tenant as TenantResponseDto;
  }

  async findAll(): Promise<TenantResponseDto[]> {
    const { data, error } = await this.supabaseClient
      .from('tenants')
      .select('id, name, slug, logo_url, contact_email, phone_number, website_config');

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch tenants: ${error.message}`);
    }

    return data as TenantResponseDto[];
  }

  async findBySlug(slug: string): Promise<TenantResponseDto> {
    if (!slug) {
      throw new NotFoundException('Tenant slug is required');
    }

    // Public access: Only select public fields (exclude subscription_status)
    const { data, error } = await this.supabaseClient
      .from('tenants')
      .select('id, name, slug, logo_url, contact_email, phone_number, website_config')
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
    if (dto.slug !== undefined) {
      updatePayload.slug = dto.slug;
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
    if (dto.websiteConfig !== undefined) {
      updatePayload.website_config = dto.websiteConfig;
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
      if (error.code === '23505') { // Unique violation
        throw new InternalServerErrorException('Tenant with this slug already exists');
      }
      throw new InternalServerErrorException(`Failed to update tenant: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return data;
  }
  async getPlatformStats() {
    // Count stats
    const [
      { count: totalTenants },
      { count: totalCars },
      { count: totalReservations },
      { count: totalUsers }
    ] = await Promise.all([
      this.supabaseClient.from('tenants').select('*', { count: 'exact', head: true }),
      this.supabaseClient.from('cars').select('*', { count: 'exact', head: true }),
      this.supabaseClient.from('reservations').select('*', { count: 'exact', head: true }),
      this.supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    // Revenue stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // We only select necessary fields to minimize data transfer
    const { data: payments, error: paymentsError } = await this.supabaseClient
      .from('payments')
      .select('amount_paid, created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (paymentsError) {
      console.error('Error fetching payments for stats:', paymentsError);
    }

    // Process payments for chart data
    const monthlyRevenue = [];
    const monthMap = new Map();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`; // unique key
      const label = d.toLocaleString('default', { month: 'short' });
      monthMap.set(key, { name: label, total: 0 });
    }

    // Aggregate data
    if (payments) {
      payments.forEach(p => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthMap.has(key)) {
          const entry = monthMap.get(key);
          entry.total += Number(p.amount_paid);
        }
      });
    }

    // Convert to array
    const chartData = Array.from(monthMap.values());

    return {
      totalTenants: totalTenants || 0,
      totalCars: totalCars || 0,
      totalReservations: totalReservations || 0,
      totalUsers: totalUsers || 0,
      monthlyRevenue: chartData
    };
  }
}
