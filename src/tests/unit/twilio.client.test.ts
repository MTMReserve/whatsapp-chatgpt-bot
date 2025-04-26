// File: src/tests/unit/twilio.client.test.ts

// Mock das variáveis de ambiente para evitar ZodError no import de '../config/env'
// Utiliza SID começando com 'AC' para satisfazer validação da Twilio SDK
jest.mock('../../config/env', () => ({
  env: {
    TWILIO_SID: 'AC000000000000000000000000000000',
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

import { twilioClient } from '../../api/twilio';

describe('Twilio Client', () => {
  it('deve estar definido e expor ".api" para chamadas', () => {
    expect(twilioClient).toBeDefined();
    expect(typeof twilioClient.api).toBe('object');
  });
});
