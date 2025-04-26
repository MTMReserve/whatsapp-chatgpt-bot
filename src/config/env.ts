import { z } from 'zod';

// Define o esquema de validação do ambiente
export const envSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_NUMBER_TO: z.string().regex(/^whatsapp:\+\d+$/, 'Formato deve ser whatsapp:+<número>'),
  TWILIO_WHATSAPP_NUMBER_FROM: z.string().regex(/^whatsapp:\+\d+$/, 'Formato deve ser whatsapp:+<número>'),
  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),
});

// (❌ não faz mais o parse aqui!)
