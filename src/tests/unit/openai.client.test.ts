// File: src/tests/unit/openai.client.test.ts

// Mock das variáveis de ambiente para evitar ZodErro no import de '../config/env'
jest.mock('../../config/env', () => ({
  env: {
    TWILIO_SID: 'sid',
    TWILIO_TOKEN: 'token',
    TWILIO_WHATSAPP_NUMBER: 'whatsapp:+000000000',
    OPENAI_KEY: 'test-key',
    OPENAI_MODEL: 'gpt-3.5-turbo',
    OPENAI_TEMPERATURE: 0.7,
    DB_HOST: 'localhost',
    DB_PORT: 3306,
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_NAME: 'test_db',
    RATE_LIMIT_POINTS: 10,
    RATE_LIMIT_DURATION: 1,
    HUMANIZER_MIN_DELAY_MS: 100,
    HUMANIZER_MAX_DELAY_MS: 500,
    LOG_LEVEL: 'info',
  }
}));

import { openaiClient } from '../../api/openai';
import { OpenAI } from 'openai';

describe('OpenAI Client', () => {
  it('deve estar definido e ser instância de OpenAI', () => {
    expect(openaiClient).toBeDefined();
    expect(openaiClient).toBeInstanceOf(OpenAI);
  });
});
