import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Test endpoint to verify email configuration
   * Only accessible by authenticated users
   */
  @Post('test')
  async sendTestEmail(@Body() body: { to: string }) {
    const result = await this.emailService.sendEmail({
      to: body.to,
      subject: '🧪 Test Email - Car Rental System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">✅ Email Configuration Working!</h2>
          <p>This is a test email from your Car Rental Management System.</p>
          <p>If you're receiving this, your Outlook SMTP configuration is correct.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return {
      success: result,
      message: result ? 'Test email sent successfully!' : 'Failed to send email. Check server logs.',
    };
  }
}
