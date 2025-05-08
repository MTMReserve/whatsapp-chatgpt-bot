import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/** Esquema completo de validação do .env */
const envSchema = z.object({
  // Banco de dados
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),

  // OpenAI
  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.7),

  // WhatsApp Cloud API (Meta)
  META_TOKEN: z.string(),
  META_PHONE_NUMBER_ID: z.string(),
  META_WHATSAPP_BUSINESS_ID: z.string().optional(),

  // Webhook
  WHATSAPP_VERIFY_TOKEN: z.string(),
  PORT: z.coerce.number().default(3000),

  // Rate-limit
  RATE_LIMIT_POINTS: z.coerce.number().default(5),
  RATE_LIMIT_DURATION: z.coerce.number().default(60),

  // Humanizer
  HUMANIZER_MIN_DELAY_MS: z.coerce.number().default(500),
  HUMANIZER_MAX_DELAY_MS: z.coerce.number().default(1500),

  // Log
  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('⚠️ .env validation error', parsed.error.format());

  // Não derruba testes automatizados
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

/* ------------------------------------------------------------------
   Exporta sempre um objeto, mesmo se a validação falhar em NODE_ENV=test
-------------------------------------------------------------------*/
export const env: z.infer<typeof envSchema> =
  parsed.success ? parsed.data : ({} as any);
