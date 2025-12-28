import { apiRequest } from '@/lib/api';
import { getUser } from '@/lib/auth';

const API_BASE_URL = 'http://localhost:3000';

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  phone: string;
  email: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const getTenantId = (): string => {
  const user = getUser();
  return user?.tenant_id || '';
};

export const locationsApi = {
  /**
   * Get all locations for the tenant
   */
  async getAll(): Promise<Location[]> {
    try {
      const tenantId = getTenantId();
      if (!tenantId) {
        console.error('No tenant ID found');
        return [];
      }
      
      const response = await apiRequest(`/locations?tenantId=${tenantId}`, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch locations:', response.data);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },

  /**
   * Create a new location (admin only)
   */
  async create(data: Partial<Location>, imageFile?: File): Promise<Location | null> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Add image file
      if (imageFile) {
        formData.append('file', imageFile);
      }
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create location:', errorData);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  },

  /**
   * Delete a location (admin only)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/locations/${id}`, 'DELETE');
      
      if (response.status !== 200) {
        console.error('Failed to delete location:', response.data);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  },
};
