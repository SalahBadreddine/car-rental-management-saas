import { apiRequest } from '@/lib/api';
import { getUser } from '@/lib/auth';

const API_BASE_URL = 'http://localhost:3000';

export interface Car {
  id: string;
  tenant_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  category: string;
  price_per_day: number;
  deposit_amount: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  features: string[];
  location_id: string;
  status: string;
  primary_image_url: string;
  rental_count: number;
  gallery_urls: string[] | null;
  created_at: string;
}

export interface SearchFilters {
  search?: string;
  brand?: string;
  type?: string;
  startingPrice?: number;
  endingPrice?: number;
  transmission?: string;
  fuelType?: string;
  locationId?: string;
  status?: string;
}

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  category: string;
  pricePerDay: number;
  depositAmount?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  features?: string[];
  locationId?: string;
}

const getTenantId = (): string => {
  const user = getUser();
  return user?.tenant_id || '';
};

export const carsApi = {
  /**
   * Get all cars for the tenant (optionally filtered by location)
   */
  async getAllCars(locationId?: string): Promise<Car[]> {
    try {
      const tenantId = getTenantId();
      if (!tenantId) {
        console.error('No tenant ID found');
        return [];
      }
      
      let url = `/cars?tenantId=${tenantId}`;
      if (locationId) {
        url += `&locationId=${locationId}`;
      }
      
      const response = await apiRequest(url, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch cars:', response.data);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
  },

  /**
   * Search and filter cars
   */
  async searchCars(filters: SearchFilters): Promise<Car[]> {
    try {
      const tenantId = getTenantId();
      const params = new URLSearchParams({ tenantId });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.type) params.append('type', filters.type);
      if (filters.startingPrice !== undefined) params.append('startingPrice', filters.startingPrice.toString());
      if (filters.endingPrice !== undefined) params.append('endingPrice', filters.endingPrice.toString());
      if (filters.transmission) params.append('transmission', filters.transmission);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.status) params.append('status', filters.status);
      
      const response = await apiRequest(`/cars/search?${params.toString()}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to search cars:', response.data);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error searching cars:', error);
      return [];
    }
  },

  /**
   * Get a single car by ID
   */
  async getCarById(id: string): Promise<Car | null> {
    try {
      const response = await apiRequest(`/cars/${id}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch car:', response.data);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  },

  /**
   * Create a new car (admin only)
   */
  async createCar(data: CreateCarDto, primaryImage?: File, galleryImages?: File[]): Promise<Car | null> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'features' && Array.isArray(value)) {
            // Send each feature as separate form field for proper array parsing
            value.forEach((item) => {
              formData.append('features', item);
            });
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add files
      if (primaryImage) {
        formData.append('primaryImage', primaryImage);
      }
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((file) => {
          formData.append('galleryImages', file);
        });
      }
      
      // Use fetch directly for FormData (apiRequest sends JSON)
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/cars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create car:', errorData);
        // Log validation errors clearly
        if (Array.isArray(errorData.message)) {
          console.error('Validation errors:', errorData.message.join(', '));
        }
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Failed to create car');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating car:', error);
      return null;
    }
  },

  /**
   * Update a car (admin only)
   */
  async updateCar(id: string, data: Partial<CreateCarDto>, primaryImage?: File, galleryImages?: File[]): Promise<Car | null> {
    try {
      const formData = new FormData();
      
      // Add text fields (excluding arrays)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !Array.isArray(value)) {
          formData.append(key, String(value));
        }
      });
      
      // Add arrays as separate entries with same key
      if (data.features && Array.isArray(data.features)) {
        data.features.forEach(feature => {
          formData.append('features', feature);
        });
      }
      
      // Add files
      if (primaryImage) {
        formData.append('primaryImage', primaryImage);
      }
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((file) => {
          formData.append('galleryImages', file);
        });
      }
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update car:', errorData);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating car:', error);
      return null;
    }
  },

  /**
   * Delete a car (admin only)
   */
  async deleteCar(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/cars/${id}`, 'DELETE');
      
      if (response.status !== 200) {
        console.error('Failed to delete car:', response.data);
        // Throw error with message so frontend can handle specific cases
        throw new Error(response.data?.message || 'Failed to delete car');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting car:', error);
      throw error;
    }
  },

  /**
   * Update car status (admin only)
   */
  async updateCarStatus(id: string, status: string): Promise<Car | null> {
    try {
      const response = await apiRequest(`/cars/${id}/status`, 'PATCH', { status });
      
      if (response.status !== 200) {
        console.error('Failed to update car status:', response.data);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating car status:', error);
      return null;
    }
  },

  /**
   * Check car availability
   */
  async checkAvailability(id: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiRequest(
        `/cars/${id}/availability?startDate=${startDate}&endDate=${endDate}`,
        'GET'
      );
      
      if (response.status !== 200) {
        console.error('Failed to check availability:', response.data);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      return null;
    }
  },

  /**
   * Get car statistics (admin only)
   */
  async getStatistics(locationId?: string): Promise<any> {
    try {
      const endpoint = locationId ? `/cars/statistics?locationId=${locationId}` : '/cars/statistics';
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch car statistics:', response.data);
        return null;
      }
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching car statistics:', error);
      return null;
    }
  },

  /**
   * Get featured cars
   */
  async getFeaturedCars(limit: number = 4): Promise<Car[]> {
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
   * Get unique brands of cars
   */
  async getBrands(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const brands = [...new Set(cars.map(car => car.make))].filter(
        (brand): brand is string => typeof brand === 'string'
      );
      return brands.sort();
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  },

  /**
   * Get unique categories of cars
   */
  async getCategories(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const categories = [...new Set(cars.map(car => car.category))].filter(
        (category): category is string => typeof category === 'string'
      );
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};