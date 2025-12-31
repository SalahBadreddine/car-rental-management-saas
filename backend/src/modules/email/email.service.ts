import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ReservationEmailData {
  vehicleName: string;
  customerName: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  reservationId: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Gmail SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('Email not configured - skipping send');
        return false;
      }

      await this.transporter.sendMail({
        from: `"Car Rental System" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send new reservation notification to admin
   */
  async sendNewReservationEmail(adminEmail: string, data: ReservationEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚗 New Reservation</h2>
        <p>A new reservation has been created and requires your attention.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Reservation Details</h3>
          <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
          <p><strong>Dates:</strong> ${data.startDate} - ${data.endDate}</p>
          <p><strong>Total Price:</strong> $${data.totalPrice}</p>
          <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        </div>
        
        <p>Please review and confirm this reservation in your dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from your Car Rental Management System.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `🚗 New Reservation - ${data.vehicleName}`,
      html,
    });
  }

  /**
   * Send reservation status update to customer
   */
  async sendReservationStatusEmail(
    customerEmail: string,
    status: 'confirmed' | 'cancelled' | 'completed',
    data: ReservationEmailData,
  ): Promise<boolean> {
    const statusConfig = {
      confirmed: {
        emoji: '✅',
        title: 'Reservation Confirmed',
        message: 'Great news! Your reservation has been confirmed.',
        color: '#16a34a',
      },
      cancelled: {
        emoji: '❌',
        title: 'Reservation Cancelled',
        message: 'Your reservation has been cancelled.',
        color: '#dc2626',
      },
      completed: {
        emoji: '🎉',
        title: 'Rental Completed',
        message: 'Thank you for renting with us! We hope you had a great experience.',
        color: '#2563eb',
      },
    };

    const config = statusConfig[status];

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${config.color};">${config.emoji} ${config.title}</h2>
        <p>${config.message}</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Reservation Details</h3>
          <p><strong>Vehicle:</strong> ${data.vehicleName}</p>
          <p><strong>Dates:</strong> ${data.startDate} - ${data.endDate}</p>
          <p><strong>Total Price:</strong> $${data.totalPrice}</p>
          <p><strong>Reservation ID:</strong> ${data.reservationId}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from Car Rental Management System.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `${config.emoji} ${config.title} - ${data.vehicleName}`,
      html,
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(
    email: string,
    amount: number,
    reservationId: string,
    vehicleName: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">💳 Payment Received</h2>
        <p>We have successfully received your payment.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Reservation ID:</strong> ${reservationId}</p>
        </div>
        
        <p>Thank you for your payment!</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `💳 Payment Received - $${amount}`,
      html,
    });
  }

  /**
   * Send contact form message to tenant
   */
  async sendContactEmail(
    tenantEmail: string,
    tenantName: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">📬 New Contact Message</h2>
        <p>You have received a new message from your website contact form.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contact Details</h3>
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Reply to this inquiry:</strong> Simply reply to this email or click 
          <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}">here</a>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This message was sent via the contact form on ${tenantName}'s website.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: tenantEmail,
      subject: `📬 Contact Form: ${subject}`,
      html,
    });
  }
}
