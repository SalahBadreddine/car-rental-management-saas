import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async getStats(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }

    // Get total cars count
    const { count: totalCars } = await this.supabaseClient
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get available cars count
    const { count: availableCars } = await this.supabaseClient
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'available');

    // Get total reservations count
    const { count: totalReservations } = await this.supabaseClient
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get pending reservations count
    const { count: pendingReservations } = await this.supabaseClient
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending');

    // Get total revenue (sum of completed reservations)
    const { data: revenueData } = await this.supabaseClient
      .from('reservations')
      .select('total_price')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.total_price || 0), 0) ?? 0;

    // Get recent reservations
    const { data: recentReservations } = await this.supabaseClient
      .from('reservations')
      .select(`
        id, status, total_price, created_at,
        cars (make, model),
        profiles:customer_id (full_name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalCars: totalCars ?? 0,
      availableCars: availableCars ?? 0,
      totalReservations: totalReservations ?? 0,
      pendingReservations: pendingReservations ?? 0,
      totalRevenue,
      recentReservations: recentReservations ?? [],
    };
  }
}
