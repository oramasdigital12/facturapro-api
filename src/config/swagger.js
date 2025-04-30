import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM WhatsApp API',
      version: '1.0.0',
      description: 'API para CRM WhatsApp Minimalista para Vendedores',
      contact: {
        name: 'Soporte',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      BearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js', './src/index.js'], // archivos donde buscar anotaciones
};

export const swaggerSpec = swaggerJsdoc(options); 