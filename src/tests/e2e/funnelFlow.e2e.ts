// tests/e2e/funnelFlow.e2e.ts

import request from 'supertest';
import createApp from '../../src/app';      // ajusta o caminho se for diferente
import { sendText } from '../../src/api/whatsapp';

jest.mock('../../src/api/whatsapp', () => ({
  sendText: jest.fn(async () => {}),
  sendAudio: jest.fn(async () => {}),
  downloadMedia: jest.fn(),
}));

describe('Funil de vendas completo (E2E)', () => {
  const app = createApp();
  const phone = '5511999999999';
  const webhookPath = '/webhook';

  const simulateMessage = (body: string) => ({
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          contacts: [{ profile: { name: 'Test' }, wa_id: phone }],
          messages: [{
            from: phone,
            id: 'wamid.test',
            timestamp: `${Date.now()}`,
            text: { body },
            type: 'text'
          }]
        }
      }]
    }]
  });

  const steps = [
    { input: 'oi',                         expect: /Olá.*Leo/i },
    { input: 'Meu nome é João',            expect: /João/ },
    { input: 'Quero Micropigmentação de Barba', expect: /Qual .*você prefere/i },
    { input: 'Qual o preço\\?',            expect: /R\\$ 450/ },
    { input: 'Posso parcelar\\?',          expect: /parcelar/i },
    { input: 'Como funciona o processo\\?', expect: /agendamento|funciona/i },
    { input: 'Obrigado',                   expect: /obrigado|de nada/i }
  ];

  for (const step of steps) {
    it(`ao enviar "${step.input}" deve responder conforme o funil`, async () => {
      (sendText as jest.Mock).mockClear();

      await request(app)
        .post(webhookPath)
        .send(simulateMessage(step.input))
        .expect(200);

      expect(sendText).toHaveBeenCalled();
      const lastCall = (sendText as jest.Mock).mock.calls.pop()!;
      const sentText = lastCall[1] as string;
      expect(sentText).toMatch(step.expect);
    });
  }
});
