// src/tests/unit/humanizer.test.ts
// Mantém a lógica original — apenas corrige a forma de importação.

import * as Humanizer from '../../services/humanizer';

describe('Humanizer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('delay should wait at least the given ms', async () => {
    const promise = Humanizer.delay(50);

    // Avança o “relógio” virtual em 50 ms
    jest.advanceTimersByTime(50);

    await expect(promise).resolves.toBeUndefined();
  });

  it('randomDelay returns a number inside allowed range', () => {
    const value = Humanizer.randomDelay();        // usa valores padrão vindos do env
    expect(value).toBeGreaterThanOrEqual(0);      // mínimo configurado
    expect(value).toBeLessThanOrEqual(1_500);     // máximo configurado
  });
});
