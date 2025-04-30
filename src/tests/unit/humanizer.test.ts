/* eslint-disable jest/expect-expect */
import Humanizer from '../../services/humanizer'   // ← caminho certo: sobe 2 níveis

describe('Humanizer', () => {
  describe('delay', () => {
    it('should wait at least the given ms', async () => {
      const start = Date.now()

      await Humanizer.delay(50)                   // usa método estático
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(50)
    })
  })

  describe('randomDelay', () => {
    it('returns a number between min and max', () => {
      const min = 100
      const max = 200

      const value = Humanizer.randomDelay(min, max)

      expect(value).toBeGreaterThanOrEqual(min)
      expect(value).toBeLessThanOrEqual(max)
    })
  })
})
