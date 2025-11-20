import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async signup(dto: SignupDto) {
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
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
        role: dto.role || 'customer',
        tenant_id: dto.tenantId || null
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Rollback: delete auth user if profile creation fails
      await this.supabase.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException('Failed to create user profile');
    }

    return { message: 'User registered successfully', userId: userId };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
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
    const redirectUrl = process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:3000/reset-password';

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
}