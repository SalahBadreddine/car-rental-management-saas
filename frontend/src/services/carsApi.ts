const API_BASE_URL = 'http://localhost:3000';
// this should be changed later , it's just hardcoded for a fixed tenant id for now for testing purposes
const TENANT_ID = '11111111-1111-1111-1111-111111111111';
// const TENANT_ID = '22222222-2222-2222-2222-222222222222';
// const TENANT_ID = '33333333-3333-3333-3333-333333333333';


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
  gallery_urls: string | null;
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

export const carsApi = {
  // Get all cars for the tenant
  async getAllCars(): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars?tenantId=${TENANT_ID}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
  },

  // Search and filter cars
  async searchCars(filters: SearchFilters): Promise<Car[]> {
    try {
      const params = new URLSearchParams({ tenantId: TENANT_ID });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.type) params.append('type', filters.type);
      if (filters.startingPrice !== undefined) params.append('startingPrice', filters.startingPrice.toString());
      if (filters.endingPrice !== undefined) params.append('endingPrice', filters.endingPrice.toString());
      if (filters.transmission) params.append('transmission', filters.transmission);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`${API_BASE_URL}/cars/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to search cars');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  },

  // Get unique brands of cars
  async getBrands(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const brands = [...new Set(cars.map(car => car.make))].filter(
        (brand): brand is string => typeof brand === 'string'
      );
      return brands.sort();
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // Get unique categories of cars
  async getCategories(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const categories = [...new Set(cars.map(car => car.category))].filter(
        (category): category is string => typeof category === 'string'
      );
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};