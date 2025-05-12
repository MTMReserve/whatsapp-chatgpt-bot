import {
  perfilClientePrompt,
  levantamentoPrompt,
  propostaPrompt,
  objecoesPrompt,
  negociacaoPrompt,
  fechamentoPrompt,
  posVendaPrompt,
  reativacaoPrompt,
  encerramentoPrompt
} from '../prompts';
import { audioService } from './audioService';
import { ClientRepository } from './clientRepository';
import { getNextState, getInitialState } from './stateMachine';
import {
  extractName,
  extractNameSmart,
  extractBudget,
  extractAddress,
  extractNegotiatedPrice,
  extractPaymentMethod
} from './dataExtractor';
import type { BotState } from './intentMap';

export function getSystemPrompt(): string {
  return perfilClientePrompt;
}

export class ConversationManager {
  getPerfilPrompt(name: string): string {
    return `${perfilClientePrompt}\nCliente: ${name}`;
  }
}

export async function handleMessage(
  phone: string,
  messageText: string,
  options: { isAudio: boolean }
): Promise<{ text?: string; audioBuffer?: Buffer }> {
  const client = await ClientRepository.findOrCreate(phone);

  const validStates: BotState[] = [
    'abordagem',
    'levantamento',
    'proposta',
    'objecoes',
    'negociacao',
    'fechamento',
    'pos_venda',
    'reativacao',
    'encerramento'
  ];
  const rawState = client.current_state;
  const currentState: BotState = validStates.includes(rawState as BotState)
    ? (rawState as BotState)
    : getInitialState();

  const nextState = await getNextState(currentState, messageText, {}) as BotState;

  if (nextState !== currentState) {
    await ClientRepository.updateState(phone, nextState);
  }

  switch (nextState) {
    case 'abordagem':
      if (!client.name || client.name === 'Cliente') {
        let nomeExtraido = extractName(messageText);
        if (!nomeExtraido) {
          nomeExtraido = await extractNameSmart(messageText);
        }
        if (nomeExtraido) {
          await ClientRepository.updateField(phone, 'name', nomeExtraido);
        }
      }
      break;

    case 'levantamento':
      await ClientRepository.updateField(phone, 'needs', messageText);
      break;

    case 'proposta':
      const valor = extractBudget(messageText);
      await ClientRepository.updateField(phone, 'budget', valor);
      break;

    case 'negociacao':
      const negociado = extractNegotiatedPrice(messageText);
      if (negociado !== null) {
        await ClientRepository.updateField(phone, 'negotiated_price', negociado);
      }
      break;

    case 'fechamento':
      const endereco = extractAddress(messageText);
      if (endereco) {
        await ClientRepository.updateField(phone, 'address', endereco);
      }
      const metodo = extractPaymentMethod(messageText);
      if (metodo) {
        await ClientRepository.updateField(phone, 'payment_method', metodo);
      }
      break;

    case 'pos_venda':
      await ClientRepository.updateField(phone, 'feedback', messageText);
      break;

    case 'reativacao':
      await ClientRepository.updateField(phone, 'reactivation_reason', messageText);
      break;
  }

  const promptByState: Record<BotState, string> = {
    abordagem: perfilClientePrompt,
    levantamento: levantamentoPrompt,
    proposta: propostaPrompt,
    objecoes: objecoesPrompt,
    negociacao: negociacaoPrompt,
    fechamento: fechamentoPrompt,
    pos_venda: posVendaPrompt,
    reativacao: reativacaoPrompt,
    encerramento: encerramentoPrompt
  };

  const responseText = promptByState[nextState] || 'Obrigado por conversar conosco.';

  if (options.isAudio) {
    const audioBuffer = await audioService.synthesizeSpeech(responseText);
    return { text: responseText, audioBuffer };
  }

  return { text: responseText };
}
