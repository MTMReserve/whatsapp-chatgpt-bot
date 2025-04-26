import express from 'express';
import { config } from 'dotenv';
import { envSchema } from './config/env';
import { app } from './app';

// 1. Carrega .env
config();

// 2. Valida variáveis de ambiente
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Erro de validação nas variáveis de ambiente:');
  console.error(parsedEnv.error.format());
  process.exit(1); // Encerra o app imediatamente se falhar
}

// 3. Ambiente validado e disponível
const env = parsedEnv.data;

// 4. Define a porta (pode usar env.PORT se quiser)
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
