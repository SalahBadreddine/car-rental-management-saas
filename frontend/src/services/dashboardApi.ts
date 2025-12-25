import { apiRequest } from '@/lib/api';
import { getUser } from '@/lib/auth';

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  totalRevenue: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface CarStats {
  total_cars: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_location_id: Record<string, number>;
  average_rental_count: number;
  most_rented: { id: string; make: string; rental_count: number } | null;
  least_rented: { id: string; make: string; rental_count: number } | null;
}

export interface ReservationStats {
  total: number;
  by_status: Record<string, number>;
  revenue: {
    total: number;
    by_month: Record<string, number>;
  };
}

const getTenantId = (): string => {
  const user = getUser();
  return user?.tenant_id || '';
};

export const dashboardApi = {
  /**
   * Get car statistics for dashboard
   */
  async getCarStats(): Promise<CarStats | null> {
    try {
      const response = await apiRequest('/cars/statistics', 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch car stats:', response.data);
        return null;
      }
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching car stats:', error);
      return null;
    }
  },

  /**
   * Get reservation statistics for dashboard
   */
  async getReservationStats(): Promise<ReservationStats | null> {
    try {
      const response = await apiRequest('/reservations/statistics', 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch reservation stats:', response.data);
        return null;
      }
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      return null;
    }
  },

  /**
   * Get recent reservations for dashboard
   */
  async getRecentReservations(limit: number = 5): Promise<any[]> {
    try {
      const response = await apiRequest('/reservations', 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch reservations:', response.data);
        return [];
      }
      
      const reservations = response.data?.data || response.data || [];
      return reservations.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent reservations:', error);
      return [];
    }
  },

  /**
   * Get featured/most rented cars
   */
  async getFeaturedCars(limit: number = 4): Promise<any[]> {
    try {
      const tenantId = getTenantId();
      const response = await apiRequest(`/cars/featured?limit=${limit}&tenantId=${tenantId}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch featured cars:', response.data);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      return [];
    }
  },

  /**
   * Get combined dashboard data
   */
  async getDashboardData() {
    const [carStats, reservationStats, recentReservations, featuredCars] = await Promise.all([
      this.getCarStats(),
      this.getReservationStats(),
      this.getRecentReservations(),
      this.getFeaturedCars(),
    ]);

    return {
      carStats,
      reservationStats,
      recentReservations,
      featuredCars,
    };
  },
};
