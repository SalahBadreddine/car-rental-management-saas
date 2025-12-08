import { Inject, Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../common/providers/supabase.provider';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async signup(dto: SignupDto) {
    const role = dto.role || 'customer';
    const shouldAutoConfirm = role === 'client_admin';

    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: shouldAutoConfirm,
    });

    if (authError) {
      throw new BadRequestException(authError.message);
    }

    const userId = authData.user.id;

    const { error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: dto.fullName,
        phone_number: dto.phoneNumber,
        role: role,
        tenant_id: dto.tenantId || null
      });

    if (profileError) {
      throw new InternalServerErrorException('Failed to create user profile');
    }

    if (!shouldAutoConfirm) {
      const redirectUrl = process.env.EMAIL_VERIFICATION_REDIRECT_URL || 'http://localhost:8000/verify-email';
      await this.supabase.auth.resend({
        type: 'signup',
        email: dto.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
    }

    return {
      message: shouldAutoConfirm
        ? 'User registered successfully'
        : 'User registered successfully. Please check your email to verify your account.',
      emailVerified: shouldAutoConfirm,
      userId: userId,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      // Check if error is due to unverified email
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        throw new UnauthorizedException('Please verify your email before logging in');
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new InternalServerErrorException('Profile not found for this user');
    }

    // Double check email verification (only for customers)
    if (profile.role === 'customer' && !data.user.email_confirmed_at) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role,
        tenant_id: profile.tenant_id
      }
    };
  }

  async getUser(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      ...profile
    };
  }

  async logout(token: string) {
    return { message: 'Logged out successfully' };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name,
        role: profile?.role,
        tenant_id: profile?.tenant_id,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const redirectUrl = process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:8000/reset-password';

    const { data, error } = await this.supabase.auth.resetPasswordForEmail(dto.email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Don't reveal if email exists (security best practice)
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Token comes from Supabase email link (access_token from URL hash)
    const { data: { user }, error: verifyError } = await this.supabase.auth.getUser(dto.token);

    if (verifyError || !user) {
      throw new UnauthorizedException('Invalid or expired reset token. Please request a new password reset link.');
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(user.id, {
      password: dto.newPassword,
    });

    if (error) {
      throw new BadRequestException(`Failed to reset password: ${error.message}`);
    }

    return {
      message: 'Password has been reset successfully. You can now login with your new password.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    // Token comes from Supabase email link (access_token from URL hash)
    const { data: { user }, error } = await this.supabase.auth.getUser(dto.token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (user.email_confirmed_at) {
      return { message: 'Email is already verified' };
    }

    // Use admin API to confirm email
    const { data, error: confirmError } = await this.supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (confirmError) {
      throw new BadRequestException(confirmError.message);
    }

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const redirectUrl = process.env.EMAIL_VERIFICATION_REDIRECT_URL || 'http://localhost:8000/verify-email';

    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'If an account with that email exists and is unverified, a verification email has been sent.',
    };
  }

  async changePassword(userId: string, userEmail: string, dto: ChangePasswordDto) {
    // Verify current password by attempting to sign in
    const { error: verifyError } = await this.supabase.auth.signInWithPassword({
      email: userEmail,
      password: dto.currentPassword,
    });

    if (verifyError) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password using admin API
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
      password: dto.newPassword,
    });

    if (error) {
      throw new BadRequestException(`Failed to change password: ${error.message}`);
    }

    return {
      message: 'Password changed successfully',
    };
  }
}