import { z } from 'zod';

const envSchema = z.object({
  // Twilio
  TWILIO_SID: z.string().min(1, { message: 'TWILIO_SID é obrigatório' }),
  TWILIO_TOKEN: z.string().min(1, { message: 'TWILIO_TOKEN é obrigatório' }),
  TWILIO_WHATSAPP_NUMBER: z.string().min(1, { message: 'TWILIO_WHATSAPP_NUMBER é obrigatório' }),

  // OpenAI
  OPENAI_KEY: z.string().min(1, { message: 'OPENAI_KEY é obrigatório' }),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_TEMPERATURE: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !Number.isNaN(num) && num >= 0 && num <= 2, {
      message: 'OPENAI_TEMPERATURE deve ser número entre 0 e 2',
    }),

  // MySQL
  DB_HOST: z.string().min(1, { message: 'DB_HOST é obrigatório' }),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((num) => !Number.isNaN(num) && num > 0, {
      message: 'DB_PORT deve ser número válido',
    }),
  DB_USER: z.string().min(1, { message: 'DB_USER é obrigatório' }),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1, { message: 'DB_NAME é obrigatório' }),

  // Rate Limiter
  RATE_LIMIT_POINTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((num) => !Number.isNaN(num) && num >= 1, {
      message: 'RATE_LIMIT_POINTS deve ser inteiro ≥ 1',
    }),
  RATE_LIMIT_DURATION: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((num) => !Number.isNaN(num) && num >= 1, {
      message: 'RATE_LIMIT_DURATION deve ser inteiro ≥ 1',
    }),

  // Humanizer
  HUMANIZER_MIN_DELAY_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((num) => !Number.isNaN(num) && num >= 0, {
      message: 'HUMANIZER_MIN_DELAY_MS deve ser inteiro ≥ 0',
    }),
  HUMANIZER_MAX_DELAY_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((num) => !Number.isNaN(num) && num >= 0, {
      message: 'HUMANIZER_MAX_DELAY_MS deve ser inteiro ≥ 0',
    }),

  // Logger
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

// Faz parse de process.env e interrompe se faltar algo
export const env = envSchema.parse(process.env);
