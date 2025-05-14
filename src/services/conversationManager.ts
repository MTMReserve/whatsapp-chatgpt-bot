// src/services/conversationManager.ts

import { ClientRepository } from './clientRepository';
import { getNextState, getInitialState } from './stateMachine';
import * as dataExtractor from './dataExtractor';
import { audioService } from './audioService';
import { openai } from '../api/openai';
import { env } from '../config/env';
import type { BotState } from './intentMap';

// Persona e produto
import { botPersona } from '../persona/botPersona';
import { produtoMap, type ProdutoID } from '../produto/produtoMap';

// Prompts de cada etapa
import abordagemPrompt from '../prompts/01-abordagem';
import levantamentoPrompt from '../prompts/02-levantamento';
import propostaPrompt from '../prompts/03-proposta';
import objecoesPrompt from '../prompts/04-objecoes';
import negociacaoPrompt from '../prompts/05-negociacao';
import fechamentoPrompt from '../prompts/06-fechamento';
import posVendaPrompt from '../prompts/07-posVenda';
import reativacaoPrompt from '../prompts/08-reativacao';
import encerramentoPrompt from '../prompts/09-encerramento';

// Mapeamento de prompts por estado do funil
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

/**
 * Processa a mensagem recebida, gerencia estado e gera resposta via ChatGPT.
 */
export async function handleMessage(
  phone: string,
  messageText: string,
  options: HandleMessageOptions
): Promise<BotResponse> {
  // busca ou cria cliente
  const client = await ClientRepository.findOrCreate(phone);

  // determina estado atual ou inicial
  const validStates: BotState[] = Object.keys(promptByState) as BotState[];
  const currentState: BotState = validStates.includes(client.current_state as BotState)
    ? (client.current_state as BotState)
    : getInitialState();

  // obtém próximo estado via stateMachine
  const nextState = (await getNextState(currentState, messageText, {})) as BotState;
  if (nextState && nextState !== currentState) {
    await ClientRepository.updateState(phone, nextState);
  }

  // extrai e salva dados relevantes conforme etapa
  switch (nextState) {
    case 'abordagem':
      if (!client.name || client.name === 'Cliente') {
        try {
          let nome = dataExtractor.extractName(messageText);
          if (!nome) nome = await dataExtractor.extractNameSmart(messageText);
          if (nome) await ClientRepository.updateField(phone, 'name', nome);
        } catch {
          // falha não bloqueia fluxo
        }
      }
      break;
    case 'levantamento':
      await ClientRepository.updateField(phone, 'needs', messageText);
      break;
    case 'proposta': {
      const budget = dataExtractor.extractBudget(messageText);
      await ClientRepository.updateField(phone, 'budget', budget);
      break;
    }
    case 'negociacao': {
      const negotiated = dataExtractor.extractNegotiatedPrice(messageText);
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
    default:
      break;
  }

  // Seleciona informações de produto (env ou default)
  const productId = (process.env.PRODUTO_ID as ProdutoID) || 'produto1';
  const productInfo = produtoMap[productId];

  // Monta system prompt com persona, produto e etapa
  const parts = [
    botPersona.descricao.trim(),
    `Produto: ${productInfo.nome} - ${productInfo.descricao}`,
    `Benefícios:
- ${productInfo.beneficios.join('\n- ')}`,
    `Preço: ${productInfo.preco}`,
    productInfo.promocao ? `Promoção: ${productInfo.promocao}` : '',
    productInfo.garantias ? `Garantia: ${productInfo.garantias}` : '',
    promptByState[nextState]
  ].filter(Boolean);
  const systemPrompt = parts.join('\n\n');

  // Prepara mensagens para a OpenAI
  // Casting as any para satisfazer tipos do SDK
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: messageText }
  ] as any;

  // Log para confirmar envio ao OpenAI
  console.log('🚀 [ChatGPT] System prompt e User message enviados:', systemPrompt, messageText);

    // Log para confirmar envio ao OpenAI
  console.log('🚀 [ChatGPT] System prompt enviado:', systemPrompt);
  console.log('🚀 [ChatGPT] User message enviada:', messageText);

  // Chama a API do ChatGPT para gerar a resposta
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: Number(env.OPENAI_TEMPERATURE),
    messages: chatMessages
  });

  // Extrai e loga a resposta do ChatGPT
  const botText = completion.choices?.[0]?.message?.content?.trim() || 'Desculpe, não consegui gerar uma resposta.';
  console.log('✅ [ChatGPT] Resposta recebida:', botText);

  // Retorna texto ou áudio
  if (options.isAudio) {
    const audioBuffer = await audioService.synthesizeSpeech(botText);
    return { text: botText, audioBuffer };
  }
  return { text: botText };
}
