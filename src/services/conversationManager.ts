import { prompts, BotState } from '../prompts';
import { getNextState } from './stateMachine';
import { openai } from '../config/openai';
import { produtoMap, ProdutoID } from '../produto/produtoMap';

/**
 * Função principal que gerencia a conversa.
 */
export async function handleMessage(from: string, message: string): Promise<string> {
  const historico: string[] = [];

  const rawState = getNextState('abordagem', message, {});
  const nextState = ['abordagem', 'levantamento', 'proposta', 'objecoes', 'negociacao', 'fechamento', 'posvenda', 'reativacao', 'encerramento'].includes(rawState)
    ? (rawState as BotState)
    : 'abordagem';

  const produtoID: ProdutoID = 'produto1'; // pode vir do banco no futuro
  const produto = produtoMap[produtoID];

  const systemPrompt = `
${prompts[nextState]}

Produto ativo: ${produto.nome}

Descrição: ${produto.descricao}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  });

  return completion.choices[0].message.content || 'Desculpe, não consegui entender. Pode repetir?';
}
