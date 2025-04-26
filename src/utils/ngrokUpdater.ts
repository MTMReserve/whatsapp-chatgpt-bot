// ===============================
// File: src/utils/ngrokUpdater.ts
// ===============================

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Atualiza dinamicamente a variável TWILIO_WHATSAPP_NUMBER_FROM no .env
 * após gerar novo número via ngrok, se necessário.
 * (Este é um esqueleto de automação, ainda não plugado ao ngrok.)
 */

export function updateNgrokEnv(newNumber: string) {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    logger.error('Arquivo .env não encontrado para atualização.');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Atualiza a variável TWILIO_WHATSAPP_NUMBER_FROM
  const regex = /^TWILIO_WHATSAPP_NUMBER_FROM=.*$/m;

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `TWILIO_WHATSAPP_NUMBER_FROM=${newNumber}`);
  } else {
    envContent += `\nTWILIO_WHATSAPP_NUMBER_FROM=${newNumber}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
  logger.info(`Variável TWILIO_WHATSAPP_NUMBER_FROM atualizada com sucesso no .env.`);
}
