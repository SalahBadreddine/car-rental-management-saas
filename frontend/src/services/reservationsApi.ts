import { apiRequest } from '@/lib/api';

export interface Reservation {
  id: string;
  tenant_id: string;
  car_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickup_location_id: string;
  return_location_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  car?: {
    id: string;
    make: string;
    model: string;
    primary_image_url?: string;
  };
  customer?: {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
  };
  // Backend returns 'profiles' field
  profiles?: {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
  };
}

export interface ReservationFilters {
  status?: string;
  customerId?: string;
  carId?: string;
  locationId?: string;
}

export const reservationsApi = {
  /**
   * Get all reservations for admin
   */
  async getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    try {
      let endpoint = '/reservations';
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customer_id', filters.customerId);
      if (filters?.carId) params.append('car_id', filters.carId);
      if (filters?.locationId) params.append('pickup_location_id', filters.locationId);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch reservations:', response.data);
        return [];
      }
      
      const reservations = response.data?.data || response.data || [];
      // Transform profiles to customer for consistency
      return reservations.map((r: any) => {
        if (r.profiles) {
          r.customer = r.profiles;
        }
        return r;
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  },

  /**
   * Get single reservation by ID
   */
  async getById(id: string): Promise<Reservation | null> {
    try {
      const response = await apiRequest(`/reservations/${id}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch reservation:', response.data);
        return null;
      }
      
      const reservation = response.data?.data || response.data;
      // Transform profiles to customer for consistency
      if (reservation && reservation.profiles) {
        reservation.customer = reservation.profiles;
      }
      return reservation;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      return null;
    }
  },

  /**
   * Get reservations for a specific customer
   */
  async getByCustomerId(customerId: string): Promise<Reservation[]> {
    try {
      const response = await apiRequest(`/reservations/customer/${customerId}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch customer reservations:', response.data);
        return [];
      }
      
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching customer reservations:', error);
      return [];
    }
  },

  /**
   * Get reservations for a specific car
   */
  async getByCarId(carId: string): Promise<Reservation[]> {
    try {
      const response = await apiRequest(`/reservations/car/${carId}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch car reservations:', response.data);
        return [];
      }
      
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching car reservations:', error);
      return [];
    }
  },

  /**
   * Update reservation status
   */
  async updateStatus(id: string, status: string): Promise<Reservation | null> {
    try {
      const response = await apiRequest(`/reservations/${id}/status`, 'PATCH', { status });
      
      if (response.status !== 200) {
        console.error('Failed to update reservation status:', response.data);
        return null;
      }
      
      const reservation = response.data?.data || response.data;
      // Transform profiles to customer for consistency
      if (reservation && reservation.profiles) {
        reservation.customer = reservation.profiles;
      }
      return reservation;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      return null;
    }
  },

  /**
   * Cancel a reservation
   */
  async cancel(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/reservations/${id}`, 'DELETE');
      
      if (response.status !== 200) {
        console.error('Failed to cancel reservation:', response.data);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return false;
    }
  },

  /**
   * Get reservation statistics
   */
  async getStatistics(locationId?: string): Promise<any> {
    try {
      const endpoint = locationId ? `/reservations/statistics?locationId=${locationId}` : '/reservations/statistics';
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch reservation statistics:', response.data);
        return null;
      }
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching reservation statistics:', error);
      return null;
    }
  },
};
