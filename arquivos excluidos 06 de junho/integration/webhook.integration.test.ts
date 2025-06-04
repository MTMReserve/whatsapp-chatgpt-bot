import request from 'supertest';
import createApp from '../../app';
import { pool } from '../../utils/db';

let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  app = createApp();
  // garante que a tabela clients existe com as colunas necessárias
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100),
      phone VARCHAR(20),
      current_state VARCHAR(50) DEFAULT 'abordagem',
      retries INT DEFAULT 0
    );
  `);
});

afterAll(async () => {
  await pool.end();
});

describe('Integração /webhook', () => {
  it('GET /webhook deve retornar 200 e o desafio', async () => {
    const challenge = 'MEU_CHALLENGE';
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    const res = await request(app)
      .get('/webhook')
      .query({
        'hub.verify_token': verifyToken,
        'hub.challenge': challenge
      });
    expect(res.status).toBe(200);
    expect(res.text).toBe(challenge);
  });

  it('POST /webhook deve aceitar JSON e retornar 200', async () => {
    const res = await request(app)
      .post('/webhook')
      .send({ Body: 'Olá' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});
