// src/services/audioService.ts

import axios from 'axios';
import { env } from '../config/env';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * Serviço de áudio: transcrição com Whisper e síntese com ElevenLabs
 */
export const audioService = {
  /** Transcreve um áudio usando Whisper API da OpenAI */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const form = new FormData();
      const tempPath = path.join(__dirname, '../../temp-audio.mp3');
      fs.writeFileSync(tempPath, audioBuffer);

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

      fs.unlinkSync(tempPath); // Remove arquivo temporário
      return response.data.text;
    } catch (error: any) {
      console.error('Erro ao transcrever áudio:', error?.response?.data || error);
      throw new Error('Erro na transcrição do áudio');
    }
  },

  /** Sintetiza uma resposta falada com ElevenLabs */
  async synthesizeSpeech(text: string): Promise<Buffer> {
    try {
      const voiceId = env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // padrão
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

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('Erro ao gerar áudio ElevenLabs:', error?.response?.data || error);
      throw new Error('Erro na síntese de voz');
    }
  }
};
