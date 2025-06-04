// src/produto/produtoMap.ts

import { logger } from '../utils/logger';

/**
 * 🔍 ProdutoID representa os produtos disponíveis no sistema.
 * Cada ID representa um produto vendido pelo bot para o cliente final (B2C),
 * mas a ficha é preenchida pelo cliente contratante (B2B).
 */
export type ProdutoID = 'produto1' | 'produto2';

/**
 * 💳 Formas de pagamento suportadas
 */
type FormaPagamento = 'pix' | 'debito' | 'credito' | 'boleto' | 'dinheiro';

/**
 * 💰 Estrutura de negociação para cada produto
 */
type Negociacao = {
  preco_base: number;
  desconto_pix: number; // Ex: 0.1 para 10%
  preco_com_desconto: number;
  condicao_para_desconto: string;
  observacoes?: string;
};

/**
 * 🧱 Estrutura de dados de cada produto, preenchida pelo cliente B2B.
 * Esses campos são usados pelo bot para instruir o cliente B2C na etapa de fechamento.
 */
export const produtoMap: Record<ProdutoID, {
  nome: string;
  descricao: string;
  beneficios: string[];
  preco: string;
  promocao?: string;
  garantias?: string;

  formasPagamento?: FormaPagamento[];
  instrucoesPagamento?: string;
  entrega?: 'retirada' | 'envio' | 'digital';
  instrucoesEntrega?: string;

  requires_address?: boolean;

  negociacao?: Negociacao;

  local_realizacao?: string; // ✅ Adicionado para controle de endereço fixo
}> = {
  produto1: {
    nome: 'Micropigmentação de Barba',
    descricao: 'Procedimento estético seguro e natural que preenche falhas e proporciona aparência de barba cheia e harmônica.',
    beneficios: [
      'Preenche falhas com efeito natural',
      'Barba cheia e simétrica todos os dias',
      'Aumento imediato da autoconfiança',
      'Melhora na imagem pessoal e profissional',
      'Duração de até 1 ano com retoque incluso',
      'Atendimento personalizado para seu rosto',
      'Procedimento seguro e aprovado pela ANVISA',
      'Aplicação indolor com anestésico suave',
      'Avaliação gratuita antes da sessão',
      'Bônus: corte de cabelo e barba no agendamento'
    ],
    preco: 'R$ 497 à vista via PIX ou até 12x de R$ 43 sem juros',
    promocao: '🔥 Promoção relâmpago: 10% OFF no PIX até sábado (R$ 447,30)',
    garantias: 'Retoque gratuito em até 30 dias e aprovação visual antes da aplicação',

    formasPagamento: ['pix', 'credito', 'debito'],
    instrucoesPagamento: 'Pagamento via Pix na chave CNPJ: 00.000.000/0001-00 ou com cartão de débito/crédito na barbearia.',
    entrega: 'retirada',
    instrucoesEntrega: 'Compareça na barbearia O MOTIM - Avenida Santa Cruz dos Lázaros, 58 - São João, Jacareí, no horário agendado. Leve um documento de identificação.',
    requires_address: false,

    negociacao: {
      preco_base: 497,
      desconto_pix: 0.1,
      preco_com_desconto: 447.3,
      condicao_para_desconto: 'Pagamento à vista via PIX',
      observacoes: 'Promoção válida até o fim do mês'
    },

    local_realizacao: 'Jacareí/SP - Avenida Santa Cruz dos Lázaros, 58, bairro São João, dentro da barbearia O MOTIM' // ✅ Endereço fixo padronizado
  },

  produto2: {
    nome: 'Visagismo + Estilo',
    descricao: 'Consultoria personalizada de imagem para encontrar o corte ideal e elevar sua presença visual.',
    beneficios: [
      'Descobre o corte ideal para o seu formato de rosto',
      'Eleva sua imagem pessoal e profissional',
      'Inclui dicas práticas de estilo e autocuidado',
      'Atendimento personalizado por visagistas experientes'
    ],
    preco: 'R$ 290',
    requires_address: false
  }
};

/**
 * 🔁 Retorna as informações do produto, com logs detalhados para rastreamento completo.
 * @param produtoId ID do produto solicitado
 * @param contexto Origem da chamada (ex: 'conversationManager', 'fechamentoPrompt')
 */
export function getProdutoInfo(produtoId: ProdutoID, contexto = 'desconhecido') {
  const produto = produtoMap[produtoId];

  if (!produto) {
    logger.error(`[produtoMap] ❌ Produto ID inválido solicitado: ${produtoId} — Origem: ${contexto}`);
    throw new Error(`Produto inválido: ${produtoId}`);
  }

  logger.info(`[produtoMap] ✅ Produto carregado: ${produto.nome} — Origem: ${contexto}`);

  // 🚨 Verifica campos críticos ausentes
  const camposCriticos = ['formasPagamento', 'instrucoesPagamento', 'entrega', 'instrucoesEntrega'] as const;
  for (const campo of camposCriticos) {
    if (!(campo in produto) || produto[campo] === undefined) {
      logger.warn(`[produtoMap] ⚠️ Produto "${produtoId}" incompleto — Campo ausente: ${campo}`);
    }
  }

  return produto;
}
