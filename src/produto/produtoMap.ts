// src/produto/produtoMap.ts

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
    descricao: 'Preenchimento natural de falhas na barba com efeito realista e duradouro.',
    beneficios: [
      'Preenche falhas e dá mais volume visual',
      'Visual masculino, natural e expressivo',
      'Duração de 8 a 12 meses',
      'Elevação da autoestima',
    ],
    preco: 'R$ 450 à vista ou 3x de R$ 160',
    promocao: '10% OFF à vista até sexta-feira',
    garantias: 'Retoque gratuito em até 30 dias',
  },

  produto2: {
    nome: 'Visagismo + Estilo',
    descricao: 'Consultoria estética para identificar e aplicar o estilo ideal ao seu rosto e personalidade.',
    beneficios: [
      'Identificação do corte ideal para seu formato de rosto',
      'Melhora na sua imagem profissional',
      'Acompanhamento com sugestão de estilo e cuidados',
    ],
    preco: 'R$ 290 fixo',
  }
};
