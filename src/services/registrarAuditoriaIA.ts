// ===============================
// File: src/services/registrarAuditoriaIA.ts
// ===============================

import { saveAuditLog } from '../repositories/mongo/auditLog.mongo';
import { logger } from '../utils/logger';

interface RegistrarAuditoriaInput {
  prompt: string;
  mensagens: string[];
  temperatura: number;
  tokens: number;
  etapa: string;
  phone: string;
  produtoId?: string | null;
}

export async function registrarAuditoriaIA({
  prompt,
  mensagens,
  temperatura,
  tokens,
  etapa,
  phone,
  produtoId = null
}: RegistrarAuditoriaInput): Promise<void> {
  try {
    const log = {
      clientId: '', // Pode ser preenchido no futuro, se necessário
      phone,
      etapa,
      mensagem: mensagens.join('\n\n'),
      respostaGerada: '', // A resposta pode ser registrada no futuro
      timestamp: new Date(),
      produtoId,
      stateBefore: '', // Não aplicável nesta auditoria, mas exigido pelo schema
      stateAfter: '',
      detectedIntent: '',
      erro: undefined
    };

    await saveAuditLog({
      ...log,
      mensagem: `[PROMPT]: ${prompt}\n\n[MENSAGENS]: ${mensagens.join('\n\n')}`,
      respostaGerada: `Temperatura: ${temperatura}, Tokens: ${tokens}`
    });

    logger.info(`[registrarAuditoriaIA] ✅ Auditoria registrada para etapa ${etapa}, phone=${phone}`);
  } catch (error) {
    logger.error(`[registrarAuditoriaIA] ❌ Falha ao registrar auditoria`, {
      error,
      phone,
      etapa,
      produtoId
    });
  }
}
