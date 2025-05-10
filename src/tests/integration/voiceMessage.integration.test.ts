import request from 'supertest';
import createApp from 'app';
import * as whatsappApi from 'api/whatsapp';
import { audioService } from 'services/audioService';
import { handleMessage } from 'services/conversationManager';

jest.mock('api/whatsapp');
jest.mock('services/audioService');
jest.mock('services/conversationManager');

describe('Webhook → Mensagem de Voz', () => {
  const app = createApp();
  const fakePhone = '5511999999999';
  const fakeMediaId = '123456789';
  const fakeAudioBuffer = Buffer.from('fake audio');
  const fakeTranscription = 'Olá, quero saber mais';
  const fakeAudioResponse = Buffer.from('resposta sintetizada');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve processar mensagem de voz e responder com áudio', async () => {
    (whatsappApi.downloadMedia as jest.Mock).mockResolvedValue(fakeAudioBuffer);
    (audioService.transcribeAudio as jest.Mock).mockResolvedValue(fakeTranscription);
    (handleMessage as jest.Mock).mockResolvedValue({
      text: fakeTranscription,
      audioBuffer: fakeAudioResponse,
    });
    (whatsappApi.sendAudio as jest.Mock).mockResolvedValue(undefined);

    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: fakePhone,
                    type: 'audio',
                    audio: { id: fakeMediaId },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const response = await request(app)
      .post('/webhook')
      .send(payload)
      .expect(200);

    expect(whatsappApi.downloadMedia).toHaveBeenCalledWith(fakeMediaId);
    expect(audioService.transcribeAudio).toHaveBeenCalledWith(fakeAudioBuffer);
    expect(handleMessage).toHaveBeenCalledWith(fakePhone, fakeTranscription, { isAudio: true });
    expect(whatsappApi.sendAudio).toHaveBeenCalledWith(fakePhone, fakeAudioResponse);
  });
});
