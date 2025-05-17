// src/tests/unit/whatsapp.test.ts

import axios from 'axios';
import { downloadMedia, sendAudio, sendText } from '../../../src/api/whatsapp';
import { logger } from '../../../src/utils/logger';

jest.mock('axios');
jest.mock('../../../src/utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('whatsapp.ts', () => {
  const TOKEN = 'fake-token';
  const PHONE_ID = 'fake-phone-id';

  beforeEach(() => {
    process.env.META_TOKEN = TOKEN;
    process.env.META_PHONE_NUMBER_ID = PHONE_ID;
    jest.clearAllMocks();
  });

  describe('downloadMedia', () => {
    it('deve baixar e retornar buffer da mídia com sucesso', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { url: 'https://fake.url/mediafile.mp3' } }) // primeira chamada
        .mockResolvedValueOnce({ data: new ArrayBuffer(8) }); // segunda chamada

      const buffer = await downloadMedia('123');

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Mídia baixada com sucesso'), expect.anything());
    });

    it('deve lançar erro se token não estiver definido', async () => {
      delete process.env.META_TOKEN;

      await expect(downloadMedia('123')).rejects.toThrow('META_TOKEN não definido no .env');
    });

    it('deve capturar e logar erro do axios', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('falha de rede'));

      await expect(downloadMedia('123')).rejects.toThrow('falha de rede');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao baixar mídia'),
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('sendAudio', () => {
    it('deve enviar áudio com sucesso', async () => {
      mockedAxios.post = jest.fn().mockResolvedValue({ status: 200 });

      const buffer = Buffer.from('audio');
      await sendAudio('5599999999999', buffer);

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Enviando áudio'), expect.anything());
    });

    it('deve lançar erro se token ou phone ID não estiverem definidos', async () => {
      delete process.env.META_TOKEN;
      await expect(sendAudio('5599999999999', Buffer.from('audio'))).rejects.toThrow();
    });

    it('deve capturar e logar erro no envio do áudio', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('erro no envio'));

      await expect(sendAudio('5599999999999', Buffer.from('audio'))).rejects.toThrow('erro no envio');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar áudio'),
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe('sendText', () => {
    it('deve enviar texto com sucesso', async () => {
      mockedAxios.post = jest.fn().mockResolvedValue({ status: 200 });

      await sendText('5599999999999', 'Olá mundo');

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Enviando texto'), expect.anything());
    });

    it('deve capturar e logar erro no envio de texto', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('erro HTTP'));

      await expect(sendText('5599999999999', 'teste')).rejects.toThrow('erro HTTP');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar texto'),
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });
});
