import { apiRequest } from '@/lib/api';

export interface Notification {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  message: string;
  type: 'system_alert' | 'reservation_created' | 'reservation_confirmed' | 'reservation_cancelled' | 
        'reservation_completed' | 'payment_received' | 'payment_failed' | 'payment_pending' | 
        'maintenance_scheduled' | 'car_available' | 'car_unavailable';
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  unread_count: number;
}

export const notificationsApi = {
  /**
   * Get all notifications for current user
   */
  async getAll(isRead?: boolean): Promise<NotificationsResponse> {
    try {
      let endpoint = '/notifications';
      if (isRead !== undefined) {
        endpoint += `?is_read=${isRead}`;
      }
      
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.status !== 200) {
        console.error('Failed to fetch notifications:', response.data);
        return { data: [], total: 0, unread_count: 0 };
      }
      
      return response.data || { data: [], total: 0, unread_count: 0 };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], total: 0, unread_count: 0 };
    }
  },

  /**
   * Get unread notifications only
   */
  async getUnread(): Promise<Notification[]> {
    const response = await this.getAll(false);
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.getAll();
    return response.unread_count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/notifications/${id}/read`, 'PATCH');
      
      if (response.status !== 200) {
        console.error('Failed to mark notification as read:', response.data);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await apiRequest('/notifications/read-all', 'PATCH');
      
      if (response.status !== 200) {
        console.error('Failed to mark all notifications as read:', response.data);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },
};
