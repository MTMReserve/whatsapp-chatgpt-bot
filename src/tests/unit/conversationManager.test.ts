import { handleMessage } from '../../services/conversationManager';
import { prompts } from '../../prompts';

describe('conversationManager', () => {
  it('deve gerar resposta com base no prompt da abordagem', async () => {
    const resposta = await handleMessage('5511999999999', 'Oi');
    expect(typeof resposta).toBe('string');
  });

  it('deve incluir conteúdo do prompt de perfil na resposta', async () => {
    const resposta = await handleMessage('5511999999999', 'Oi');
    expect(resposta).toContain(prompts.perfil);
  });

  it('deve conter instruções do sistema (abordagem)', async () => {
    const resposta = await handleMessage('5511999999999', 'Oi');
    expect(resposta).toContain(prompts.abordagem);
  });
});
