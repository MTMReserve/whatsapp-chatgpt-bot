// src/services/validadorIA.ts
import { openai } from '../api/openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Valida se um valor extraído é coerente com o campo esperado.
 * A IA deve responder apenas "sim" ou "não".
 */
export async function validarCampoIA(campo: string, valor: any, contexto: string): Promise<boolean> {
  const prompt = `Você é um assistente de validação. O campo analisado é: "{{campo}}".
O valor extraído é: "{{valor}}".
Contexto da conversa: "{{contexto}}".
Esse valor é válido para esse campo? Responda apenas com "sim" ou "não".`;

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Você é um validador de dados para um bot de vendas. Seja objetivo.' },
        { role: 'user', content: prompt.replace('{{campo}}', campo).replace('{{valor}}', valor).replace('{{contexto}}', contexto) }
      ]
    });

    const resposta = response.choices?.[0]?.message?.content?.toLowerCase().trim();

    logger.debug(`[validadorIA] Validação de campo '${campo}': valor='${valor}' | resposta da IA='${resposta}'`);

    return resposta === 'sim';
  } catch (error) {
    logger.warn('[validadorIA] ⚠️ Erro na validação com IA', { campo, valor, contexto, error });
    return false;
  }
}
