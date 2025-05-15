import { ClientRepository } from './clientRepository';
import * as dataExtractor from './dataExtractor';
import { audioService } from './audioService';
import { openai } from '../api/openai';
import { env } from '../config/env';
import { funnelMachine } from '../stateMachine';
import { createActor } from 'xstate';
import { detectIntentWithFallback } from './intentFallback';
import { intentMap, detectIntent } from './intentMap';
import type { BotState } from './intentMap';

import { botPersona } from '../persona/botPersona';
import { getProdutoInfo, type ProdutoID } from '../produto/produtoMap';

import abordagemPrompt from '../prompts/01-abordagem';
import levantamentoPrompt from '../prompts/02-levantamento';
import propostaPrompt from '../prompts/03-proposta';
import objecoesPrompt from '../prompts/04-objecoes';
import negociacaoPrompt from '../prompts/05-negociacao';
import fechamentoPrompt from '../prompts/06-fechamento';
import posVendaPrompt from '../prompts/07-posVenda';
import reativacaoPrompt from '../prompts/08-reativacao';
import encerramentoPrompt from '../prompts/09-encerramento';

import { logger } from '../utils/logger';

const promptByState: Record<BotState, string> = {
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
  logger.debug(`[handleMessage] Start phone=${phone} text="${messageText}" audio=${options.isAudio}`);

  const client = await ClientRepository.findOrCreate(phone);
  logger.debug(`[handleMessage] Client fetched/created phone=${phone} state=${client.current_state} retries=${client.retries}`);

  const validStates: BotState[] = Object.keys(promptByState) as BotState[];
  const currentState: BotState = validStates.includes(client.current_state as BotState)
    ? (client.current_state as BotState)
    : 'abordagem';
  logger.debug(`[handleMessage] Current state=${currentState}`);

  const actor = createActor(funnelMachine, {
    input: {
      value: currentState,
      context: { retries: client.retries || 0 }
    }
  });
  actor.start();
  logger.debug(`[handleMessage] XState actor started`);

  let intent = detectIntent(messageText);
  if (!intent) {
    logger.debug(`[handleMessage] Intent not found via map, using fallback IA`);
    intent = await detectIntentWithFallback(messageText);
  }
  logger.debug(`[handleMessage] Detected intent=${intent}`);

  actor.send({ type: 'INTENT', intent });
  const snapshot = actor.getSnapshot();
  const nextState = snapshot.value as BotState;
  const updatedRetries = snapshot.context.retries as number;
  logger.debug(`[handleMessage] Transition result nextState=${nextState} updatedRetries=${updatedRetries}`);

  if (nextState !== currentState) {
    await ClientRepository.updateState(phone, nextState);
    logger.info(`[handleMessage] State updated phone=${phone} newState=${nextState}`);
  }
  await ClientRepository.updateRetries(phone, updatedRetries);
  logger.info(`[handleMessage] Retries updated phone=${phone} retries=${updatedRetries}`);

  switch (nextState) {
    case 'abordagem':
      if (!client.name || client.name === 'Cliente') {
        try {
          let nome = dataExtractor.extractName(messageText);
          if (!nome) nome = await dataExtractor.extractNameSmart(messageText);
          if (nome) {
            await ClientRepository.updateField(phone, 'name', nome);
            logger.info(`[handleMessage] Name updated phone=${phone} name=${nome}`);
          }
        } catch (err) {
          logger.warn(`[handleMessage] Name extraction failed phone=${phone}`, { error: err });
        }
      }
      break;
    case 'levantamento':
      await ClientRepository.updateField(phone, 'needs', messageText);
      logger.info(`[handleMessage] Needs updated phone=${phone} needs="${messageText}"`);
      break;
    case 'proposta': {
      const budget = dataExtractor.extractBudget(messageText);
      await ClientRepository.updateField(phone, 'budget', budget);
      logger.info(`[handleMessage] Budget updated phone=${phone} budget=${budget}`);
      break;
    }
    case 'negociacao': {
      const negotiated = dataExtractor.extractNegotiatedPrice(messageText);
      if (negotiated !== null) {
        await ClientRepository.updateField(phone, 'negotiated_price', negotiated);
        logger.info(`[handleMessage] Negotiated price updated phone=${phone} negotiated=${negotiated}`);
      }
      break;
    }
    case 'fechamento': {
      const address = dataExtractor.extractAddress(messageText);
      if (address) {
        await ClientRepository.updateField(phone, 'address', address);
        logger.info(`[handleMessage] Address updated phone=${phone} address="${address}"`);
      }
      const paymentMethod = dataExtractor.extractPaymentMethod(messageText);
      if (paymentMethod) {
        await ClientRepository.updateField(phone, 'payment_method', paymentMethod);
        logger.info(`[handleMessage] Payment method updated phone=${phone} paymentMethod="${paymentMethod}"`);
      }
      break;
    }
    case 'pos_venda':
      await ClientRepository.updateField(phone, 'feedback', messageText);
      logger.info(`[handleMessage] Feedback updated phone=${phone} feedback="${messageText}"`);
      break;
    case 'reativacao':
      await ClientRepository.updateField(phone, 'reactivation_reason', messageText);
      logger.info(`[handleMessage] Reactivation reason updated phone=${phone} reason="${messageText}"`);
      break;
    default:
      break;
  }

  const productId = (process.env.PRODUTO_ID as ProdutoID) || 'produto1';
  const productInfo = getProdutoInfo(productId); // <- loga e valida
  const parts = [
    botPersona.descricao.trim(),
    `Produto: ${productInfo.nome} - ${productInfo.descricao}`,
    `Benefícios:\n- ${productInfo.beneficios.join('\n- ')}`,
    `Preço: ${productInfo.preco}`,
    productInfo.promocao ? `Promoção: ${productInfo.promocao}` : '',
    productInfo.garantias ? `Garantia: ${productInfo.garantias}` : '',
    promptByState[nextState]
  ].filter(Boolean);
  const systemPrompt = parts.join('\n\n');
  logger.debug(`[handleMessage] System prompt prepared`, { systemPrompt });

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: messageText }
  ] as any;
  logger.debug(`[handleMessage] Sending to OpenAI`, { systemPrompt, messageText });

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: Number(env.OPENAI_TEMPERATURE),
      messages: chatMessages
    });
    const botText = completion.choices?.[0]?.message?.content?.trim()
      || 'Desculpe, não consegui gerar uma resposta.';
    logger.debug(`[handleMessage] OpenAI response`, { botText });

    if (options.isAudio) {
      const audioBuffer = await audioService.synthesizeSpeech(botText);
      logger.debug(`[handleMessage] Audio buffer generated`);
      return { text: botText, audioBuffer };
    }
    return { text: botText };
  } catch (err) {
    logger.error(`[handleMessage] OpenAI request failed`, { error: err });
    throw err;
  }
}
