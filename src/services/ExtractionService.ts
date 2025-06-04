import { createChatCompletion } from '../api/openai';
import { logger } from '../utils/logger';
import type { Client } from '../types/Client';

export interface FieldValidation {
  value: string | null;
  valid: boolean;
  reason?: string;
}

export interface ExtractResult {
  fields: Record<string, FieldValidation>;
}

export async function extractAndValidateAll(
  message: string,
  clientId: string,
  requiredFields: (keyof Client)[]
): Promise<ExtractResult> {
  const prompt = `
Você é um assistente que faz extração e validação de dados para um funil de vendas.
Receba o seguinte JSON de entrada:
{
  "message": "${message.replace(/"/g, "'")}",
  "requiredFields": ${JSON.stringify(requiredFields)}
}
Para cada campo listado em requiredFields, extraia o valor e valide:

Retorne SOMENTE JSON no seguinte formato:
{
  "campo1": { "value": "...", "valid": true|false, "reason"?: "..." },
  ...
}
  `.trim();

  logger.debug(`[ExtractionService] Prompt enviado à IA:\n${prompt}`);

  const resposta = await createChatCompletion(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 }
  );

  const content = resposta.choices[0]?.message?.content?.trim() || '{}';

  try {
    const json: Record<string, FieldValidation> = JSON.parse(content);
    logger.debug(`[ExtractionService] Resposta IA (parsed): ${JSON.stringify(json)}`);
    return { fields: json };
  } catch (e) {
    logger.error('[ExtractionService] Erro ao fazer parse da resposta da IA:', e);
    return { fields: {} };
  }
}
