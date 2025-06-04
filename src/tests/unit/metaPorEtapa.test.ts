import { getMetasDaEtapa, metasPorEtapa } from '../../services/metaPorEtapa';

describe('getMetasDaEtapa', () => {
  it('returns metas for known etapa', () => {
    expect(getMetasDaEtapa('abordagem')).toEqual(metasPorEtapa.abordagem);
  });

  it('returns empty array for unknown etapa', () => {
    expect(getMetasDaEtapa('desconhecida' as any)).toEqual([]);
  });
});
