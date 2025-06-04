const services = [
  'ExtractionService',
  'PromptService',
  'StateService',
  'analyzeClientProfile',
  'audioCounter',
  'audioPreferenceAnalyzer',
  'audioService',
  'checklistFechamento',
  'clientProfileRepository',
  'clientRepository',
  'contextMemory',
  'dataExtractor',
  'dynamicClientMonitor',
  'intentFallback',
  'interactionMongoService',
  'levantamentoAdaptativo',
  'metaPorEtapa',
  'objectionMonitor',
  'reengagementService',
  'registrarAuditoriaIA',
  'resumoDoHistorico',
  'validadorMultiplos',
  'verificadorContradicoes',
  'verificadorPropostaNegociacao',
  'conversationManager/index'
];

describe('service module imports', () => {
  it.each(services)('%s loads without error', async (name) => {
    await expect(import(`../../services/${name}`)).resolves.toBeDefined();
  });
});
