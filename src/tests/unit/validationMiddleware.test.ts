import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validationMiddleware } from '../../middlewares/validationMiddleware';

const app = express();
app.use(express.json());
app.post(
  '/test-validate',
  validationMiddleware(z.object({ name: z.string().min(1) })),
  (_req: Request, res: Response) => res.status(200).send({ success: true })
);

describe('validationMiddleware', () => {
  it('deve falhar quando payload inválido', async () => {
    const res = await request(app).post('/test-validate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.success).toBe(false);
  });

  it('deve passar quando payload válido', async () => {
    const res = await request(app)
      .post('/test-validate')
      .send({ name: 'Maurício' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
