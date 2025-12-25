import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { EmailService } from '../email/email.service';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface CreateNotificationDto {
  userId: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  vehicleName?: string;
  customerName?: string;
  reservationId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Get all notifications for a user
   */
  async findAll(userId: string, tenantId: string, isRead?: boolean) {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    let query = this.supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by tenant if provided
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    // Filter by read status if provided
    if (isRead !== undefined) {
      query = query.eq('is_read', isRead);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch notifications: ${error.message}`);
    }

    // Calculate unread count
    const unreadCount = (data ?? []).filter((n) => !n.is_read).length;

    return {
      data: data ?? [],
      total: data?.length ?? 0,
      unread_count: unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Notification ID is required.');
    }

    const { data, error } = await this.supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, is_read')
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to mark notification as read: ${error.message}`);
    }

    return data;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, tenantId?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    let query = this.supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error, count } = await query.select('id');

    if (error) {
      throw new InternalServerErrorException(`Failed to mark all as read: ${error.message}`);
    }

    return {
      count: data?.length ?? 0,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Create a new notification (used by other services)
   */
  async createNotification(dto: CreateNotificationDto) {
    const payload = {
      user_id: dto.userId,
      tenant_id: dto.tenantId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      vehicle_name: dto.vehicleName ?? null,
      customer_name: dto.customerName ?? null,
      reservation_id: dto.reservationId ?? null,
      is_read: false,
    };

    const { data, error } = await this.supabaseClient
      .from('notifications')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      // Log but don't throw - notifications should not break main operations
      console.error(`Failed to create notification: ${error.message}`);
      return null;
    }

    return data;
  }

  /**
   * Helper: Notify admin users for a tenant (in-app + email)
   */
  async notifyTenantAdmins(
    tenantId: string,
    title: string,
    message: string,
    type: NotificationType,
    extras?: { 
      vehicleName?: string; 
      customerName?: string; 
      reservationId?: string;
      startDate?: string;
      endDate?: string;
      totalPrice?: number;
    },
  ) {
    // Get all admin users for this tenant (with email from auth.users)
    const { data: admins, error } = await this.supabaseClient
      .from('profiles')
      .select('id, full_name')
      .eq('tenant_id', tenantId)
      .eq('role', 'client_admin');

    if (error || !admins) {
      console.error(`Failed to find admins for tenant: ${error?.message}`);
      return;
    }

    // Create notification + send email for each admin
    for (const admin of admins) {
      // In-app notification
      await this.createNotification({
        userId: admin.id,
        tenantId,
        title,
        message,
        type,
        vehicleName: extras?.vehicleName,
        customerName: extras?.customerName,
        reservationId: extras?.reservationId,
      });

      // Get admin email from auth.users via Supabase admin API
      const { data: userData } = await this.supabaseClient.auth.admin.getUserById(admin.id);
      
      if (userData?.user?.email && extras?.vehicleName && extras?.reservationId) {
        // Send email notification
        await this.emailService.sendNewReservationEmail(userData.user.email, {
          vehicleName: extras.vehicleName,
          customerName: extras.customerName ?? 'Customer',
          startDate: extras.startDate ?? 'N/A',
          endDate: extras.endDate ?? 'N/A',
          totalPrice: extras.totalPrice ?? 0,
          reservationId: extras.reservationId,
        });
      }
    }
  }
}

