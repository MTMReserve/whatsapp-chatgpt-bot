// src/services/humanizer.ts

export class Humanizer {
    /** Faz uma pausa de X milissegundos */
    static delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  
    /** Gera um delay aleatório entre min e max (em ms) */
    static randomDelay(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  
    /** Simula digitação de um texto, disparando um callback a cada caractere */
    static async typewrite(text: string, perCharMs: number, callback: (char: string) => void) {
      for (const char of text) {
        await this.delay(perCharMs)
        callback(char)
      }
    }
  }
    ''  