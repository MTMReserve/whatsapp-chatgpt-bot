import { decidirModoLevantamento } from '../../services/levantamentoAdaptativo';
import * as objectionMonitor from '../../services/objectionMonitor';

jest.mock('../../services/objectionMonitor');

describe('decidirModoLevantamento', () => {
  it('returns leve when objection none', async () => {
    (objectionMonitor.analisarObjeçõesIA as jest.Mock).mockResolvedValue('nenhuma');
    await expect(decidirModoLevantamento(['oi'])).resolves.toBe('leve');
  });

  it('returns profundo when objection moderate', async () => {
    (objectionMonitor.analisarObjeçõesIA as jest.Mock).mockResolvedValue('moderada');
    await expect(decidirModoLevantamento(['oi'])).resolves.toBe('profundo');
  });
});
