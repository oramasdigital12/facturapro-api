import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

describe('Health Check Endpoints', () => {
  let app;

  beforeAll(async () => {
    // Crear una app Express simple para testing
    app = express();
    app.use(express.json());

    // Importar y configurar los controladores de health
    const healthController = await import('../../controllers/healthController.js');
    
    // Configurar rutas de health
    app.get('/health', healthController.getHealth);
    app.get('/ready', healthController.getReady);
    app.get('/live', healthController.getLive);
    app.get('/', healthController.getInfo);
  });

  describe('GET /health', () => {
    it('should return health status successfully', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('services');
    });

    it('should include database status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services.database).toHaveProperty('status');
      expect(response.body.services.database).toHaveProperty('responseTime');
    });

    it('should include memory status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.services).toHaveProperty('memory');
      expect(response.body.services.memory).toHaveProperty('used');
      expect(response.body.services.memory).toHaveProperty('total');
      expect(response.body.services.memory).toHaveProperty('percentage');
    });
  });

  describe('GET /ready', () => {
    it('should return ready status successfully', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });

    it('should include database connectivity check', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
    });
  });

  describe('GET /live', () => {
    it('should return live status successfully', async () => {
      const response = await request(app)
        .get('/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should include API documentation endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.endpoints).toContain('/api-docs');
    });
  });
}); 