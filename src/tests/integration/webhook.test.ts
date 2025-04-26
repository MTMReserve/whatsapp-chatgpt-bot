// ===============================
// File: src/tests/integration/webhook.test.ts
// ===============================
import request from 'supertest';
import createApp from '../../app';

describe('Webhook Controller', () => {
  it('POST /webhook should return 200', async () => {
    const app = createApp();
    await request(app)
      .post('/webhook')
      .send({})
      .expect(200);
  });
});
