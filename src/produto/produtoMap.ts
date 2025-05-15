// src/produto/produtoMap.ts

import { logger } from '../utils/logger';

export type ProdutoID = 'produto1' | 'produto2';

export const produtoMap: Record<ProdutoID, {
  nome: string;
  descricao: string;
  beneficios: string[];
  preco: string;
  promocao?: string;
  garantias?: string;
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
  }
};

/**
 * Retorna informações do produto com log
 */
export function getProdutoInfo(produtoId: ProdutoID) {
  const produto = produtoMap[produtoId];
  if (!produto) {
    logger.error(`[produtoMap] Produto ID inválido solicitado: ${produtoId}`);
    throw new Error(`Produto inválido: ${produtoId}`);
  }

  logger.info(`[produtoMap] Produto carregado: ${produto.nome}`);
  return produto;
}
