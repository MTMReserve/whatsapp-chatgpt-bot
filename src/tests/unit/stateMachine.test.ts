import { getNextState } from '../../services/stateMachine';
import type { BotState } from '../../services/intentMap';
import * as openai from '../../api/openai';

describe('Máquina de Estados – getNextState()', () => {
  it('deve manter o fluxo padrão: abordagem -> levantamento', async () => {
    const next = await getNextState('abordagem', 'Quero saber mais', {});
    expect(next).toBe('levantamento');
  });

  it('deve redirecionar encerramento precoce para levantamento', async () => {
    const next = await getNextState('abordagem', 'Não tenho interesse', {});
    expect(next).toBe('levantamento');
  });

  it('deve redirecionar fechamento precoce para proposta', async () => {
    const next = await getNextState('abordagem', 'Fechado! Vamos marcar', {});
    expect(next).toBe('proposta');
  });

  it('deve aceitar fluxo direto válido: levantamento -> proposta', async () => {
    const next = await getNextState('levantamento', 'Me explica como funciona?', {});
    expect(next).toBe('proposta');
  });

  it('deve manter estado atual se mensagem não gera intenção forte', async () => {
    const next = await getNextState('levantamento', 'lorem ipsum dolor', {});
    expect(next).toBe('levantamento');
  });

  it('deve retornar estado atual em caso de erro', async () => {
    const next = await getNextState('levantamento', null as any, {});
    expect(next).toBe('levantamento');
  });

  it('deve forçar encerramento após número máximo de repetições', async () => {
    const context = {
      retries: {
        levantamento: 3, // atingiu o limite
      },
    };
    const next = await getNextState('levantamento', 'Me explica como funciona?', context);
    expect(next).toBe('encerramento');
  });

  it('deve permanecer no estado atual se intenção não for forte o suficiente', async () => {
    const context = {
      retries: {
        levantamento: 1,
      },
    };
    const next = await getNextState('levantamento', 'texto genérico aleatório', context);
    expect(next).toBe('levantamento');
  });

  // 👇 NOVOS TESTES: Fallback via ChatGPT
  it('deve usar o fallback do ChatGPT quando não encontrar intenção no intentMap', async () => {
    const mockChat = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              { message: { content: 'levantamento' } }
            ]
          })
        }
      }
    };

    const originalOpenAI = openai.openai;
    (openai as any).openai = mockChat;

    const result = await getNextState('abordagem', 'quero escurecer minha barba mas tô em dúvida', {});
    expect(result).toBe('levantamento');

    (openai as any).openai = originalOpenAI;
  });

  it('deve manter o estado se nem intentMap nem ChatGPT entenderem', async () => {
    const mockChat = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              { message: { content: 'invalido' } } // resposta inválida
            ]
          })
        }
      }
    };

    const originalOpenAI = openai.openai;
    (openai as any).openai = mockChat;

    const result = await getNextState('abordagem', '?????????', {});
    expect(result).toBe('abordagem');

    (openai as any).openai = originalOpenAI;
  });
});
