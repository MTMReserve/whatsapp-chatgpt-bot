// src/produto/fichaProduto.exemplo.ts
// 🔧 MODELO DE FICHA DE PRODUTO PARA PREENCHIMENTO PELO CLIENTE B2B
// Esse arquivo NÃO está ativo no bot — serve apenas como exemplo para referência e testes.
// A versão oficial e validada deve ser integrada no produtoMap.ts.

export type ProdutoID = 'micropigmentacao_barba';

export type FormaPagamento = 'pix' | 'debito' | 'credito' | 'boleto' | 'dinheiro';

/**
 * Estrutura completa de um produto que será vendido via bot.
 * Essa estrutura será preenchida por um cliente B2B (empresa que contrata o bot).
 */
export interface ProdutoDetalhado {
  id: ProdutoID;
  nome: string;
  descricao: string;
  beneficios: string[];
  preco: string;
  promocao?: string;
  garantias?: string;

  formasPagamento: FormaPagamento[];
  instrucoesPagamento: string;
  entrega: 'retirada' | 'envio' | 'digital';
  instrucoesEntrega: string;
}

/**
 * Exemplo real preenchido para o produto de micropigmentação de barba.
 */
export const produtoExemplo: ProdutoDetalhado = {
  id: 'micropigmentacao_barba',
  nome: 'Micropigmentação de Barba',
  descricao: 'Procedimento estético para preencher falhas na barba e melhorar a aparência pessoal.',
  beneficios: [
    'Barba cheia e natural todos os dias',
    'Melhora na imagem pessoal e profissional',
    'Procedimento indolor e seguro',
  ],
  preco: 'R$ 497 via Pix ou até 12x de R$ 43',
  promocao: '🔥 Promoção: 10% de desconto no Pix até sábado (R$ 447,30)',
  garantias: 'Retoque gratuito até 30 dias após o procedimento',

  formasPagamento: ['pix', 'credito', 'debito'],
  instrucoesPagamento: 'Pagamento via Pix na chave CNPJ 00.000.000/0001-00 ou na maquininha.',
  entrega: 'retirada',
  instrucoesEntrega: 'Comparecer à barbearia no horário agendado. Levar documento com foto.',
};
