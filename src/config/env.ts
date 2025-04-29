import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),

  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string(),
  OPENAI_TEMPERATURE: z.string().transform((val) => parseFloat(val)),

  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_NUMBER_TO: z.string(),
  TWILIO_WHATSAPP_NUMBER_FROM: z.string(),
  WHATSAPP_VERIFY_TOKEN: z.string(),

  RATE_LIMIT_POINTS: z.string().transform((val) => parseInt(val, 10)).default('5'),
  RATE_LIMIT_DURATION: z.string().transform((val) => parseInt(val, 10)).default('60'),

  HUMANIZER_MIN_DELAY_MS: z.string().transform((val) => parseInt(val, 10)).default('500'),
  HUMANIZER_MAX_DELAY_MS: z.string().transform((val) => parseInt(val, 10)).default('1500'),

  LOG_LEVEL: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('⚠️ .env validation error', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;