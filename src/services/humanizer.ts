export class Humanizer {
  /** Aguarda um tempo fixo */
  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Gera um número aleatório entre min e max */
  static randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Sorteia uma frase de um array */
  static randomizeText(options: string[]): string {
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  }
}
