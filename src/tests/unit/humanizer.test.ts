/*  src/tests/unit/humanizer.test.ts  */
import { delay, randomDelay } from '../../../src/services/humanizer'

describe('Humanizer', () => {
  it('delay aguarda pelo menos o tempo informado', async () => {
    const start = Date.now()
    await delay(50)              // espera 50 ms
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(50)
  })

  it('randomDelay devolve um número dentro do intervalo', () => {
    const value = randomDelay(100, 200)
    expect(value).toBeGreaterThanOrEqual(100)
    expect(value).toBeLessThanOrEqual(200)
  })
})
