/**
 * Configuração Swagger (OpenAPI 3.0)
 */
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp ChatGPT Bot API',
      version: '1.0.0',
      description: 'API para interação com WhatsApp via ChatGPT',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
