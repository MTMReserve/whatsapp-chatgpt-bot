// File: src/app.ts
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

import { rateLimiterMiddleware } from './middlewares/rateLimiterMiddleware';
import { validationMiddleware } from './middlewares/validationMiddleware';
import { errorMiddleware } from './middlewares/errorMiddleware';
import webhookRouter from './routes/webhook.routes';

/**
 * Cria e configura a instância do Express
 */
export default function createApp(): Express {
  const app = express();

  // Segurança e parsers
  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());

  // Rate limiter global
  app.use(rateLimiterMiddleware);

  // Montagem das rotas
  app.use('/webhook', webhookRouter);

  // Middleware de validação (exemplo de uso em rotas específicas)
  // app.post('/test-validate', validationMiddleware(z.object({ nome: z.string() })), (req, res) => res.sendStatus(200));

  // Middleware de tratamento de erros (último da cadeia)
  app.use(errorMiddleware);

  return app;
}