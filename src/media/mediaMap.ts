// src/media/mediaMap.ts

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

type ProdutoID = 'micropigmentacao_barba';

export const mediaMap: Record<ProdutoID, Partial<Record<Etapa, MidiaItem[]>>> = {
  micropigmentacao_barba: {
    abordagem: [
      {
        type: 'image',
        file: 'micropigmentacao_barba/abordagem/img-boasvindas.jpg',
        caption: 'Seja muito bem-vindo! 😊'
      }
    ],
    levantamento: [
      {
        type: 'video',
        file: 'micropigmentacao_barba/levantamento/vid-como-funciona.mp4',
        caption: 'Veja como funciona o processo completo de micropigmentação.'
      }
    ],
    proposta: [
      {
        type: 'image',
        file: 'micropigmentacao_barba/proposta/img-tabela-precos.jpg',
        caption: 'Confira a tabela de preços e condições exclusivas!'
      }
    ],
    fechamento: [
      {
        type: 'image',
        file: 'micropigmentacao_barba/fechamento/img-comprovante-modelo.jpg',
        caption: 'Modelo de comprovante para envio após pagamento.'
      }
    ]
  }
};
