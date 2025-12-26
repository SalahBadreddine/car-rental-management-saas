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

    // 1. OCCUPANCY RATE (Rented / Total Cars * 100)
    const { count: rentedCars } = await this.supabaseClient
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'rented');

    const occupancyRate = totalCars && totalCars > 0 
      ? Math.round((rentedCars ?? 0) / totalCars * 100) 
      : 0;

    // 2. REVENUE PER MONTH (for chart)
    const { data: allCompletedReservations } = await this.supabaseClient
      .from('reservations')
      .select('total_price, created_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed');

    const monthlyRevenueMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    allCompletedReservations?.forEach((reservation) => {
      const date = new Date(reservation.created_at);
      const monthName = months[date.getMonth()];
      monthlyRevenueMap[monthName] = (monthlyRevenueMap[monthName] || 0) + (reservation.total_price || 0);
    });

    const revenueByMonth = months.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month] || 0,
    }));

    // 3. REVENUE PER BRAND (for chart)
    const { data: reservationsWithCars } = await this.supabaseClient
      .from('reservations')
      .select('total_price, cars(make)')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed');

    const brandRevenueMap: Record<string, number> = {};
    reservationsWithCars?.forEach((reservation: any) => {
      const brand = reservation.cars?.make || 'Unknown';
      brandRevenueMap[brand] = (brandRevenueMap[brand] || 0) + (reservation.total_price || 0);
    });

    const revenueByBrand = Object.entries(brandRevenueMap).map(([brand, revenue]) => ({
      brand,
      revenue,
    }));

    // 4. MOST RENTED CARS (for "Most Rented" section)
    const { data: mostRentedCars } = await this.supabaseClient
      .from('cars')
      .select('id, make, model, price_per_day, rental_count, primary_image_url')
      .eq('tenant_id', tenantId)
      .order('rental_count', { ascending: false })
      .limit(4);

    // 5. RENTALS PER COLOR (for pie chart)
    const { data: allCars } = await this.supabaseClient
      .from('cars')
      .select('color, rental_count')
      .eq('tenant_id', tenantId);

    const colorRentalsMap: Record<string, number> = {};
    allCars?.forEach((car) => {
      const color = car.color || 'Unknown';
      colorRentalsMap[color] = (colorRentalsMap[color] || 0) + (car.rental_count || 0);
    });

    const rentalsByColor = Object.entries(colorRentalsMap).map(([name, value]) => ({
      name,
      value,
      color: name.toLowerCase(), // For chart colors
    }));

    return {
      totalCars: totalCars ?? 0,
      availableCars: availableCars ?? 0,
      totalReservations: totalReservations ?? 0,
      pendingReservations: pendingReservations ?? 0,
      totalRevenue,
      recentReservations: recentReservations ?? [],
      occupancyRate,
      revenueByMonth,
      revenueByBrand,
      mostRentedCars: mostRentedCars ?? [],
      rentalsByColor,
    };
  }
}
