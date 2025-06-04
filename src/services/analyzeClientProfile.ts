// src/services/analyzeClientProfile.ts

import perfilClientePrompt from '../prompts/00-perfil';
import { openai } from '../api/openai';
import { botPersona } from '../persona/botPersona';
import {
  getConversationByPhone,
  hasAnalyzedProfile,
  markProfileAsAnalyzed,
} from './interactionMongoService';
import { logger } from '../utils/logger';
import { PerfilCliente } from '../models/Profile';
import { z } from 'zod';

// 1) Definição do esquema de validação do JSON retornado pela IA
const PerfilSchema = z.object({
  formalidade: z.enum(['formal', 'informal']),
  emojis: z.boolean(),
  fala: z.enum(['fala pouco', 'fala muito']),
  detalhamento: z.enum(['direto', 'detalhista']),
  linguagemTecnica: z.enum(['técnica', 'leiga', 'mista']),
  urgencia: z.enum(['apressado', 'paciente']),
  temperamento: z.enum(['colérico', 'fleumático', 'melancólico', 'sanguíneo']),
});

// 2) Função auxiliar para construir o prompt completo
function buildProfilePrompt(messages: string[]): string {
  const context = messages
    .slice(0, 4)
    .map((msg: string, i: number) => `${i + 1}. ${msg}`)
    .join('\n');

  return `
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
}

export async function analyzeClientProfileIfNeeded(phone: string): Promise<void> {
  try {
    // Verifica se já existe perfil analisado para este telefone
    const alreadyAnalyzed = await hasAnalyzedProfile(phone);
    if (alreadyAnalyzed) {
      logger.debug(`[perfil] 🔁 Perfil já analisado para ${phone}`);
      return;
    }

    // Busca o histórico de conversas no Mongo
    const conversation = await getConversationByPhone(phone);
    if (!conversation) {
      logger.warn(`[perfil] ⚠️ Nenhuma conversa encontrada para ${phone}`);
      return;
    }
    if (!Array.isArray(conversation)) {
      logger.warn(
        `[perfil] ⚠️ Formato inesperado de 'conversation' para ${phone}, aguardando formato de array.`
      );
      return;
    }

    // Extrai apenas mensagens do cliente (entrada)
    const userMessages = conversation
      .filter((msg: any) => !msg.messageOut)
      .map((msg: any) => msg.messageIn);

    // Aguarda 4 mensagens antes de analisar
    if (userMessages.length < 4) {
      logger.debug(
        `[perfil] 🕐 Aguardando mais mensagens do cliente (${userMessages.length}/4)...`
      );
      return;
    }

    // Monta o prompt usando as 4 primeiras mensagens
    const fullPrompt = buildProfilePrompt(userMessages);

    // Chama a OpenAI usando GPT-4 (fixo)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const raw = completion.choices[0].message?.content ?? '';
    logger.info(`[perfil] 🧠 Resposta bruta da IA recebida (JSON esperado).`);

    // Tenta fazer parse do JSON retornado e validar conforme esquema
    let perfil: PerfilCliente;
    try {
      const parsed = JSON.parse(raw);
      perfil = PerfilSchema.parse(parsed);
    } catch (e) {
      logger.error(
        '[perfil] ❌ Falha ao converter/validar JSON de perfil:',
        { raw, error: e }
      );
      return;
    }

    // Atualiza o botPersona com os valores extraídos
    botPersona.estiloDeFala.formalidade = perfil.formalidade;
    botPersona.estiloDeFala.emojis = perfil.emojis;
    botPersona.estiloDeFala.frasesCurtas = perfil.fala === 'fala pouco';
    botPersona.estiloDeFala.detalhamento = perfil.detalhamento;
    botPersona.estiloDeFala.temperamento = perfil.temperamento;

    // Marca como analisado e salva o perfil no banco
    await markProfileAsAnalyzed(phone, perfil);
    logger.info(`[perfil] ✅ Perfil analisado e salvo para ${phone}`);
  } catch (err) {
    logger.error('[perfil] ❌ Erro ao analisar perfil do cliente', { err });
  }
}
