import { validarCamposExtraidos, type ValidarCamposParams } from '../../../src/services/validadorMultiplos';
import { EtapaFunil } from '../../../src/services/metaPorEtapa';

describe('validadorMultiplos - validarCamposExtraidos', () => {
  const paramsBase: Omit<ValidarCamposParams, 'texto'> = {
    phone: '+5599999999999',
    etapa: '02_levantamento' as EtapaFunil,
    clientId: 1,
    executionId: 'exec-test-123',
  };

  it('valida campo needs corretamente com valor válido', async () => {
    const params: ValidarCamposParams = {
      ...paramsBase,
      texto: 'quero uma pomada modeladora',
    };

    const resultado = await validarCamposExtraidos(params, ['needs']);

    const validacao = resultado.find((r) => r.campo === 'needs');
    expect(validacao).toBeDefined();
    expect(validacao!.status === 'salvo' || validacao!.status === 'preenchido').toBe(true);
    expect(validacao!.valor).toBeTruthy();
  });

  it('rejeita campo needs com valor sem sentido', async () => {
    const params: ValidarCamposParams = {
      ...paramsBase,
      texto: '123 sem sentido',
    };

    const resultado = await validarCamposExtraidos(params, ['needs']);

    const validacao = resultado.find((r) => r.campo === 'needs');
    expect(validacao).toBeDefined();
    expect(validacao!.status).toBe('rejeitado');
  });

  it('ignora campos que não são suportados na etapa', async () => {
    const params: ValidarCamposParams = {
      ...paramsBase,
      texto: 'informação qualquer irrelevante',
    };

    const resultado = await validarCamposExtraidos(params, ['orçamento_invalido' as any]);

    expect(resultado.length).toBe(0); // não deve retornar nada para campo inválido
  });
});
