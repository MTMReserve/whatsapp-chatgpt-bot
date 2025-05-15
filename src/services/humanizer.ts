// src/services/humanizer.ts

import { logger } from '../utils/logger';

export class Humanizer {
  /** Faz uma pausa de X milissegundos */
  static delay(ms: number): Promise<void> {
    logger.debug(`[humanizer] Aguardando delay de ${ms}ms`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Gera um número aleatório entre min e max (em ms) */
  static randomDelay(min: number, max: number): number {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    logger.debug(`[humanizer] Delay aleatório gerado: ${result}ms (entre ${min}-${max})`);
    return result;
  }

  /** Simula digitação de um texto, chamando callback para cada caractere */
  static async typewrite(
    text: string,
    perCharMs: number,
    callback: (char: string) => void
  ): Promise<void> {
    logger.debug(`[humanizer] Iniciando simulação de digitação. Texto com ${text.length} caracteres`);
    for (const char of text) {
      await this.delay(perCharMs);
      callback(char);
    }
    logger.debug(`[humanizer] Simulação de digitação concluída`);
  }
}
