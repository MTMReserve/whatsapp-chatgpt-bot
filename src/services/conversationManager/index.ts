// ===============================
// File: src/services/conversationManager/index.ts
// ===============================

import { logger } from '../../utils/logger';
import { extractAll } from '../dataExtractor';
import { ClientRepository } from '../clientRepository';
import { decidirEstadoEResponder } from '../StateService';
import { saveInteraction } from '../../repositories/interactionsRepository';
import { saveInteractionLog } from '../../repositories/mongo/interactionLog.mongo';
import { registrarAuditoriaIA } from '../registrarAuditoriaIA';
import { definirTemperaturaDinamica } from '../../utils/temperatureDecider';
import { checklistFechamento } from '../checklistFechamento';
import { verificarMudancaEmCampoSensivel } from '../verificadorContradicoes';
import { formatarRespostaIA } from '../../utils/formatarRespostaIA';
import { verificadorPropostaNegociacao } from '../verificadorPropostaNegociacao';
import { saveNegociacaoLog } from '../../repositories/mongo/logsEstrategia.mongo';
import { EtapaFunil } from '../metaPorEtapa';
import type { ProdutoID } from '../../produto/produtoMap';
import { getAnalyzedProfileFromMongo } from '../../repositories/clientProfileRepository'; // ✅ ALTERADO
import { analyzeClientProfileIfNeeded } from '../analyzeClientProfile';
import { audioService } from '../audioService';
import { clientePrefereAudio } from '../audioPreferenceAnalyzer';
import type { Client } from '../../types/Client';
import { detectIntentWithFallback } from '../intentFallback';
import { validarTodosCamposPorEtapa } from '../validadorMultiplos'; // ✅ NOVO IMPORT
import { randomUUID } from 'crypto'; // ✅ Para rastreabilidade
import { mapearClienteParaFieldValidation } from '../../utils/fieldMapper'; // ✅ NOVO IMPORT

export async function handleMessage(
  phone: string,
  userMessage: string,
  produtoId: ProdutoID
): Promise<{ text: string; audioBuffer?: Buffer }> {
  logger.info(`[handleMessage] Mensagem recebida de ${phone}: ${userMessage}`);

  const clienteAtual = await ClientRepository.findOrCreate(phone);
  const etapaAtual = clienteAtual.current_state as EtapaFunil;
  const perfil = await getAnalyzedProfileFromMongo(phone); // ✅ CORRIGIDO
  const temperatura = definirTemperaturaDinamica({ etapa: etapaAtual, perfil });
  const executionId = randomUUID(); // ✅ ID de rastreabilidade para logs

  const { fields } = await extractAll(userMessage, phone, etapaAtual);
  const camposSensiveis: (keyof typeof clienteAtual)[] = ['name', 'budget', 'address', 'payment_method', 'schedule_time'];

  for (const campo of camposSensiveis) {
    const novoValor = fields[campo]?.value as string | null;
    const valorAnterior = clienteAtual[campo] != null ? String(clienteAtual[campo]) : null;
    const alerta = verificarMudancaEmCampoSensivel(campo, valorAnterior, novoValor);
    if (alerta) logger.warn(`[handleMessage] Mudança detectada em campo sensível: ${alerta}`);
  }

  let {
    reply,
    nextState,
    missingFields,
    auditoria
  } = await decidirEstadoEResponder({
    phone,
    etapaAtual,
    mensagemCliente: userMessage,
    produtoId,
    camposAusentes: Object.keys(fields).filter((f) => !fields[f].valid)
  });

  if (!nextState) {
    logger.warn('[handleMessage] ⚠️ IA não retornou próximo estado. Acionando fallback de intenção...');
    const fallback = await detectIntentWithFallback(userMessage);
    nextState = fallback as EtapaFunil;
  }

  // ✅ Validação múltipla dos campos exigidos pela etapa
  const validacoes = await validarTodosCamposPorEtapa({
    phone,
    texto: userMessage,
    etapa: etapaAtual,
    clientId: clienteAtual.id,
    executionId
  });
  logger.info(`[handleMessage] 🧪 Resultado da validação múltipla:`, validacoes);

  const replyFinal = formatarRespostaIA(reply);
  logger.info(`[handleMessage] Resposta gerada: ${replyFinal}`);
  logger.info(`[handleMessage] Próximo estado: ${nextState}`);

  await saveInteraction({
    clientId: clienteAtual.id,
    messageIn: userMessage,
    messageOut: replyFinal,
    detectedIntent: nextState,
    stateBefore: etapaAtual,
    stateAfter: nextState
  });

  await saveInteractionLog({
    phone,
    clientId: clienteAtual.id,
    messageIn: userMessage,
    messageOut: replyFinal,
    detectedIntent: nextState,
    stateBefore: etapaAtual,
    stateAfter: nextState
  });

  await registrarAuditoriaIA({
    prompt: auditoria.prompt,
    mensagens: auditoria.mensagens,
    temperatura,
    tokens: auditoria.tokens,
    etapa: etapaAtual,
    phone,
    produtoId
  });

  await ClientRepository.updateState(phone, nextState);
  await ClientRepository.updateLastInteraction(clienteAtual.id);

  if (nextState === 'negociacao') {
    const resultado = await verificadorPropostaNegociacao({
      textoGerado: replyFinal,
      etapaAtual,
      temperaturaAnterior: temperatura,
      phone
    });

    if (resultado.deveRefazerComMaisTemperatura) {
      logger.warn(`[handleMessage] 🚨 Resposta insuficiente, IA será chamada novamente com temperatura ${resultado.novaTemperatura}`);
      // (opcional) lógica de reenvio pode ser implementada aqui
    }
  }

  if (nextState === 'fechamento') {
    const camposValidados = mapearClienteParaFieldValidation(clienteAtual); // ✅ CORREÇÃO APLICADA
    const checklist = checklistFechamento(camposValidados);
    if (!checklist.aprovado) {
      logger.warn(`[handleMessage] Checklist de fechamento NÃO aprovado. Motivo: ${checklist.faltando.join(', ')}`);
    }
  }

  await analyzeClientProfileIfNeeded(phone);

  const response: { text: string; audioBuffer?: Buffer } = {
    text: replyFinal
  };

  if (clientePrefereAudio(phone)) {
    response.audioBuffer = await audioService.synthesizeSpeech(replyFinal);
  }

  return response;
}
