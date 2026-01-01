import { apiRequest, publicApiRequest } from '@/lib/api';

/**
 * Clean and validate image URLs
 * Removes malformed query parameters and metadata that might be appended incorrectly
 */
function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Remove any URL-encoded metadata that might be appended
  // Look for patterns like "r2_public_url=" or similar metadata
  try {
    // If the URL contains malformed query parameters, extract just the base URL
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
  } catch {
    // If URL parsing fails, try to extract a valid URL pattern
    // Look for https:// or http:// and extract up to the first space or invalid character
    const match = url.match(/^(https?:\/\/[^\s%]+)/);
    if (match) {
      return match[1];
    }
    return null;
  }
}

export interface EndUserCar {
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

export interface EndUserCarFilters {
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

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  contact_email?: string;
  phone_number?: string;
}

export const enduserCarsApi = {
  /**
   * Get all tenants (public endpoint for browsing)
   */
  async getAllTenants(): Promise<Tenant[]> {
    try {
      const response = await publicApiRequest('/tenants/public', 'GET');
      if (response.status !== 200) {
        console.error('Failed to fetch tenants:', response.data);
        return [];
      }
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  },

  /**
   * Get cars from a specific tenant
   */
  async getCarsFromTenant(tenantId: string, filters: EndUserCarFilters = {}): Promise<EndUserCar[]> {
    try {
      const params = new URLSearchParams();
      params.append('tenantId', tenantId);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('category', filters.type); // type maps to category in backend
      if (filters.locationId) params.append('locationId', filters.locationId);

      const response = await publicApiRequest(`/cars?${params.toString()}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch cars from tenant:', response.data);
        return [];
      }
      
      let cars: EndUserCar[] = response.data || [];
      

      cars = cars.map(car => ({
        ...car,
        primary_image_url: cleanImageUrl(car.primary_image_url),
        gallery_urls: car.gallery_urls?.map(url => cleanImageUrl(url)).filter((url): url is string => url !== null) || null,
      }));
      

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        cars = cars.filter(car => 
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.brand) {
        cars = cars.filter(car => car.make === filters.brand);
      }
      
      if (filters.type) {
        cars = cars.filter(car => car.category === filters.type);
      }
      
      if (filters.startingPrice !== undefined) {
        cars = cars.filter(car => car.price_per_day >= filters.startingPrice!);
      }
      
      if (filters.endingPrice !== undefined) {
        cars = cars.filter(car => car.price_per_day <= filters.endingPrice!);
      }
      
      if (filters.transmission) {
        cars = cars.filter(car => car.transmission === filters.transmission);
      }
      
      if (filters.fuelType) {
        cars = cars.filter(car => car.fuel_type === filters.fuelType);
      }
      
      return cars;
    } catch (error) {
      console.error('Error fetching cars from tenant:', error);
      return [];
    }
  },

  /**
   * Search cars across all tenants (for end users)
   * Fetches all tenants, then gets cars from each tenant and aggregates them
   */
  async searchCars(filters: EndUserCarFilters = {}): Promise<EndUserCar[]> {
    try {

      const tenants = await this.getAllTenants();
      
      if (tenants.length === 0) {
        console.warn('No tenants found');
        return [];
      }
      

      const carPromises = tenants.map(tenant => 
        this.getCarsFromTenant(tenant.id, filters).catch(err => {
          console.error(`Error fetching cars from tenant ${tenant.id}:`, err);
          return []; // Return empty array if one tenant fails
        })
      );
      
      const carsArrays = await Promise.all(carPromises);
      

      let allCars = carsArrays.flat();
      

      allCars.sort((a, b) => (b.rental_count || 0) - (a.rental_count || 0));
      
      return allCars;
    } catch (error: any) {
      console.error('Error searching cars:', error);
      return [];
    }
  },

  /**
   * Get all available cars from all tenants
   */
  async getAllCars(filters: EndUserCarFilters = {}): Promise<EndUserCar[]> {

    return this.searchCars({ ...filters, status: filters.status || 'available' });
  },

  /**
   * Get a single car by ID
   */
  async getCarById(id: string): Promise<EndUserCar | null> {
    try {
      const response = await publicApiRequest(`/cars/${id}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch car:', response.data);
        return null;
      }
      
      const car = response.data;
      if (car) {
        // Clean image URLs
        return {
          ...car,
          primary_image_url: cleanImageUrl(car.primary_image_url),
          gallery_urls: car.gallery_urls?.map((url: string) => cleanImageUrl(url)).filter((url: string | null): url is string => url !== null) || null,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  },

  /**
   * Check car availability for a date range
   */
  async checkAvailability(id: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiRequest(
        `/cars/${id}/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
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
   * Get unavailable dates for a car (for calendar display)
   */
  async getUnavailableDates(id: string): Promise<Array<{ start_date: string; end_date: string }>> {
    try {
      const response = await apiRequest(`/cars/${id}/unavailable-dates`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch unavailable dates:', response.data);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
      return [];
    }
  },

  /**
   * Get featured cars (most rented) across all tenants
   */
  async getFeaturedCars(limit: number = 4): Promise<EndUserCar[]> {
    try {
      const response = await apiRequest(`/cars/featured?limit=${limit}`, 'GET');
      
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
   * Get unique brands from all available cars
   */
  async getBrands(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const brands = [...new Set(cars.map(car => car.make))].filter(
        (brand): brand is string => typeof brand === 'string' && brand.length > 0
      );
      return brands.sort();
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  },

  /**
   * Get unique categories from all available cars
   */
  async getCategories(): Promise<string[]> {
    try {
      const cars = await this.getAllCars();
      const categories = [...new Set(cars.map(car => car.category))].filter(
        (category): category is string => typeof category === 'string' && category.length > 0
      );
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get location by ID (public endpoint)
   */
  async getLocationById(locationId: string, tenantId: string): Promise<any> {
    try {
      const response = await apiRequest(`/locations?tenantId=${tenantId}`, 'GET');
      if (response.status !== 200) {
        return null;
      }
      const locations = response.data || [];
      return locations.find((loc: any) => loc.id === locationId) || null;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  },

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const tenants = await this.getAllTenants();
      return tenants.find(t => t.id === tenantId) || null;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  },
};
