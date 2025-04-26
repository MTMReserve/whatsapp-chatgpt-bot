// ===============================
// File: src/app.ts
// ===============================

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';

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

  // Rotas principais
  app.use('/webhook', webhookRouter);

  // Rota de teste de erro (500)
  app.get('/test-error', (_req: Request, _res: Response) => {
    throw new Error('Erro forçado para teste');
  });

  // Rota de teste de validação (400)
  const testSchema = z.object({ nome: z.string().min(1) });
  app.post('/test-validate', validationMiddleware(testSchema), (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Payload válido!' });
  });

  // Middleware de tratamento de erros (último da cadeia)
  app.use(errorMiddleware);

  return app;
}
