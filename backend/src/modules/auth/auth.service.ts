import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto'; // <--- Import LoginDto

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
    // ... existing signup code ...
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
      console.error('Profile creation error:', profileError); // <--- Added logging
      await this.supabase.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException('Failed to create user profile');
    }

    return { message: 'User registered successfully', userId: userId };
  }

  // --- NEW LOGIN METHOD ---
  async login(dto: LoginDto) {
    // 1. Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Fetch the User's Profile (Role & Tenant)
    // We need this so the frontend knows if they are an Admin or Customer
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new InternalServerErrorException('Profile not found for this user');
    }

    // 3. Return everything the frontend needs
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role,       // Crucial for routing (Admin vs Customer)
        tenant_id: profile.tenant_id // Crucial for identifying the Agency
      }
    };
  }

  async getUser(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Fetch profile to get role/tenant info
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      ...profile // Merge profile data (role, tenant_id, etc.)
    };
  }

  async logout(token: string) {
    // Supabase signOut only works client-side, but we can invalidate refresh tokens server-side
    // For API, we just instruct the frontend to delete the token
    // Optionally, you can revoke refresh tokens here if needed
    return { message: 'Logged out successfully' };
  }
}