// ===============================
// File: src/services/conversationManager.ts
// ===============================

import { ClientRepository } from './clientRepository';
import * as dataExtractor from './dataExtractor';
import { audioService } from './audioService';
import { env } from '../config/env';
import { detectIntentWithFallback } from './intentFallback';
import { getProdutoInfo, type ProdutoID } from '../produto/produtoMap';
import { logger } from '../utils/logger';
import { saveInteraction } from '../repositories/interactionsRepository';
import { saveInteractionLog } from '../repositories/mongo/interactionLog.mongo';
import { analyzeClientProfileIfNeeded } from './analyzeClientProfile';
import { definirTemperaturaDinamica } from '../utils/temperatureDecider';
import { getAnalyzedProfile } from '../repositories/clientProfileRepository';
import { validarTodosCamposPorEtapa } from './validadorMultiplos';
import { EtapaFunil } from './metaPorEtapa';
import { formatarRespostaIA } from '../utils/formatarRespostaIA';
import { verificarContradicoes } from './verificadorContradicoes';
import { checklistFechamento } from './checklistFechamento';
import { decidirModoLevantamento } from './levantamentoAdaptativo';
import { verificadorPropostaNegociacao } from './verificadorPropostaNegociacao';
import { saveNegociacaoLog } from '../repositories/mongo/logsEstrategia.mongo';
import { registrarAuditoriaIA } from './registrarAuditoriaIA';
import { verificarMudancaEmCampoSensivel } from './verificadorContradicoes';

// ✅ NOVOS IMPORTS PARA ARQUITETURA UNIFICADA
import { decidirEstadoEResponder } from './StateService';

interface HandleMessageOptions {
  isAudio: boolean;
}

interface BotResponse {
  text: string;
  audioBuffer?: Buffer;
}

