import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './config/swagger';

import { rateLimiterMiddleware } from './middlewares/rateLimiterMiddleware';
import { errorMiddleware } from './middlewares/errorMiddleware';
import webhookRouter from './routes/webhook.routes';

/**
 * Cria e configura a instância do Express
 */
export default function createApp(): Express {
  const app = express();

  // Segurança HTTP
  app.use(helmet());
  app.use(cors());

  // Parser JSON
  app.use(bodyParser.json());

  // Rate limiter global
  app.use(rateLimiterMiddleware);

  // Swagger UI
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Rota Webhook
  app.use('/webhook', webhookRouter);

  // Tratamento global de erros
  app.use(errorMiddleware);

  return app;
}
