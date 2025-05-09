import { perfilPrompt } from './00-perfil';
import { abordagemPrompt } from './01-abordagem';
import { levantamentoPrompt } from './02-levantamento';
import { propostaPrompt } from './03-proposta';
import { objecoesPrompt } from './04-objecoes';
import { negociacaoPrompt } from './05-negociacao'; // garantir que esse arquivo foi criado com o nome correto
import { fechamentoPrompt } from './06-fechamento';
import { posvendaPrompt } from './07-posvenda'; // garantir que o nome da exportação interna também seja "posvendaPrompt"
import { reativacaoPrompt } from './08-reativacao'; // criar com export "reativacaoPrompt"
import { encerramentoPrompt } from './09-encerramento'; // criar com export "encerramentoPrompt"

export type BotState =
  | 'abordagem'
  | 'levantamento'
  | 'proposta'
  | 'objecoes'
  | 'negociacao'
  | 'fechamento'
  | 'posvenda'
  | 'reativacao'
  | 'encerramento';

export const prompts: Record<BotState | 'perfil', string> = {
  perfil: perfilPrompt,
  abordagem: abordagemPrompt,
  levantamento: levantamentoPrompt,
  proposta: propostaPrompt,
  objecoes: objecoesPrompt,
  negociacao: negociacaoPrompt,
  fechamento: fechamentoPrompt,
  posvenda: posvendaPrompt,
  reativacao: reativacaoPrompt,
  encerramento: encerramentoPrompt,
};