export async function handleMessage(
  phone: string,
  messageText: string,
  options: HandleMessageOptions
): Promise<BotResponse> {
  const executionId = `exec-${Date.now()}`;
  logger.info(`[handleMessage] ▶️ Nova execução iniciada (${executionId}) para ${phone}`);
  logger.debug(`[handleMessage] [${executionId}] 📲 Iniciando atendimento: phone=${phone}, texto="${messageText}", isAudio=${options.isAudio}`);

  const client = await ClientRepository.findOrCreate(phone);
  const currentState = client.current_state || 'abordagem';
  logger.info(`[handleMessage] [${executionId}] Estado atual do cliente: ${currentState}`);

  const productId = (client.produto_id ?? 'produto1') as ProdutoID;

  const resultadoIA = await decidirEstadoEResponder({
    phone,
    etapaAtual: currentState,
    mensagemCliente: messageText,
    produtoId: productId
  });

  const { nextState, reply: respostaGerada, missingFields } = resultadoIA;

  logger.info(`[handleMessage] [${executionId}] Estado sugerido pela IA: ${nextState}`);

  if (nextState !== currentState) {
    await ClientRepository.updateState(phone, nextState);
    logger.info(`[handleMessage] [${executionId}] Estado atualizado: ${currentState} → ${nextState}`);
  } else {
    const novasTentativas = (client.retries ?? 0) + 1;
    await ClientRepository.updateRetries(phone, novasTentativas);
    logger.debug(`[handleMessage] [${executionId}] Repetição detectada. Retries incrementado para ${novasTentativas}`);
  }

  logger.debug(`[handleMessage] [${executionId}] Verificando campos sensíveis extraídos...`);
  const dadosExtraidos = await dataExtractor.extractAllFields(phone, messageText, currentState) || {};
  const camposSensiveis: (keyof typeof dadosExtraidos)[] = ['name', 'budget', 'address', 'payment_method', 'schedule_time'];
  for (const campo of camposSensiveis) {
    const novoValor = dadosExtraidos[campo];
    const valorAnterior = (client as any)[campo];
    const alerta = verificarMudancaEmCampoSensivel(campo as string, novoValor, valorAnterior);
    if (alerta) {
      logger.warn(`[conversationManager] [${executionId}] Detecção de mudança no campo sensível "${campo}" — pendente confirmação do cliente.`);
      return { text: alerta };
    }
  }

  await analyzeClientProfileIfNeeded(phone);

  if (nextState === 'fechamento') {
    logger.debug(`[handleMessage] [${executionId}] Validando checklist de fechamento...`);
    const checklist = await checklistFechamento(client);
    if (!checklist.aprovado) {
      logger.warn(
        `[conversationManager] [${executionId}] ❌ Fechamento bloqueado — campos ausentes ou contraditórios: ${[...checklist.faltando, ...checklist.contradicoes].join(', ')}`
      );
      const mensagemErro = [
        '🚫 Ainda não posso encerrar seu atendimento.',
        checklist.faltando.length > 0 ? `Faltam os seguintes dados: ${checklist.faltando.join(', ')}.` : '',
        checklist.contradicoes.length > 0 ? `Há inconsistências: ${checklist.contradicoes.join(' | ')}` : '',
        'Vamos resolver isso antes de seguir para o fechamento. 😉',
      ]
        .filter(Boolean)
        .join('\n');
      return { text: mensagemErro };
    }
  }

  const etapasValidas: EtapaFunil[] = [
    'abordagem', 'levantamento', 'proposta', 'objecoes',
    'negociacao', 'fechamento', 'pos_venda',
    'reativacao', 'encerramento'
  ];

  if (etapasValidas.includes(nextState as EtapaFunil)) {
    await validarTodosCamposPorEtapa({
      phone,
      texto: messageText,
      etapa: nextState as EtapaFunil,
      clientId: client.id,
      executionId
    });
  }

  const intent = await detectIntentWithFallback(messageText).catch((err) => {
    logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao detectar intenção`, { error: err });
    return 'indefinida';
  });

  const temperatura = definirTemperaturaDinamica({
    etapa: nextState,
    perfil: getAnalyzedProfile(phone)
  });

  let botText = respostaGerada;

  // ✅ Auditoria (DEV-005)
  await registrarAuditoriaIA({
    prompt: '[Prompt gerado dinamicamente - ver logs anteriores]',
    mensagens: [`user: ${messageText}`, `ia: ${respostaGerada}`],
    temperatura,
    tokens: 0,
    etapa: nextState,
    phone,
    produtoId: productId,
  });

  if (nextState === 'negociacao') {
    const resultadoValidacao = await verificadorPropostaNegociacao({
      textoGerado: botText,
      etapaAtual: nextState,
      temperaturaAnterior: temperatura,
      phone
    });

    if (resultadoValidacao.deveRefazerComMaisTemperatura) {
      logger.warn(`[handleMessage] [${executionId}] ♻️ Regenerando resposta com temperatura ${resultadoValidacao.novaTemperatura}`);
      botText = resultadoValidacao.novaResposta;
      await saveNegociacaoLog({
        phone,
        etapa: 'negociacao',
        resposta_original: respostaGerada,
        causas_rejeicao: ['resposta_curta_sem_argumento'],
        nova_tentativa: botText,
        createdAt: new Date()
      });
    }
  }

  if (!botText || botText.length < 2) {
    throw new Error(`[handleMessage] [${executionId}] ❌ Texto inválido ou vazio da IA`);
  }

  const respostaFinal = formatarRespostaIA(botText);
  logger.info(`[handleMessage] [${executionId}] ✅ Texto final pós-processado: ${respostaFinal}`);

  try {
    await saveInteraction({
      clientId: client.id,
      messageIn: messageText,
      messageOut: respostaFinal,
      detectedIntent: intent,
      stateBefore: currentState,
      stateAfter: nextState
    });
    await ClientRepository.updateLastInteraction(client.id);
  } catch (err) {
    logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao salvar interação no MySQL`, { error: err });
  }

  try {
    await saveInteractionLog({
      phone,
      clientId: client.id,
      messageIn: messageText,
      messageOut: respostaFinal,
      detectedIntent: intent,
      stateBefore: currentState,
      stateAfter: nextState,
      createdAt: new Date()
    });
  } catch (err) {
    logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao salvar no MongoDB`, { error: err });
  }

  if (options.isAudio) {
    const audioBuffer = await audioService.synthesizeSpeech(respostaFinal);
    return { text: respostaFinal, audioBuffer };
  }

  return { text: respostaFinal };
}
