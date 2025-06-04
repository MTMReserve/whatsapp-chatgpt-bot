import { ClientRepository } from './src/services/clientRepository';

(async () => {
  const result = await ClientRepository.updateField('5512988629397', 'name', 'Maurício Automático');
  console.log('Resultado do update:', result);
})();
