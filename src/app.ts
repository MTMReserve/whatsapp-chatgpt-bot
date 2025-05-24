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

import { logger } from './utils/logger';

/**
 * Cria e configura a instância do Express
 */
export default function createApp(): Express {
  const app = express();

  logger.info('[app] Inicializando aplicação Express');

  // Segurança HTTP
  app.use(helmet());
  logger.debug('[app] Helmet aplicado');

  app.use(cors());
  logger.debug('[app] CORS habilitado');

  // Parser JSON
  app.use(bodyParser.json());
  logger.debug('[app] bodyParser JSON registrado');

  // Rate limiter global
  app.use(rateLimiterMiddleware);
  logger.debug('[app] rateLimiterMiddleware aplicado');

  // Swagger UI
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('[app] Swagger UI disponível em /api-docs');

  // Rota Webhook
  app.use('/webhook', webhookRouter);
  logger.debug('[app] Rota /webhook registrada');

  // Tratamento global de erros
  app.use(errorMiddleware);
  logger.debug('[app] errorMiddleware registrado');

  logger.info('[app] Aplicação configurada com sucesso');

  return app;
}
