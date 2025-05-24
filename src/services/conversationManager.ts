import { ClientRepository } from './clientRepository';   
import * as dataExtractor from './dataExtractor';
import { audioService } from './audioService';
import { openai } from '../api/openai';
import { env } from '../config/env';
import { getNextStateByAI } from './aiStateDecider';
import { detectIntentWithFallback } from './intentFallback';
import { botPersona } from '../persona/botPersona';
import { getProdutoInfo, type ProdutoID } from '../produto/produtoMap';
import { logger } from '../utils/logger';
import { saveInteraction } from '../repositories/interactionsRepository';
import { saveInteractionLog } from '../repositories/mongo/interactionLog.mongo';
import { analyzeClientProfileIfNeeded } from './analyzeClientProfile';
import { definirTemperaturaDinamica } from '../utils/temperatureDecider';
import { getAnalyzedProfile } from '../repositories/clientProfileRepository'; // ✅ NOVO

import abordagemPrompt from '../prompts/01-abordagem';
import levantamentoPrompt from '../prompts/02-levantamento';
import propostaPrompt from '../prompts/03-proposta';
import objecoesPrompt from '../prompts/04-objecoes';
import negociacaoPrompt from '../prompts/05-negociacao';
import fechamentoPrompt from '../prompts/06-fechamento';
import posVendaPrompt from '../prompts/07-posvenda';
import reativacaoPrompt from '../prompts/08-reativacao';
import encerramentoPrompt from '../prompts/09-encerramento';

