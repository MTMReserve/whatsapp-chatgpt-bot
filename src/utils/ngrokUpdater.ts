// src/utils/ngrokUpdater.ts

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Atualiza a variável TWILIO_WHATSAPP_NUMBER_FROM no arquivo .env
 * caso você queira injetar dinamicamente o número gerado pelo ngrok.
 */
export function updateNgrokEnv(newNumber: string): void {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  const regex = /^TWILIO_WHATSAPP_NUMBER_FROM=.*$/m;
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `TWILIO_WHATSAPP_NUMBER_FROM=${newNumber}`);
  } else {
    envContent += `\nTWILIO_WHATSAPP_NUMBER_FROM=${newNumber}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
  logger.info(`Variável TWILIO_WHATSAPP_NUMBER_FROM atualizada com sucesso no .env.`);
}
