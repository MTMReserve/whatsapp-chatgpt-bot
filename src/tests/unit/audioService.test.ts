import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { audioService } from 'services/audioService'; // ✅ Import absoluto

jest.mock('axios');
jest.mock('fs');

describe('audioService', () => {
  const mockBuffer = Buffer.from('fake audio');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transcribeAudio', () => {
    it('deve retornar o texto transcrito com sucesso', async () => {
      const mockText = 'Olá, quero informações';
      (axios.post as jest.Mock).mockResolvedValue({ data: { text: mockText } });
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.createReadStream as unknown as jest.Mock).mockReturnValue('stream');
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      const text = await audioService.transcribeAudio(mockBuffer);
      expect(text).toBe(mockText);
      expect(axios.post).toHaveBeenCalled();
    });

    it('deve lançar erro se a API Whisper falhar', async () => {
      (axios.post as jest.Mock).mockRejectedValue({ response: { data: 'Erro da API' } });
      await expect(audioService.transcribeAudio(mockBuffer)).rejects.toThrow('Erro na transcrição do áudio');
    });
  });

  describe('synthesizeSpeech', () => {
    it('deve retornar um Buffer com o áudio gerado', async () => {
      const fakeAudio = Buffer.from('audio result');
      (axios.post as jest.Mock).mockResolvedValue({ data: fakeAudio });

      const result = await audioService.synthesizeSpeech('Mensagem para sintetizar');
      expect(result).toBeInstanceOf(Buffer);
      expect(axios.post).toHaveBeenCalled();
    });

    it('deve lançar erro se a API ElevenLabs falhar', async () => {
      (axios.post as jest.Mock).mockRejectedValue({ response: { data: 'Erro da API Eleven' } });
      await expect(audioService.synthesizeSpeech('Erro')).rejects.toThrow('Erro na síntese de voz');
    });
  });
});
