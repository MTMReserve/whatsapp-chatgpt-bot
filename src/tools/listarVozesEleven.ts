// src/tools/listarVozesEleven.ts

import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

async function listarVozes() {
  try {
    logger.info('[listarVozesEleven] 🔍 Buscando vozes disponíveis na ElevenLabs...');

    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY
      }
    });

    const vozes = response.data.voices;

    const vozesPortugues = vozes.filter((voz: any) =>
      voz.labels?.language?.toLowerCase().includes('portuguese') ||
      voz.labels?.accent?.toLowerCase().includes('brazilian')
    );

    console.log('\n==================== VOZES COMPATÍVEIS COM PORTUGUÊS ====================');
    vozesPortugues.forEach((voz: any) => {
      console.log(`\n🗣️  Nome: ${voz.name}`);
      console.log(`🔤 ID: ${voz.voice_id}`);
      console.log(`🌍 Idioma: ${voz.labels?.language || 'N/A'}`);
      console.log(`🎯 Acento: ${voz.labels?.accent || 'N/A'}`);
    });

    console.log('\n🎯 Total de vozes em português:', vozesPortugues.length);
  } catch (error: any) {
    console.error('[listarVozesEleven] ❌ Erro ao buscar vozes:', error?.response?.data || error.message);
  }
}

listarVozes();
