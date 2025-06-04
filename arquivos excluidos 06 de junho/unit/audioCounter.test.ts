// src/tests/unit/audioCounter.test.ts

import { incrementAudioCount, resetAudioCount } from '../../../src/utils/audioCounter';

describe('audioCounter', () => {
  const phoneA = '5511999999999';
  const phoneB = '5511888888888';

  beforeEach(() => {
    resetAudioCount(phoneA);
    resetAudioCount(phoneB);
  });

  it('deve iniciar contador em 1 no primeiro incremento', () => {
    const count = incrementAudioCount(phoneA);
    expect(count).toBe(1);
  });

  it('deve incrementar contador a cada chamada', () => {
    incrementAudioCount(phoneA); // 1
    const count = incrementAudioCount(phoneA); // 2
    expect(count).toBe(2);
  });

  it('deve manter contadores independentes por telefone', () => {
    incrementAudioCount(phoneA); // 1
    const countB = incrementAudioCount(phoneB); // 1
    expect(countB).toBe(1);

    const countA = incrementAudioCount(phoneA); // 2
    expect(countA).toBe(2);
  });

  it('deve resetar o contador corretamente', () => {
    incrementAudioCount(phoneA); // 1
    incrementAudioCount(phoneA); // 2
    resetAudioCount(phoneA);

    const count = incrementAudioCount(phoneA); // 1 novamente
    expect(count).toBe(1);
  });
});
