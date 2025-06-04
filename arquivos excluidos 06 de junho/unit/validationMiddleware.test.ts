// src/tests/unit/validationMiddleware.test.ts

import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validationMiddleware } from '../../middlewares/validationMiddleware';

const app = express();
app.use(express.json());

/**
 * O middleware espera um objeto com as chaves
 * { body, query, params }. Criamos um schema enxuto que
 * valida apenas body.name e deixa query/params opcionais.
 */
const testSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

app.post(
  '/test-validate',
  validationMiddleware(testSchema),
  (_req: Request, res: Response) => res.status(200).send({ success: true })
);

describe('validationMiddleware', () => {
  it('deve falhar quando payload inválido', async () => {
    const res = await request(app).post('/test-validate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Payload inválido');
  });

  it('deve passar quando payload válido', async () => {
    const res = await request(app)
      .post('/test-validate')
      .send({ name: 'Maurício' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
