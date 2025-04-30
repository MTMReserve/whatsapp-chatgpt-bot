/* src/tests/unit/humanizer.test.ts */
import { Humanizer } from '../../services/humanizer'   // ← named import

describe('Humanizer', () => {
  it('delay waits at least the given ms', async () => {
    const start = Date.now()
    await Humanizer.delay(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(50)
  })

  it('randomDelay returns a value between min & max', () => {
    const min = 100
    const max = 200
    const v = Humanizer.randomDelay(min, max)
    expect(v).toBeGreaterThanOrEqual(min)
    expect(v).toBeLessThanOrEqual(max)
  })
})
