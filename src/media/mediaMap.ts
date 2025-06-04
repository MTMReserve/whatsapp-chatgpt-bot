// src/media/mediaMap.ts

import { type ProdutoID } from '../produto/produtoMap';

type MediaType = 'image' | 'video' | 'document';

interface MidiaItem {
  type: MediaType;
  file: string;       // Caminho local relativo à pasta /src/media
  caption?: string;   // Legenda opcional
}

type Etapa =
  | 'abordagem'
  | 'levantamento'
  | 'proposta'
  | 'objecoes'
  | 'negociacao'
  | 'fechamento'
  | 'pos_venda'
  | 'reativacao'
  | 'encerramento';

export const mediaMap: Record<ProdutoID, Partial<Record<Etapa, MidiaItem[]>>> = {
  produto1: {
    abordagem: [
      {
        type: 'image',
        file: 'images/produto1/01-abordagem/img1.jpg',
        caption: 'Seja bem-vindo à nossa solução!'
      },
      {
        type: 'video',
        file: 'videos/produto1/01-abordagem/intro.mp4',
        caption: 'Conheça rapidamente o que podemos fazer por você.'
      }
    ],
    levantamento: [
      {
        type: 'image',
        file: 'images/produto1/02-levantamento/demanda.jpg',
        caption: 'Entendendo suas necessidades.'
      }
    ],
    proposta: [
      {
        type: 'image',
        file: 'images/produto1/03-proposta/tabela.jpg',
        caption: 'Confira a proposta personalizada.'
      }
    ],
    objecoes: [
      {
        type: 'video',
        file: 'videos/produto1/04-objecoes/beneficios.mp4',
        caption: 'Veja como resolvemos dúvidas frequentes.'
      }
    ],
    fechamento: [
      {
        type: 'image',
        file: 'images/produto1/06-fechamento/comprovante.jpg',
        caption: 'Exemplo de comprovante para confirmação.'
      }
    ],
    pos_venda: [
      {
        type: 'video',
        file: 'videos/produto1/07-posvenda/agradecimento.mp4',
        caption: 'Obrigado por sua confiança!'
      }
    ]
  },
  produto2: {} // ✅ Adicionado conforme solicitado
};
