// src/services/StateService.ts

import { createChatCompletion } from '../api/openai';
import { logger } from '../utils/logger';
import { gerarPromptIA } from './PromptService';
import type { EtapaFunil } from './metaPorEtapa';
import type { ProdutoID } from '../produto/produtoMap';

/**
 * Resultado esperado da IA com decisão de estado e resposta.
 */
export interface DecisaoEstadoResultado {
  nextState: EtapaFunil;
  reply: string;
  missingFields?: string[];
  auditoria: {
    prompt: string;
    mensagens: string[];
    tokens: number;
  };
}

/**
 * Usa a IA para decidir o próximo estado do funil, gerar a resposta
 * e indicar quais campos ainda estão faltando.
 */
export async function decidirEstadoEResponder(params: {
  phone: string;
  etapaAtual: EtapaFunil;
  mensagemCliente: string;
  produtoId: ProdutoID;
  camposAusentes?: string[];
}): Promise<DecisaoEstadoResultado> {
  const { phone, etapaAtual, mensagemCliente, produtoId, camposAusentes = [] } = params;

  const systemPrompt = await gerarPromptIA({
    phone,
    etapa: etapaAtual,
    mensagemCliente,
    produtoId,
    camposAusentes
  });

  const userPrompt = `
🧠 INSTRUÇÕES:

Abaixo está a mensagem do cliente. Com base nela, você deve:

1. Gerar uma resposta coerente, empática e estratégica (campo "reply")
2. Indicar o próximo estado do funil (campo "nextState")
3. Listar quais campos ainda estão ausentes (campo "missingFields")

Retorne SOMENTE JSON no formato abaixo:

{
  "reply": "...",
  "nextState": "...",
  "missingFields": ["campo1", "campo2"]
}

🗨️ Mensagem do cliente:
"${mensagemCliente}"
`.trim();

  logger.debug(`[StateService] Enviando prompt IA para decisão de estado:\n${userPrompt}`);

  const resposta = await createChatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    { temperature: 0.6 }
  );

  const content = resposta.choices[0]?.message?.content?.trim() || '{}';
  const tokens = resposta.usage?.total_tokens || 0;

  try {
    const parsed = JSON.parse(content);
    logger.debug(`[StateService] Resposta IA (parsed): ${JSON.stringify(parsed)}`);

    const resultado: DecisaoEstadoResultado = {
      ...parsed,
      auditoria: {
        prompt: systemPrompt,
        mensagens: [userPrompt],
        tokens
      }
    };

    return resultado;
  } catch (e) {
    logger.error('[StateService] Erro ao interpretar resposta da IA', { raw: content, error: e });
    throw new Error('Resposta da IA inválida ou mal formatada.');
  }
}
