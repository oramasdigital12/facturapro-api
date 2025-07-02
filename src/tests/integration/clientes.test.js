import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock de Supabase
const mockSupabase = {
  from: jest.fn()
};

// Mock del módulo supabase
jest.unstable_mockModule('../../config/supabase.js', () => ({
  supabase: mockSupabase,
  getSupabaseForUser: jest.fn(() => mockSupabase)
}));

describe('Clientes Endpoints', () => {
  let app;

  beforeAll(async () => {
    // Mock auth middleware
    jest.unstable_mockModule('../../middlewares/auth.js', () => ({
      authenticateToken: jest.fn((req, res, next) => {
        req.user = { id: 'test-user-id' };
        next();
      })
    }));

    // Crear una app Express simple para testing
    app = express();
    app.use(express.json());

    // Importar y configurar las rutas de clientes
    const clienteRoutes = await import('../../routes/clienteRoutes.js');
    app.use('/api/clientes', clienteRoutes.default);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/clientes', () => {
    it('should create a new client successfully', async () => {
      const mockClient = {
        id: 'client-123',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+1234567890',
        user_id: 'test-user-id',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockInsert = {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockClient,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsert)
      });

      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '+1234567890'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe('Juan Pérez');
      expect(response.body.email).toBe('juan@example.com');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nombre: 'Juan Pérez'
          // missing email
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nombre: 'Juan Pérez',
          email: 'invalid-email',
          telefono: '+1234567890'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '+1234567890'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/clientes', () => {
    it('should get all clients for user', async () => {
      const mockClients = [
        {
          id: 'client-1',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '+1234567890',
          user_id: 'test-user-id'
        },
        {
          id: 'client-2',
          nombre: 'María García',
          email: 'maria@example.com',
          telefono: '+0987654321',
          user_id: 'test-user-id'
        }
      ];

      const mockSelect = {
        eq: jest.fn().mockResolvedValue({
          data: mockClients,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const response = await request(app)
        .get('/api/clientes')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('clientes');
      expect(response.body.clientes).toHaveLength(2);
      expect(response.body.clientes[0].nombre).toBe('Juan Pérez');
    });

    it('should return empty array when no clients exist', async () => {
      const mockSelect = {
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const response = await request(app)
        .get('/api/clientes')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.clientes).toHaveLength(0);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('should get client by ID', async () => {
      const mockClient = {
        id: 'client-123',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+1234567890',
        user_id: 'test-user-id'
      };

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockClient,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const response = await request(app)
        .get('/api/clientes/client-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'client-123');
      expect(response.body.nombre).toBe('Juan Pérez');
    });

    it('should return 404 for non-existent client', async () => {
      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Client not found' }
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelect)
      });

      const response = await request(app)
        .get('/api/clientes/non-existent')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('should update client successfully', async () => {
      const mockUpdatedClient = {
        id: 'client-123',
        nombre: 'Juan Pérez Updated',
        email: 'juan.updated@example.com',
        telefono: '+1234567890',
        user_id: 'test-user-id'
      };

      const mockUpdate = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedClient,
                error: null
              })
            })
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockUpdate)
      });

      const response = await request(app)
        .put('/api/clientes/client-123')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nombre: 'Juan Pérez Updated',
          email: 'juan.updated@example.com'
        })
        .expect(200);

      expect(response.body.nombre).toBe('Juan Pérez Updated');
      expect(response.body.email).toBe('juan.updated@example.com');
    });

    it('should return 404 for non-existent client', async () => {
      const mockUpdate = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Client not found' }
              })
            })
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockUpdate)
      });

      const response = await request(app)
        .put('/api/clientes/non-existent')
        .set('Authorization', 'Bearer valid-token')
        .send({
          nombre: 'Updated Name'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('should delete client successfully', async () => {
      const mockDelete = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockDelete)
      });

      const response = await request(app)
        .delete('/api/clientes/client-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('eliminado');
    });

    it('should return 404 for non-existent client', async () => {
      const mockDelete = {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Client not found' }
          })
        })
      };

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockDelete)
      });

      const response = await request(app)
        .delete('/api/clientes/non-existent')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 