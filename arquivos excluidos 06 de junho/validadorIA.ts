// src/services/validadorIA.ts

import { openai } from '../api/openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Lista de palavras que invalidam valores comuns como "oi", "cliente", etc.
 * Pode ser expandida para outros campos no futuro.
 */
const blacklist: Record<string, string[]> = {
  name: ['oi', 'cliente', 'atendente', 'teste', 'bot', 'você', 'nada', 'ninguém']
};

function contemTermoProibido(campo: string, valor: string): boolean {
  const proibidos = blacklist[campo];
  if (!proibidos) return false;

  const normalizado = valor.toLowerCase().trim();
  return proibidos.some(p => normalizado.includes(p));
}

/**
 * Valida se um valor extraído é coerente com o campo esperado.
 * A IA deve responder apenas "sim" ou "não".
 */
export async function validarCampoIA(
  campo: string,
  valor: any,
  contexto: string,
  lang: 'pt' | 'en' = 'pt'
): Promise<boolean> {
  const startTime = Date.now();

  if (typeof valor !== 'string' || valor.length < 2) {
    logger.warn(`[validadorIA] ❌ Valor muito curto para campo '${campo}':`, valor);
    return false;
  }

  if (contemTermoProibido(campo, valor)) {
    logger.warn(`[validadorIA] ❌ Valor rejeitado por blacklist local para campo '${campo}':`, valor);
    return false;
  }

  const prompt = {
    pt: `Você é um assistente de validação. O campo analisado é: "{{campo}}".
O valor extraído é: "{{valor}}".
Contexto da conversa: "{{contexto}}".
Esse valor é válido para esse campo? Responda apenas com "sim" ou "não".`,

    en: `You are a validation assistant. The field under analysis is: "{{campo}}".
The extracted value is: "{{valor}}".
Conversation context: "{{contexto}}".
Is this value valid for this field? Reply only with "yes" or "no".`
  };

  const mensagemUsuario = prompt[lang]
    .replace('{{campo}}', campo)
    .replace('{{valor}}', valor)
    .replace('{{contexto}}', contexto);

  let systemPrompt = 'Você é um validador de dados para um bot de vendas. Seja objetivo.';

  if (campo === 'negotiated_price' || campo === 'desconto') {
    systemPrompt += `
- Se o valor extraído indicar uma negociação plausível de preço (ex: valores próximos ao original com justificativa), aceite.
- Frases como "consigo fazer por", "à vista", "tem desconto", "posso pagar X", são indicativas de negociação real.
- Seja flexível com variações de preço dentro do contexto. Responda apenas com "sim" ou "não".`.trim();
  }

  logger.debug(`[validadorIA] ⏳ Iniciando validação com IA`);
  logger.debug(`[validadorIA] ▶️ Campo: "${campo}"`);
  logger.debug(`[validadorIA] ▶️ Valor: "${valor}"`);
  logger.debug(`[validadorIA] ▶️ Contexto: "${contexto}"`);
  logger.debug(`[validadorIA] ▶️ Idioma: "${lang}"`);

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mensagemUsuario }
      ]
    });

    const elapsed = Date.now() - startTime;
    const resposta = response.choices?.[0]?.message?.content?.toLowerCase().trim();

    logger.debug(`[validadorIA] 🧠 Resposta bruta da IA: "${resposta}"`);
    logger.debug(`[validadorIA] ⏱️ Tempo de resposta: ${elapsed}ms`);

    if (!resposta || typeof resposta !== 'string') {
      logger.warn(`[validadorIA] ⚠️ Resposta vazia ou inválida recebida da IA`, {
        campo,
        valor,
        contexto,
        tempo_ms: elapsed
      });
      return false;
    }

    const validado = lang === 'pt'
      ? /^sim\b/.test(resposta)
      : /^yes\b/.test(resposta);

    logger.info(`[validadorIA] ✅ Resultado da validação`, {
      campo,
      valor,
      contexto,
      resposta,
      tempo_ms: elapsed,
      validado
    });

    return validado;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error('[validadorIA] ❌ Erro na validação com IA', {
      campo,
      valor,
      contexto,
      tempo_ms: elapsed,
      error: (error as Error)?.message || error
    });

    return false;
  }
}
