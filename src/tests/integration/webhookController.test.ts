// src/tests/integration/webhookController.test.ts

import request from 'supertest';
import express from 'express';
import router from '../../../src/routes/webhook.routes';
import * as conversationManager from '../../../src/services/conversationManager';
import * as audioService from '../../../src/services/audioService';
import * as whatsapp from '../../../src/api/whatsapp';

const app = express();
app.use(express.json());
app.use('/webhook', router);

describe('WebhookController – Integração', () => {
  const VALID_TOKEN = 'verificabotaloco123';

  describe('GET /webhook (verificação)', () => {
    it('deve retornar 200 quando token for válido', async () => {
      const res = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': VALID_TOKEN,
          'hub.challenge': '123456'
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe('123456');
    });

    it('deve retornar 403 quando token for inválido', async () => {
      const res = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'token_errado',
          'hub.challenge': '123456'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /webhook (mensagens)', () => {
    it('deve ignorar evento sem mensagens (status)', async () => {
      const res = await request(app)
        .post('/webhook')
        .send({ entry: [{ changes: [{ value: {} }] }] });

      expect(res.status).toBe(200);
    });

    it('deve processar mensagem de texto', async () => {
      const handleMessageMock = jest
        .spyOn(conversationManager, 'handleMessage')
        .mockResolvedValue({ type: 'text', text: 'Resposta do bot' });

      const sendTextMock = jest
        .spyOn(whatsapp, 'sendText')
        .mockResolvedValue();

      const payload = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '5599999999999',
                text: { body: 'Olá' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      const res = await request(app).post('/webhook').send(payload);

      expect(res.status).toBe(200);
      expect(handleMessageMock).toHaveBeenCalledWith('5599999999999', 'Olá', { isAudio: false });
      expect(sendTextMock).toHaveBeenCalledWith('5599999999999', 'Resposta do bot');

      jest.restoreAllMocks();
    });

    it('deve processar mensagem de áudio', async () => {
      const transcribeMock = jest
        .spyOn(audioService.audioService, 'transcribe')
        .mockResolvedValue('Texto transcrito');

      const handleMessageMock = jest
        .spyOn(conversationManager, 'handleMessage')
        .mockResolvedValue({ type: 'text', text: 'Resposta do bot' });

      const sendTextMock = jest
        .spyOn(whatsapp, 'sendText')
        .mockResolvedValue();

      const payload = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '5599999999999',
                type: 'audio',
                audio: { id: 'media123' }
              }]
            }
          }]
        }]
      };

      const res = await request(app).post('/webhook').send(payload);

      expect(res.status).toBe(200);
      expect(transcribeMock).toHaveBeenCalledWith('media123');
      expect(handleMessageMock).toHaveBeenCalledWith('5599999999999', 'Texto transcrito', { isAudio: true });

      jest.restoreAllMocks();
    });

    it('deve retornar 500 se handleMessage lançar erro', async () => {
      jest
        .spyOn(conversationManager, 'handleMessage')
        .mockRejectedValue(new Error('Erro simulado'));

      const payload = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '5599999999999',
                text: { body: 'Teste de erro' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      const res = await request(app).post('/webhook').send(payload);

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });
  });
});
