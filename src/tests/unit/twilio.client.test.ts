
// ===============================
// File: src/tests/unit/twilio.client.test.ts
// ===============================
import { twilioClient } from '../../api/twilio';

describe('Twilio Client', () => {
  it('deve estar definido e expor ".api" para chamadas', () => {
    expect(twilioClient).toBeDefined();
    expect(typeof twilioClient.api).toBe('object');
  });
});