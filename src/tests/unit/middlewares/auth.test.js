import { jest } from '@jest/globals';

// Mock de Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
};

// Mock del módulo supabase
jest.unstable_mockModule('../../../config/supabase.js', () => ({
  supabase: mockSupabase,
  getSupabaseForUser: jest.fn(() => mockSupabase)
}));

describe('Auth Middleware', () => {
  let authenticateToken;

  beforeAll(async () => {
    // Importar el middleware después del mock
    const authModule = await import('../../../middlewares/auth.js');
    authenticateToken = authModule.authenticateToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockDbUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      };

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockDbUser,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const req = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('test-user-id');
    });

    it('should return 401 for missing token', async () => {
      const req = {
        headers: {}
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token de acceso requerido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token format', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Formato de token inválido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' }
      });

      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user not found in database', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

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

      const req = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 