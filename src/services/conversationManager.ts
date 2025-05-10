// src/services/conversationManager.ts

import { perfilClientePrompt } from '../prompts';

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
