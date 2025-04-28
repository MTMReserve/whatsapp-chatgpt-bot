// src/services/conversationManager.ts

import * as prompts from '../prompts'

export class ConversationManager {
  /** Retorna o prompt de sistema (camada 1) */
  getSystemPrompt(): string {
    return prompts.sistemaPrompt
  }

  /**
   * Monta o prompt de perfil de cliente (camada 2),
   * concatenando informações do cliente
   */
  getPerfilPrompt(name: string): string {
    return `${prompts.perfilClientePrompt}\nCliente: ${name}`
  }

  // … você pode adicionar métodos como:
  // getNecessidadesPrompt, getAncoraPrompt, etc.
}
