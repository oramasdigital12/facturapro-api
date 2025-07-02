import { jest } from '@jest/globals';

// Mock de Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn()
  },
  from: jest.fn()
};

// Mock del módulo supabase
jest.unstable_mockModule('../../../config/supabase.js', () => ({
  supabase: mockSupabase
}));

describe('User Model', () => {
  let User;

  beforeAll(async () => {
    // Importar el módulo User después del mock
    User = (await import('../../../models/User.js')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockAuthUser = {
        user: { id: 'test-user-id' }
      };
      const mockDbUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User'
      };

      // Configurar mocks
      mockSupabase.auth.signUp.mockResolvedValue({
        data: mockAuthUser,
        error: null
      });

      const mockInsert = {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockDbUser,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsert)
      });

      const result = await User.register('test@example.com', 'password123', 'Test User');
      
      expect(result).toEqual({
        ...mockDbUser,
        message: 'Por favor, confirma tu email antes de iniciar sesión'
      });
    });

    it('should handle auth signup error', async () => {
      // Configurar mock para error de auth
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' }
      });

      let error;
      try {
        await User.register('test@example.com', 'password123', 'Test User');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-token'
      };
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const result = await User.login('test@example.com', 'password123');
      
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.full_name,
          role: mockUser.role
        },
        token: mockSession.access_token
      });
    });

    it('should handle login error', async () => {
      // Configurar mock para error de auth
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      let error;
      try {
        await User.login('test@example.com', 'wrongpassword');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const result = await User.getProfile('test-user-id');
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found error', async () => {
      // Configurar mock para error de base de datos
      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' }
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      let error;
      try {
        await User.getProfile('non-existent-id');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('User not found');
    });
  });
}); 