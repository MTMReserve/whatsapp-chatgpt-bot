import { validarTodosCamposPorEtapa } from '../../../src/services/validadorMultiplos';
import { ClientRepository } from '../../../src/services/clientRepository';
import * as dataExtractor from '../../../src/services/dataExtractor';
import * as validadorIA from '../../../src/services/validadorIA';
import * as logMongo from '../../../src/repositories/mongo/rejectionLog.mongo';
import { metasPorEtapa, type EtapaFunil } from '../../../src/services/metaPorEtapa';

jest.mock('../../../src/services/clientRepository');
jest.mock('../../../src/services/dataExtractor');
jest.mock('../../../src/services/validadorIA');
jest.mock('../../../src/repositories/mongo/rejectionLog.mongo');

describe('validadorMultiplos', () => {
  const defaultParams = {
    phone: '5511999999999',
    texto: 'quero cortar o cabelo',
    etapa: 'levantamento' as EtapaFunil,
    clientId: 123,
    executionId: 'exec-001'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    metasPorEtapa['levantamento' as EtapaFunil] = ['needs'];
  });

  it('deve pular campo já preenchido', async () => {
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue({ needs: 'corte masculino' });

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(resultado[0]).toEqual({
      campo: 'needs',
      status: 'preenchido',
      valor: 'corte masculino'
    });
    expect(ClientRepository.updateField).not.toHaveBeenCalled();
  });

  it('deve extrair campo e validar com IA (caso aprovado)', async () => {
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue({ needs: null });
    (dataExtractor.extractNeeds as jest.Mock).mockResolvedValue('barba e cabelo');
    (validadorIA.validarCampoIA as jest.Mock).mockResolvedValue(true);

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(ClientRepository.updateField).toHaveBeenCalledWith(defaultParams.phone, 'needs', 'barba e cabelo');
    expect(resultado[0]).toEqual({
      campo: 'needs',
      status: 'salvo',
      valor: 'barba e cabelo'
    });
  });

  it('deve salvar como null e logar no Mongo (caso rejeitado)', async () => {
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue({ needs: null });
    (dataExtractor.extractNeeds as jest.Mock).mockResolvedValue('pintura');
    (validadorIA.validarCampoIA as jest.Mock).mockResolvedValue(false);

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(ClientRepository.updateField).toHaveBeenCalledWith(defaultParams.phone, 'needs', null);
    expect(logMongo.logCampoRejeitado).toHaveBeenCalledWith(expect.objectContaining({
      campo: 'needs',
      valor: 'pintura',
      motivo: 'IA rejeitou o valor extraído'
    }));
    expect(resultado[0]).toEqual({
      campo: 'needs',
      status: 'rejeitado',
      valor: 'pintura'
    });
  });

  it('deve retornar status nao_encontrado quando valor não é extraído', async () => {
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue({ needs: null });
    (dataExtractor.extractNeeds as jest.Mock).mockResolvedValue(null);

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(resultado[0]).toEqual({
      campo: 'needs',
      status: 'nao_encontrado'
    });
  });

  it('deve retornar [] se cliente não for encontrado', async () => {
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue(null);

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(resultado).toEqual([]);
  });

  it('deve retornar [] se etapa não tem metas válidas', async () => {
    metasPorEtapa['levantamento' as EtapaFunil] = [];
    (ClientRepository.findByPhone as jest.Mock).mockResolvedValue({});

    const resultado = await validarTodosCamposPorEtapa(defaultParams);

    expect(resultado).toEqual([]);
  });
});
