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
 * Cria e configura a instância da aplicação Express.
 * Middleware padrão de segurança, parser, Swagger e rotas.
 *
 * @returns {Express} Aplicação configurada
 */
export default function createApp(): Express {
  const app = express();

  logger.info('[app] Inicializando aplicação Express');

  // Segurança HTTP com Helmet
  app.use(helmet());
  logger.debug('[app] Helmet aplicado');

  // Liberação de CORS
  app.use(cors());
  logger.debug('[app] CORS habilitado');

  // Parser para JSON no body
  app.use(bodyParser.json());
  logger.debug('[app] bodyParser JSON registrado');

  // Middleware de limite de requisições
  app.use(rateLimiterMiddleware);
  logger.debug('[app] rateLimiterMiddleware aplicado');

  // Swagger UI - documentação disponível via /api-docs
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('[app] Swagger UI disponível em /api-docs');

  // Rota principal do webhook
  app.use('/webhook', webhookRouter);
  logger.debug('[app] Rota /webhook registrada');

  // Middleware global de tratamento de erros
  app.use(errorMiddleware);
  logger.debug('[app] errorMiddleware registrado');

  logger.info('[app] Aplicação configurada com sucesso');

  return app;
}
