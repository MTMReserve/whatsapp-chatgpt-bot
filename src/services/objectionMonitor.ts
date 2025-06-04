// src/services/objectionMonitor.ts

import { createChatCompletion } from '../api/openai';
import { logger } from '../utils/logger';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Analisa o nível de objeção do cliente com base nas últimas mensagens.
 * Utiliza a IA da OpenAI para classificar como: "nenhuma", "moderada" ou "forte".
 *
 * @param historico - Array com até 5 mensagens anteriores do cliente (mais recentes primeiro)
 * @param executionId - ID opcional para rastreabilidade em logs
 * @returns 'nenhuma' | 'moderada' | 'forte'
 */
export async function analisarObjeçõesIA(
  historico: string[],
  executionId?: string
): Promise<'nenhuma' | 'moderada' | 'forte'> {
  const systemPrompt = `
Você é um analista de comportamento de clientes.  
Com base nas mensagens abaixo, determine o nível de objeção do cliente quanto à compra:  

Responda apenas com uma das opções:  
"nenhuma", "moderada" ou "forte".

Use a lógica:
- nenhuma: o cliente está interessado ou neutro
- moderada: expressa dúvidas, insegurança ou hesitação leve
- forte: rejeição explícita, descrença ou desinteresse direto
`.trim();

  const mensagens: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: historico.join('\n') }
  ];

  try {
    logger.debug(`[objectionMonitor] [${executionId}] Enviando mensagens para análise de objeção via IA`);

    const resposta = await createChatCompletion(mensagens);
    const nivel = resposta.choices[0]?.message?.content?.trim().toLowerCase();

    const validos = ['nenhuma', 'moderada', 'forte'];
    const nivelValidado = validos.includes(nivel || '') ? (nivel as 'nenhuma' | 'moderada' | 'forte') : 'moderada';

    logger.info(`[objectionMonitor] [${executionId}] ObjectionLevel=${nivelValidado} | Resposta bruta="${nivel}"`);

    return nivelValidado;
  } catch (erro: any) {
    logger.error(`[objectionMonitor] [${executionId}] Erro na análise de objeção via IA: ${erro.message}`);
    return 'moderada'; // fallback seguro
  }
}
