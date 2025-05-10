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
    descricao: 'Preenchimento natural de falhas com efeito visual de barba cheia.',
    beneficios: [
      'Preenche falhas e dá volume',
      'Visual masculino e natural',
      'Duração de até 12 meses',
      'Alta autoestima e confiança'
    ],
    preco: 'R$ 450 à vista ou 3x de R$ 160',
    promocao: '10% OFF para pagamentos até sexta',
    garantias: 'Satisfação garantida ou retoque grátis',
  },
  produto2: {
    nome: 'Visagismo + Estilo',
    descricao: 'Consultoria personalizada de corte, estilo e imagem pessoal.',
    beneficios: [
      'Descobre o corte ideal para seu rosto',
      'Eleva sua imagem profissional',
      'Inclui dicas de cuidados e estilo',
    ],
    preco: 'R$ 290',
  }
};
