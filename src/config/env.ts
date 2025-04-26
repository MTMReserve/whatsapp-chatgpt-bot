
// ===============================
// File: src/config/env.ts
// ===============================

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config(); // Carrega variáveis de .env no process.env

// Define e valida o schema das variáveis de ambiente
const envSchema = z.object({
  PORT: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_NUMBER_TO: z.string(),
  TWILIO_WHATSAPP_NUMBER_FROM: z.string(),

  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.8),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),

  RATE_LIMIT_POINTS: z.coerce.number().default(5),
  RATE_LIMIT_DURATION: z.coerce.number().default(60),

  HUMANIZER_MIN_DELAY_MS: z.coerce.number().default(200),
  HUMANIZER_MAX_DELAY_MS: z.coerce.number().default(800),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env;

/**
 * Faz o parse de process.env e interrompe se faltar algo.
 * Usa cachedEnv para evitar reexecução.
 */
export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Erro de validação das variáveis de ambiente', result.error.format());
    process.exit(1);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Retorna as variáveis de ambiente já validadas.
 * Garante que loadEnv() tenha sido chamado anteriormente.
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error('Chame loadEnv() antes de obter as variáveis de ambiente');
  }
  return cachedEnv;
}
