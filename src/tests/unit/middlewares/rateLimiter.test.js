import { jest } from '@jest/globals';

describe('Rate Limiter Middleware', () => {
  let rateLimiter;

  beforeAll(async () => {
    // Importar el middleware
    const rateLimiterModule = await import('../../middlewares/rateLimiter.js');
    rateLimiter = rateLimiterModule.rateLimiter;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rateLimiter', () => {
    it('should allow request within rate limit', () => {
      const req = {
        ip: '127.0.0.1',
        path: '/api/test'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      rateLimiter(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block request when rate limit exceeded', () => {
      const req = {
        ip: '127.0.0.1',
        path: '/api/test'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Simular múltiples requests rápidos
      for (let i = 0; i < 100; i++) {
        rateLimiter(req, res, next);
      }

      // El último request debería ser bloqueado
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'
      });
    });

    it('should handle different IP addresses separately', () => {
      const req1 = {
        ip: '127.0.0.1',
        path: '/api/test'
      };

      const req2 = {
        ip: '192.168.1.1',
        path: '/api/test'
      };

      const res1 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next1 = jest.fn();
      const next2 = jest.fn();

      // Simular requests desde diferentes IPs
      for (let i = 0; i < 50; i++) {
        rateLimiter(req1, res1, next1);
        rateLimiter(req2, res2, next2);
      }

      // Ambos deberían pasar ya que están en IPs diferentes
      expect(next1).toHaveBeenCalled();
      expect(next2).toHaveBeenCalled();
      expect(res1.status).not.toHaveBeenCalled();
      expect(res2.status).not.toHaveBeenCalled();
    });

    it('should handle different paths separately', () => {
      const req1 = {
        ip: '127.0.0.1',
        path: '/api/auth/login'
      };

      const req2 = {
        ip: '127.0.0.1',
        path: '/api/clientes'
      };

      const res1 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next1 = jest.fn();
      const next2 = jest.fn();

      // Simular requests a diferentes paths
      for (let i = 0; i < 50; i++) {
        rateLimiter(req1, res1, next1);
        rateLimiter(req2, res2, next2);
      }

      // Ambos deberían pasar ya que están en paths diferentes
      expect(next1).toHaveBeenCalled();
      expect(next2).toHaveBeenCalled();
      expect(res1.status).not.toHaveBeenCalled();
      expect(res2.status).not.toHaveBeenCalled();
    });
  });
}); 