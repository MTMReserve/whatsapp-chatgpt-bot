**Arquivo**: `src/app.ts`
```ts
import express from 'express';
import bodyParser from 'body-parser';
import { webhookController } from './controllers/webhookController';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { rateLimiterMiddleware } from './middlewares/rateLimiter';

export const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(rateLimiterMiddleware);

// Rota de Webhook
app.post('/webhook', webhookController);

// Middleware de tratamento de erros
app.use(errorMiddleware);
```