// src/services/conversationManager.ts

import { perfilClientePrompt } from '../prompts';
import { audioService } from './audioService';

export function getSystemPrompt(): string {
  return perfilClientePrompt;
}

export class ConversationManager {
  /**
   * Monta o prompt de perfil de cliente (camada 2),
   * concatenando informações do cliente
   */
  getPerfilPrompt(name: string): string {
    return `${perfilClientePrompt}\nCliente: ${name}`;
  }

  // ... futuros métodos: getNecessidadesPrompt, getAncoraPrompt, etc.
}

/**
 * Manipula a mensagem do usuário e gera resposta (texto e/ou áudio)
 */
export async function handleMessage(
  phone: string,
  messageText: string,
  options: { isAudio: boolean }
): Promise<{ text?: string; audioBuffer?: Buffer }> {
  // 🧪 Aqui você pode colocar lógica real depois (state machine, intent map etc.)
  const responseText = `Recebido: ${messageText}`;

  if (options.isAudio) {
    const audioBuffer = await audioService.synthesizeSpeech(responseText);
    return { text: responseText, audioBuffer };
  }

  return { text: responseText };
}
