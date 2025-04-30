/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import createApp from '../../app';
import { limiter } from '../../middlewares/rateLimiterMiddleware';

jest.mock('../../api/openai', () => ({
  openaiClient: {
    chat: {
      create: jest
        .fn()
        .mockResolvedValue({ data: { choices: [{ message: { content: 'OK' } }] } }),
    },
  },
}));

jest.mock('../../api/twilio', () => ({
  twilioClient: {
    messages: { create: jest.fn().mockResolvedValue({ sid: 'SM123' }) },
  },
}));

describe('E2E /webhook', () => {
  const app = createApp(); // ✅ aqui era "let", agora é "const"

  beforeAll(() => {
    process.env.HUMANIZER_MIN_DELAY_MS = '0';
    process.env.HUMANIZER_MAX_DELAY_MS = '0';
    jest.spyOn(limiter, 'consume').mockResolvedValue(undefined as any);
  });

  it('GET /webhook → 200 OK', async () => {
    const res = await request(await app).get('/webhook');
    expect(res.status).toBe(200);
  });

  it('POST /webhook → 200 OK', async () => {
    const res = await request(await app).post('/webhook').send({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '12345',
                    text: { body: 'Olá' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(res.status).toBe(200);
  });
});