import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const promptByState: Record<string, string> = {
  abordagem: abordagemPrompt,
  levantamento: levantamentoPrompt,
  proposta: propostaPrompt,
  objecoes: objecoesPrompt,
  negociacao: negociacaoPrompt,
  fechamento: fechamentoPrompt,
  pos_venda: posVendaPrompt,
  reativacao: reativacaoPrompt,
  encerramento: encerramentoPrompt,
};

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

  const { nextState } = await getNextStateByAI({ currentState, userMessage: messageText });
  logger.info(`[handleMessage] [${executionId}] Estado sugerido pela IA: ${nextState}`);

  if (nextState !== currentState) {
    await ClientRepository.updateState(phone, nextState);
    logger.info(`[handleMessage] [${executionId}] Estado atualizado: ${currentState} → ${nextState}`);
  }

  await analyzeClientProfileIfNeeded(phone);

  try {
    switch (nextState) {
      case 'abordagem': {
        let nome = dataExtractor.extractName(messageText);
        if (!nome) nome = await dataExtractor.extractNameSmart(messageText);
        logger.debug(`[handleMessage] [${executionId}] Nome extraído: ${nome}`);
        if (nome) await ClientRepository.updateField(phone, 'name', nome);
        if (!client.has_greeted) {
          await ClientRepository.updateField(phone, 'has_greeted', true);
        }
        break;
      }
      case 'levantamento': {
        const needs = await dataExtractor.extractNeeds(messageText);
        logger.debug(`[handleMessage] [${executionId}] Necessidade extraída: ${needs}`);
        if (needs) await ClientRepository.updateField(phone, 'needs', needs);
        break;
      }
      case 'proposta': {
        const budget = await dataExtractor.extractBudget(messageText);
        logger.debug(`[handleMessage] [${executionId}] Orçamento extraído: ${budget}`);
        if (budget !== null) await ClientRepository.updateField(phone, 'budget', budget);
        break;
      }
      case 'negociacao': {
        const negotiated = dataExtractor.extractNegotiatedPrice(messageText);
        logger.debug(`[handleMessage] [${executionId}] Preço negociado extraído: ${negotiated}`);
        if (negotiated !== null) await ClientRepository.updateField(phone, 'negotiated_price', negotiated);
        break;
      }
      case 'fechamento': {
        const address = dataExtractor.extractAddress(messageText);
        if (address) await ClientRepository.updateField(phone, 'address', address);

        const paymentMethod = dataExtractor.extractPaymentMethod(messageText);
        if (paymentMethod) await ClientRepository.updateField(phone, 'payment_method', paymentMethod);
        break;
      }
      case 'pos_venda':
        await ClientRepository.updateField(phone, 'feedback', messageText);
        break;
      case 'reativacao':
        await ClientRepository.updateField(phone, 'reactivation_reason', messageText);
        break;
    }

    const productId = (process.env.PRODUTO_ID as ProdutoID) || 'produto1';
    const productInfo = getProdutoInfo(productId);

    const parts = [
      `Produto: ${productInfo.nome} - ${productInfo.descricao}`,
      `Benefícios:\n- ${productInfo.beneficios.join('\n- ')}`,
      `Preço: ${productInfo.preco}`,
      productInfo.promocao ? `Promoção: ${productInfo.promocao}` : '',
      productInfo.garantias ? `Garantia: ${productInfo.garantias}` : '',
      promptByState[nextState] ?? ''
    ].filter(Boolean);

    const systemPrompt = parts.join('\n\n');
    logger.debug(`[handleMessage] [${executionId}] Prompt gerado para IA:\n${systemPrompt}`);

    const chatMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messageText }
    ];

    // ✅ Perfil completo recuperado dinamicamente
    const perfilCliente = getAnalyzedProfile(phone);
    logger.debug(`[handleMessage] [${executionId}] Perfil do cliente para cálculo da temperatura:`, perfilCliente);

    const temperature = definirTemperaturaDinamica({
      etapa: nextState,
      perfil: perfilCliente
    });

    logger.debug(`[handleMessage] [${executionId}] Enviando requisição para OpenAI...`, {
      model: env.OPENAI_MODEL,
      temperature,
    });

    let botText: string | undefined;

    try {
      const completion = await openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        temperature,
        messages: chatMessages
      });

      botText = completion.choices?.[0]?.message?.content?.trim();
    } catch (err) {
      logger.error(`[handleMessage] [${executionId}] ❌ Erro ao chamar a OpenAI`, { error: err });
      throw err;
    }

    if (!botText || botText.length < 2) {
      logger.error(`[handleMessage] [${executionId}] ❌ Texto inválido ou vazio. Abortando resposta.`, {
        raw: botText
      });
      throw new Error('Texto da IA está vazio. Verifique o prompt ou entrada.');
    }

    logger.info(`[handleMessage] [${executionId}] ✅ Texto final gerado pela IA:`, { botText });

    let intent = 'indefinida';
    try {
      intent = await detectIntentWithFallback(messageText);
      logger.info(`[handleMessage] [${executionId}] 🎯 Intenção detectada: ${intent}`);
    } catch (err) {
      logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao detectar intenção, usando 'indefinida'`, { error: err });
    }

    try {
      await saveInteraction({
        clientId: client.id,
        messageIn: messageText,
        messageOut: botText,
        detectedIntent: intent,
        stateBefore: currentState,
        stateAfter: nextState,
      });

      await ClientRepository.updateLastInteraction(client.id);
    } catch (err) {
      logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao salvar interação no histórico`, { error: err });
    }

    try {
      const mongoPayload = {
        phone,
        clientId: client.id,
        messageIn: messageText,
        messageOut: botText,
        detectedIntent: intent,
        stateBefore: currentState,
        stateAfter: nextState,
        createdAt: new Date()
      };

      logger.debug(`[handleMessage] [${executionId}] Conteúdo do mongoPayload:`, mongoPayload);
      logger.debug(`[handleMessage] [${executionId}] Enviando para saveInteractionLog:`, {
        payload: mongoPayload
      });

      await saveInteractionLog(mongoPayload);
    } catch (err) {
      console.error(`[mongo][raw] ❌ ERRO ao salvar no MongoDB`, err);
      logger.warn(`[handleMessage] [${executionId}] ⚠️ Erro ao salvar no MongoDB`, { error: err });
    }

    if (options.isAudio) {
      logger.debug(`[handleMessage] [${executionId}] 🎧 Gerando áudio com ElevenLabs...`);
      const audioBuffer = await audioService.synthesizeSpeech(botText);
      return { text: botText, audioBuffer };
    }

    return { text: botText };
  } catch (err) {
    logger.error(`[handleMessage] [${executionId}] ❌ Erro geral ao processar mensagem do cliente`, { error: err });
    throw err;
  }
}
