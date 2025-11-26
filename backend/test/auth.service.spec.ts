import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { SUPABASE_CLIENT } from '../src/common/providers/supabase.provider';
import { SignupDto } from '../src/modules/auth/dto/signup.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabaseClient: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Create a reusable query builder mock
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabaseClient = {
      auth: {
        admin: {
          createUser: jest.fn(),
          deleteUser: jest.fn(),
          updateUserById: jest.fn(),
        },
        signInWithPassword: jest.fn(),
        getUser: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        refreshSession: jest.fn(),
        resend: jest.fn(),
      },
      from: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      role: 'customer',
    };

    it('should successfully signup a customer', async () => {
      const mockUser = { id: 'user-123', email: signupDto.email };
      const mockAuthData = { user: mockUser };

      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockQueryBuilder.insert.mockResolvedValue({
        error: null,
      });

      mockSupabaseClient.auth.resend.mockResolvedValue({
        error: null,
      });

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('message');
      expect(result.emailVerified).toBe(false);
      expect(result.userId).toBe('user-123');
      expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: signupDto.email,
        password: signupDto.password,
        email_confirm: false,
      });
    });

    it('should auto-confirm email for client_admin', async () => {
      const adminDto = { ...signupDto, role: 'client_admin' };
      const mockUser = { id: 'admin-123' };
      const mockAuthData = { user: mockUser };

      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockQueryBuilder.insert.mockResolvedValue({
        error: null,
      });

      const result = await service.signup(adminDto);

      expect(result.emailVerified).toBe(true);
      expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: adminDto.email,
        password: adminDto.password,
        email_confirm: true,
      });
      expect(mockSupabaseClient.auth.resend).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on auth error', async () => {
      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
    });

    it('should delete user and throw error on profile creation failure', async () => {
      const mockUser = { id: 'user-123' };
      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockQueryBuilder.insert.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(service.signup(signupDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };
      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        email_confirmed_at: '2024-01-01T00:00:00Z',
      };
      const mockProfile = {
        full_name: 'Test User',
        role: 'customer',
        tenant_id: null,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'access-token');
      expect(result).toHaveProperty('refresh_token', 'refresh-token');
      expect(result.user).toEqual({
        id: 'user-123',
        email: loginDto.email,
        full_name: 'Test User',
        role: 'customer',
        tenant_id: null,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      await expect(service.login(loginDto)).rejects.toThrow('Please verify your email before logging in');
    });

    it('should throw UnauthorizedException if customer email not confirmed', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        email_confirmed_at: null,
      };
      const mockProfile = {
        role: 'customer',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow('Please verify your email before logging in');
    });

    it('should throw InternalServerErrorException if profile not found', async () => {
      const mockUser = { id: 'user-123' };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      });

      await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUser', () => {
    it('should return user with profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        full_name: 'Test User',
        role: 'customer',
        tenant_id: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.getUser('valid-token');

      expect(result).toEqual({
        ...mockUser,
        ...mockProfile,
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(service.getUser('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout('token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        full_name: 'Test User',
        role: 'customer',
        tenant_id: null,
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: mockSession,
          user: mockUser,
        },
        error: null,
      });

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.refreshToken({ refresh_token: 'refresh-token' });

      expect(result).toHaveProperty('access_token', 'new-access-token');
      expect(result).toHaveProperty('refresh_token', 'new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });

      await expect(service.refreshToken({ refresh_token: 'invalid' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.forgotPassword({ email: 'test@example.com' });

      expect(result.message).toContain('password reset link has been sent');
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException on error', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      });

      await expect(service.forgotPassword({ email: 'test@example.com' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const mockUser = { id: 'user-123' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.resetPassword({
        token: 'reset-token',
        newPassword: 'newpassword123',
      });

      expect(result.message).toContain('Password has been reset successfully');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      const mockUser = {
        id: 'user-123',
        email_confirmed_at: null,
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.verifyEmail({ token: 'verify-token' });

      expect(result.message).toBe('Email verified successfully');
    });

    it('should return message if email already verified', async () => {
      const mockUser = {
        id: 'user-123',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.verifyEmail({ token: 'verify-token' });

      expect(result.message).toBe('Email is already verified');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(service.verifyEmail({ token: 'invalid-token' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.changePassword('user-123', 'test@example.com', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(result.message).toBe('Password changed successfully');
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(
        service.changePassword('user-123', 'test@example.com', {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
