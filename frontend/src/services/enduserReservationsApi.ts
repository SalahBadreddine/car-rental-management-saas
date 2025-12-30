import { apiRequest } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export interface CreateReservationDto {
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
}

export const enduserReservationsApi = {
  /**
   * Create a new reservation (customer)
   */
  async create(dto: CreateReservationDto) {
    try {
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      console.log('Creating reservation with DTO:', dto);

      const response = await apiRequest('/reservations', 'POST', dto, {
        'Authorization': `Bearer ${token}`,
      });

      console.log('Reservation API response:', response);

      if (response.status !== 201) {
        console.error('Reservation creation failed:', response.data);
        throw new Error(response.data?.message || `Failed to create reservation. Status: ${response.status}`);
      }

      console.log('Reservation created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  /**
   * Get customer's own reservations
   */
  async getMyReservations() {
    try {
      const token = getAccessToken();
      if (!token) {
        console.error('No access token found');
        throw new Error('Not authenticated');
      }

      console.log('Fetching user reservations...');
      const response = await apiRequest('/reservations', 'GET', undefined, {
        'Authorization': `Bearer ${token}`,
      });

      console.log('Reservations API response:', response);

      if (response.status !== 200) {
        console.error('Failed to fetch reservations. Status:', response.status, 'Data:', response.data);
        const errorMessage = response.data?.message || `Failed to fetch reservations (Status: ${response.status})`;
        
        // If it's a tenant_id error, provide helpful message
        if (response.data?.message?.includes('Tenant') || response.status === 400) {
          console.warn('Backend may require tenant_id. This might be a backend configuration issue.');
        }
        
        throw new Error(errorMessage);
      }

      // Handle both array and object responses
      let reservations = response.data;
      if (Array.isArray(reservations)) {
        // Good, it's already an array
      } else if (reservations && typeof reservations === 'object' && reservations.data) {
        // Response wrapped in data object
        reservations = reservations.data;
      } else if (reservations && typeof reservations === 'object') {
        // Single reservation object, wrap in array
        reservations = [reservations];
      } else {
        reservations = [];
      }

      console.log(`Found ${reservations.length} reservations:`, reservations);
      return reservations;
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      // Don't return empty array on auth errors - let the caller handle it
      if (error?.message?.includes('Not authenticated') || error?.message?.includes('401')) {
        throw error;
      }
      return [];
    }
  },

  /**
   * Get single reservation details
   */
  async getById(id: string) {
    try {
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const response = await apiRequest(`/reservations/${id}`, 'GET', undefined, {
        'Authorization': `Bearer ${token}`,
      });

      if (response.status !== 200) {
        throw new Error('Reservation not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  },
};