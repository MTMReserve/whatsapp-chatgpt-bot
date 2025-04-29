import request from 'supertest';
import createApp from '../../app';
import { pool } from '../../utils/db';

let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  app = createApp();
  // Se precisar, inicialize tabelas de teste aqui
});
afterAll(async () => {
  await pool.end();
});

describe('Integração /webhook', () => {
  it('GET /webhook deve retornar 200 e texto OK', async () => {
    const res = await request(app).get('/webhook');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('POST /webhook deve aceitar JSON e retornar 200', async () => {
    const res = await request(app)
      .post('/webhook')
      .send({ Body: 'Olá' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});
