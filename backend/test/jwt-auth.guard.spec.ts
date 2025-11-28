import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AuthService } from '../src/modules/auth/auth.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: AuthService;
  let mockExecutionContext: ExecutionContext;

  const mockAuthService = {
    getUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get<AuthService>(AuthService);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {},
        })),
      })),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'customer',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockExecutionContext.switchToHttp = jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })) as any;

      mockAuthService.getUser.mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockUser);
      expect(authService.getUser).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      const mockRequest = {
        headers: {},
      };

      mockExecutionContext.switchToHttp = jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })) as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Invalid token',
        },
      };

      mockExecutionContext.switchToHttp = jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })) as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Missing or invalid Authorization header');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      mockExecutionContext.switchToHttp = jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })) as any;

      mockAuthService.getUser.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Invalid token');
    });

    it('should extract token correctly from Bearer header', async () => {
      const mockUser = { id: 'user-123' };
      const mockRequest = {
        headers: {
          authorization: 'Bearer token-with-spaces-and-special-chars',
        },
      };

      mockExecutionContext.switchToHttp = jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })) as any;

      mockAuthService.getUser.mockResolvedValue(mockUser);

      await guard.canActivate(mockExecutionContext);

      expect(authService.getUser).toHaveBeenCalledWith('token-with-spaces-and-special-chars');
    });
  });
});

