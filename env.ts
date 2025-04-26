**Arquivo**: `src/config/env.ts`
```ts
import { z } from 'zod';

// Validação e tipagem das variáveis de ambiente
const envSchema = z.object({
  // Twilio
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_NUMBER_TO: z.string().regex(/^whatsapp:\+\d+$/, 'Formato deve ser whatsapp:+<número>'),
  TWILIO_WHATSAPP_NUMBER_FROM: z.string().regex(/^whatsapp:\+\d+$/, 'Formato deve ser whatsapp:+<número>'),

  // OpenAI
  OPENAI_KEY: z.string(),
  OPENAI_MODEL: z.string(),

  // Banco de Dados
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string(),
});

export const env = envSchema.parse(process.env);
```

> Essa configuração garante que **todas** as variáveis críticas estejam definidas **antes** de inicializar o servidor.  
