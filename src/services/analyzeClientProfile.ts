// src/services/analyzeClientProfile.ts

import perfilClientePrompt from '../prompts/00-perfil';
import { openai } from '../api/openai';
import { botPersona } from '../persona/botPersona';
import { getConversationByPhone, hasAnalyzedProfile, markProfileAsAnalyzed } from './interactionMongoService';
import { logger } from '../utils/logger';
import { PerfilCliente } from '../models/Profile';

export async function analyzeClientProfileIfNeeded(phone: string): Promise<void> {
  try {
    const alreadyAnalyzed = await hasAnalyzedProfile(phone);
    if (alreadyAnalyzed) {
      logger.debug(`[perfil] 🔁 Perfil já analisado para ${phone}`);
      return;
    }

    const conversation = await getConversationByPhone(phone);
    if (!conversation || !Array.isArray(conversation)) return;

    const userMessages = conversation
      .filter((msg: any) => !msg.messageOut) // apenas mensagens do cliente (entrada)
      .map((msg: any) => msg.messageIn);

    if (userMessages.length < 4) {
      logger.debug(`[perfil] 🕐 Aguardando mais mensagens do cliente (${userMessages.length}/4)...`);
      return;
    }

    const context = userMessages.slice(0, 4).map((msg: string, i: number) => `${i + 1}. ${msg}`).join('\n');

    const fullPrompt = `
${perfilClientePrompt.trim()}

Com base nas mensagens abaixo, analise o estilo do cliente e retorne uma resposta em JSON no seguinte formato:

{
  "formalidade": "formal" | "informal",
  "emojis": true | false,
  "fala": "fala pouco" | "fala muito",
  "detalhamento": "direto" | "detalhista",
  "linguagemTecnica": "técnica" | "leiga" | "mista",
  "urgencia": "apressado" | "paciente",
  "temperamento": "colérico" | "fleumático" | "melancólico" | "sanguíneo"
}

Mensagens:
${context}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const raw = completion.choices[0].message?.content ?? '';
    logger.info(`[perfil] 🧠 JSON de perfil retornado:\n${raw}`);

    const perfil: PerfilCliente = JSON.parse(raw);

    // Aplica ao botPersona
    botPersona.estiloDeFala.formalidade = perfil.formalidade;
    botPersona.estiloDeFala.emojis = perfil.emojis;
    botPersona.estiloDeFala.frasesCurtas = perfil.fala === 'fala pouco';
    botPersona.estiloDeFala.detalhamento = perfil.detalhamento;
    botPersona.estiloDeFala.temperamento = perfil.temperamento;

    // Marca como analisado e salva o perfil completo
    await markProfileAsAnalyzed(phone, perfil);

  } catch (err) {
    logger.error('[perfil] ❌ Erro ao analisar perfil do cliente', { err });
  }
}
