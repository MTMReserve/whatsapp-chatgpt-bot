// src/services/intentMap.ts

export type BotState =
  | 'abordagem'
  | 'levantamento'
  | 'proposta'
  | 'objecoes'
  | 'negociacao'
  | 'fechamento'
  | 'pos_venda'
  | 'reativacao'
  | 'encerramento';

export interface Intent {
  word: string;
  score: number;
}

export const intentMap: Record<BotState, Intent[]> = {
  abordagem: [
    { word: 'oi', score: 3 },
    { word: 'olá', score: 3 },
    { word: 'bom dia', score: 3 },
    { word: 'boa tarde', score: 3 },
    { word: 'boa noite', score: 3 },
    { word: 'tudo bem', score: 4 },
    { word: 'beleza', score: 3 },
    { word: 'e aí', score: 4 },
    { word: 'como vai', score: 4 },
    { word: 'prazer', score: 2 },
    { word: 'vamos começar', score: 5 },
    { word: 'iniciar', score: 4 },
    { word: 'começar', score: 4 },
    { word: 'posso te ajudar', score: 5 },
    { word: 'tô na área', score: 4 },
    { word: 'uai', score: 2 },
    { word: 'bá', score: 2 },
    { word: 'ôxe', score: 2 },
    { word: 'ô de casa', score: 3 },
    { word: 'eita lasqueira', score: 2 }
  ],
  levantamento: [
    { word: 'quero saber', score: 5 },
    { word: 'quero saber mais', score: 5 },  
    { word: 'estou procurando', score: 5 },
    { word: 'preciso de', score: 5 },
    { word: 'gostaria de', score: 4 },
    { word: 'tem disponível', score: 4 },
    { word: 'saber mais', score: 4 },
    { word: 'vocês têm', score: 4 },
    { word: 'me interessei', score: 4 },
    { word: 'gostaria de entender', score: 5 },
    { word: 'vocês fazem', score: 4 },
    { word: 'tô afim', score: 4 },
    { word: 'tô na pilha', score: 4 },
    { word: 'tô na seca', score: 4 },
    { word: 'tô no veneno', score: 4 },
    { word: 'tô na fissura', score: 4 }
  ],
  proposta: [
    { word: 'como funciona', score: 4 },
    { word: 'o que inclui', score: 5 },
    { word: 'me explica', score: 5 },
    { word: 'detalhes', score: 3 },
    { word: 'qual a proposta', score: 5 },
    { word: 'o que está incluso', score: 5 },
    { word: 'apresentação', score: 4 },
    { word: 'mostrar', score: 3 },
    { word: 'tem foto', score: 2 },
    { word: 'desenrola aí', score: 4 },
    { word: 'me dá um bizu', score: 4 },
    { word: 'manda a real', score: 4 }
  ],
  objecoes: [
    { word: 'caro', score: 5 },
    { word: 'muito alto', score: 5 },
    { word: 'não sei', score: 4 },
    { word: 'vou pensar', score: 4 },
    { word: 'não tenho dinheiro', score: 5 },
    { word: 'talvez', score: 3 },
    { word: 'depois eu vejo', score: 5 },
    { word: 'tá salgado', score: 4 },
    { word: 'sem grana', score: 5 },
    { word: 'não vale', score: 4 },
    { word: 'tá puxado', score: 4 },
    { word: 'tá osso', score: 4 }
  ],
  negociacao: [
    { word: 'desconto', score: 5 },
    { word: 'valor à vista', score: 5 },
    { word: 'parcelar', score: 4 },
    { word: 'pagamento', score: 4 },
    { word: 'condição especial', score: 5 },
    { word: 'forma de pagamento', score: 4 },
    { word: 'dá pra fazer', score: 4 },
    { word: 'tem como melhorar', score: 5 },
    { word: 'dá pra dar um jeitinho', score: 4 },
    { word: 'rola um agrado', score: 4 },
    { word: 'desenrolar', score: 4 }
  ],
  fechamento: [
    { word: 'quero fechar', score: 5 },
    { word: 'fechei', score: 5 },
    { word: 'topo', score: 4 },
    { word: 'topa', score: 4 },
    { word: 'vamos', score: 4 },
    { word: 'bora', score: 5 },
    { word: 'tá certo', score: 4 },
    { word: 'ok pode ser', score: 5 },
    { word: 'vou querer', score: 4 },
    { word: 'tá feito', score: 4 },
    { word: 'demorô', score: 4 }
  ],
  pos_venda: [
    { word: 'deu certo', score: 4 },
    { word: 'gostei', score: 4 },
    { word: 'muito bom', score: 4 },
    { word: 'ficou ótimo', score: 4 },
    { word: 'parabéns', score: 3 },
    { word: 'atendimento', score: 4 },
    { word: 'recomendo', score: 5 },
    { word: 'feedback', score: 4 },
    { word: 'ficou massa', score: 4 },
    { word: 'ficou tri', score: 4 },
    { word: 'ficou bão', score: 4 }
  ],
  reativacao: [
    { word: 'voltei', score: 5 },
    { word: 'estou aqui', score: 4 },
    { word: 'lembra de mim', score: 5 },
    { word: 'sumido', score: 4 },
    { word: 'voltar', score: 4 },
    { word: 'falar de novo', score: 5 },
    { word: 'retomar', score: 5 },
    { word: 'reapareci', score: 4 },
    { word: 'vamos continuar', score: 4 },
    { word: 'posso voltar', score: 5 }
  ],
  encerramento: [
    { word: 'obrigado', score: 3 },
    { word: 'valeu', score: 3 },
    { word: 'por enquanto não', score: 5 },
    { word: 'não tenho interesse', score: 5 },
    { word: 'outra hora', score: 4 },
    { word: 'deixo pra depois', score: 5 },
    { word: 'não quero agora', score: 5 },
    { word: 'mais pra frente', score: 4 },
    { word: 'agradeço o contato', score: 5 },
    { word: 'qualquer coisa eu falo', score: 4 }
  ]
};
