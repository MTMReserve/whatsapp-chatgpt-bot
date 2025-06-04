import { clientePrefereAudio } from '../../services/audioPreferenceAnalyzer';
import * as audioCounter from '../../services/audioCounter';

jest.mock('../../services/audioCounter');

describe('clientePrefereAudio', () => {
  it('returns true when audio count > 0', () => {
    (audioCounter.getAudioCount as jest.Mock).mockReturnValue(1);
    expect(clientePrefereAudio('123')).toBe(true);
  });

  it('returns false when audio count is 0', () => {
    (audioCounter.getAudioCount as jest.Mock).mockReturnValue(0);
    expect(clientePrefereAudio('123')).toBe(false);
  });
});
