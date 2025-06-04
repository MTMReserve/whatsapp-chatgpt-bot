import { verificadorPropostaNegociacao } from '../../services/verificadorPropostaNegociacao';
import * as logs from '../../repositories/mongo/logsEstrategia.mongo';

jest.mock('../../repositories/mongo/logsEstrategia.mongo');

describe('verificadorPropostaNegociacao', () => {
  it('suggests retry with higher temperature for weak response', async () => {
    const res = await verificadorPropostaNegociacao({
      textoGerado: 'ok',
      etapaAtual: 'negociacao',
      temperaturaAnterior: 0.5,
      phone: '1'
    });
    expect(res.deveRefazerComMaisTemperatura).toBe(true);
    expect(res.novaTemperatura).toBeGreaterThan(0.5);
  });

  it('does not retry when contains keyword', async () => {
    const res = await verificadorPropostaNegociacao({
      textoGerado: 'Temos um desconto especial',
      etapaAtual: 'negociacao',
      temperaturaAnterior: 0.5,
      phone: '1'
    });
    expect(res.deveRefazerComMaisTemperatura).toBe(false);
  });

  it('bypasses when etapa not negociacao', async () => {
    const res = await verificadorPropostaNegociacao({
      textoGerado: 'ok',
      etapaAtual: 'proposta',
      temperaturaAnterior: 0.5,
      phone: '1'
    });
    expect(res.deveRefazerComMaisTemperatura).toBe(false);
  });
});
