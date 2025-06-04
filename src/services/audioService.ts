import axios from 'axios';
import { env } from '../config/env';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { execSync } from 'child_process';
import { naturalizarTexto } from '../utils/naturalizarTexto'; // ✅ novo import

export const audioService = {
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const tempPath = path.join(__dirname, '../../temp-audio.mp3');
    try {
      logger.debug(`[audioService] Iniciando transcrição de áudio`);
      fs.writeFileSync(tempPath, audioBuffer);

      const form = new FormData();
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
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error('Erro na transcrição do áudio');
    }
  },

  async synthesizeSpeech(text: string): Promise<Buffer> {
    const tempMp3 = path.join(__dirname, '../../temp-resposta.mp3');
    const tempOgg = path.join(__dirname, '../../temp-resposta.ogg');

    try {
      logger.debug(`[audioService] Iniciando síntese de voz: "${text.slice(0, 30)}..."`);

      // ✅ Naturalizar texto antes da síntese
      const textoNatural = naturalizarTexto(text);
      logger.debug(`[audioService] Texto naturalizado: "${textoNatural}"`);

      const voiceId = env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: textoNatural, // ✅ usa texto naturalizado
          model_id: 'eleven_multilingual_v1',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8
          },
          output_format: 'mp3'
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.ELEVENLABS_API_KEY
          }
        }
      );

      fs.writeFileSync(tempMp3, response.data);

      execSync(`ffmpeg -y -i "${tempMp3}" -c:a libopus -b:a 64k -vbr on "${tempOgg}"`);

      const finalAudio = fs.readFileSync(tempOgg);
      logger.info(`[audioService] Áudio gerado e convertido com sucesso`);

      fs.unlinkSync(tempMp3);
      fs.unlinkSync(tempOgg);

      return finalAudio;
    } catch (error: any) {
      logger.error(`[audioService] Erro na síntese de voz`, { error: error?.response?.data || error });
      if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
      if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg);
      throw new Error('Erro na síntese de voz');
    }
  }
};
