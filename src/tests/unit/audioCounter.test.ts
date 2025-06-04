import { incrementAudioCount, resetAudioCount, getAudioCount } from '../../services/audioCounter';

describe('audioCounter', () => {
  it('increments and retrieves count', () => {
    resetAudioCount('123');
    expect(getAudioCount('123')).toBe(0);
    incrementAudioCount('123');
    incrementAudioCount('123');
    expect(getAudioCount('123')).toBe(2);
  });

  it('resets count', () => {
    incrementAudioCount('321');
    resetAudioCount('321');
    expect(getAudioCount('321')).toBe(0);
  });
});
