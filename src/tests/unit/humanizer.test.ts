import { Humanizer } from '../../services/humanizer'

describe('Humanizer', () => {
  it('delay should wait at least the given ms', async () => {
    const start = Date.now()
    await Humanizer.delay(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(50)
  })

  it('randomDelay returns a number between min and max', () => {
    const min = 10, max = 20
    const val = Humanizer.randomDelay(min, max)
    expect(val).toBeGreaterThanOrEqual(min)
    expect(val).toBeLessThanOrEqual(max)
  })
})
