import axios from 'axios';
import { env } from '../config/env';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Serviço de áudio: transcrição com Whisper e síntese com ElevenLabs
 */
export const audioService = {
  /** Transcreve um áudio usando Whisper API da OpenAI */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const tempPath = path.join(__dirname, '../../temp-audio.mp3');
    try {
      logger.debug(`[audioService] Iniciando transcrição de áudio`);
      const form = new FormData();

      fs.writeFileSync(tempPath, audioBuffer);
      logger.debug(`[audioService] Arquivo temporário criado: ${tempPath}`);

      form.append('file', fs.createReadStream(tempPath));
      form.append('model', 'whisper-1');
      form.append('language', 'pt');

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${env.OPENAI_KEY}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      fs.unlinkSync(tempPath);
      logger.info(`[audioService] Transcrição concluída com sucesso`);
      return response.data.text;
    } catch (error: any) {
      logger.error(`[audioService] Erro na transcrição`, { error: error?.response?.data || error });
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        logger.debug(`[audioService] Arquivo temporário removido após erro`);
      }
      throw new Error('Erro na transcrição do áudio');
    }
  },

  /** Sintetiza uma resposta falada com ElevenLabs */
  async synthesizeSpeech(text: string): Promise<Buffer> {
    try {
      logger.debug(`[audioService] Iniciando síntese de voz: "${text.slice(0, 30)}..."`);
      const voiceId = env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.ELEVENLABS_API_KEY
          }
        }
      );

      logger.info(`[audioService] Áudio gerado com sucesso`);
      return Buffer.from(response.data);
    } catch (error: any) {
      logger.error(`[audioService] Erro na síntese de voz`, { error: error?.response?.data || error });
      throw new Error('Erro na síntese de voz');
    }
  }
};
