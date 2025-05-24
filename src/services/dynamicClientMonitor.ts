// src/services/dynamicClientMonitor.ts

import { getConversationByPhone } from '../repositories/mongo/interactionLog.mongo';
import { botPersona } from '../persona/botPersona';
import { openai } from '../api/openai';
import { logger } from '../utils/logger';

/**
 * Analisa continuamente o comportamento do cliente com base nas últimas mensagens
 */
export async function monitorClientBehavior(phone: string): Promise<void> {
  logger.debug(`[perfil-dinamico] 🟡 Iniciando análise dinâmica para: ${phone}`);

  try {
    const conversation = await getConversationByPhone(phone);
    if (!conversation || !Array.isArray(conversation)) {
      logger.warn(`[perfil-dinamico] ⚠️ Nenhuma conversa encontrada no Mongo para ${phone}`);
      return;
    }

    const userMessages: string[] = conversation
      .filter((msg: any) => msg.from === 'user')
      .map((msg: any) => msg.messageIn || msg.text || '');

    logger.debug(`[perfil-dinamico] 🧮 Total de mensagens do cliente: ${userMessages.length}`);

    if (userMessages.length < 3) {
      logger.debug(`[perfil-dinamico] ⏳ Aguardando pelo menos 3 mensagens para análise`);
      return;
    }

    const ultimasMensagens = userMessages
      .slice(-3)
      .map((msg: string, i: number) => `${i + 1}. ${msg}`)
      .join('\n');

    logger.debug(`[perfil-dinamico] 📋 Últimas mensagens analisadas:\n${ultimasMensagens}`);

    const prompt = `
Você é um analista emocional de mensagens de texto.

Com base nas últimas mensagens, descreva:
1. Se o cliente está calmo, impaciente, direto ou irritado
2. Se a linguagem está seca, curta, com gírias ou formal
3. Se há mudança de temperatura emocional (mais seco, menos detalhista, etc)
4. Faça um breve resumo do que o bot deve ajustar para se adaptar melhor

Responda em no máximo 4 linhas.

Mensagens recentes:
${ultimasMensagens}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.6,
      messages: [{ role: 'user', content: prompt }],
    });

    const feedback = completion.choices?.[0]?.message?.content || '';
    logger.info(`[perfil-dinamico] 🧠 Feedback da IA:\n${feedback}`);

    // Análise e ajustes
    if (/impaciente|apressado/i.test(feedback)) {
      botPersona.estiloDeFala.frasesCurtas = true;
      botPersona.estiloDeFala.formalidade = 'direto';
      botPersona.alerta = 'Percebo que está com pressa. Posso ser mais direto?';

      logger.warn(`[perfil-dinamico] ⚠️ Comportamento detectado: apressado/impaciente`);
      logger.debug(`[perfil-dinamico] 🎯 Ajustes: frasesCurtas = true, formalidade = direto`);
    }

    if (/seco|monossilábico|irritado/i.test(feedback)) {
      botPersona.estiloDeFala.formalidade = 'objetivo';
      botPersona.alerta = 'Vou ser mais direto para não tomar seu tempo.';

      logger.warn(`[perfil-dinamico] ⚠️ Cliente parece seco ou irritado`);
      logger.debug(`[perfil-dinamico] 🎯 Ajustes: formalidade = objetivo`);
    }

    if (/voltou a detalhar|mais calmo|interessado/i.test(feedback)) {
      botPersona.estiloDeFala.formalidade = 'natural';
      botPersona.estiloDeFala.frasesCurtas = false;
      botPersona.alerta = 'Obrigado por compartilhar, posso continuar com mais detalhes.';

      logger.info(`[perfil-dinamico] ✅ Cliente demonstrou retomada de interesse`);
      logger.debug(`[perfil-dinamico] 🎯 Ajustes: formalidade = natural, frasesCurtas = false`);
    }

  } catch (err) {
    logger.error('[perfil-dinamico] ❌ Erro ao monitorar comportamento do cliente', { err });
  }
}
