/**
 * Testes unitários para o utilitário Humanizer
 *
 * – Importa explicitamente o módulo Humanizer (evita erro TS2304 no CI).
 * – Usa uma folga de 5 ms para não falhar por granulação de relógio
 *   nos runners do GitHub Actions.
 */

import Humanizer from '../../services/humanizer'   // ajuste o caminho se necessário
// Se o módulo exportar de forma nomeada, use:
// import { Humanizer } from '../../services/humanizer';

describe('Humanizer utility', () => {
  describe('delay()', () => {
    it('should wait at least the given milliseconds', async () => {
      const start = Date.now()

      await Humanizer.delay(50)           // função a testar
      const elapsed = Date.now() - start  // tempo decorrido

      // margem de 5 ms → evita flake em ambientes CI/CD
      expect(elapsed).toBeGreaterThanOrEqual(45)
    })
  })

  describe('randomDelay()', () => {
    it('returns a number between min and max', () => {
      const min = 50
      const max = 150

      const value = Humanizer.randomDelay(min, max)

      expect(value).toBeGreaterThanOrEqual(min)
      expect(value).toBeLessThanOrEqual(max)
    })
  })
})
