// src/config/env.ts

import * as dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger';

dotenv.config();

/** Esquema de validação do .env atualizado */
const envSchema = z.object({
  // Banco de dados
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),

  // MongoDB
  MONGO_URL: z.string(),  // ✅ Adicionado

  // OpenAI
  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.7),

  // Webhook
  WHATSAPP_VERIFY_TOKEN: z.string(),

  // WhatsApp Cloud API (Meta)
  META_TOKEN: z.string(),
  META_PHONE_NUMBER_ID: z.string(),
  META_WHATSAPP_BUSINESS_ID: z.string(),

  // ElevenLabs (TTS)
  ELEVENLABS_API_KEY: z.string(),
  ELEVENLABS_VOICE_ID: z.string().default('EXAVITQu4vr4xnSDxMaL'),

  // Áudio
  AUDIO_LANGUAGE: z.string().default('pt'),

  // Rate-limit
  RATE_LIMIT_POINTS: z.coerce.number().default(5),
  RATE_LIMIT_DURATION: z.coerce.number().default(60),

  // Humanizer
  HUMANIZER_MIN_DELAY_MS: z.coerce.number().default(500),
  HUMANIZER_MAX_DELAY_MS: z.coerce.number().default(1500),

  // Log
  LOG_LEVEL: z.string().default('info'),

  // Server
  PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error('⚠️ .env validation error', parsed.error.format());

  // Não derruba testes automatizados
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
} else {
  logger.info('[env] ✅ Variáveis de ambiente carregadas com sucesso');
}

export const env: z.infer<typeof envSchema> = parsed.success
  ? parsed.data
  : {} as z.infer<typeof envSchema>;
