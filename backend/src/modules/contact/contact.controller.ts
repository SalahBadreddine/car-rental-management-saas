import { Controller, Post, Body, BadRequestException, Req, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import type { Request } from 'express';

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 1; // 1 request
const RATE_WINDOW = 10 * 60 * 60 * 1000; // per 10 hours

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

class SendContactDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsEmail()
  tenantEmail: string;

  @IsString()
  tenantName: string;

  @IsString()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Public endpoint to send contact form message to tenant
   * POST /contact/send
   * Rate limited: 5 requests per minute per IP
   */
  @Post('send')
  async sendContactMessage(@Body() dto: SendContactDto, @Req() req: Request) {
    // Rate limiting - 1 request per 10 hours per IP
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      throw new HttpException(
        'Too many requests. Please wait before sending another message.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (!dto.senderName || !dto.senderEmail || !dto.message) {
      throw new BadRequestException('Name, email, and message are required.');
    }

    if (!dto.tenantEmail) {
      throw new BadRequestException('Tenant contact email not configured.');
    }

    const subject = dto.subject || `Contact from ${dto.senderName}`;
    
    const result = await this.emailService.sendContactEmail(
      dto.tenantEmail,
      dto.tenantName,
      dto.senderName,
      dto.senderEmail,
      subject,
      dto.message,
    );

    if (!result) {
      throw new BadRequestException('Failed to send message. Please try again later.');
    }

    return {
      success: true,
      message: 'Your message has been sent successfully.',
    };
  }
}

