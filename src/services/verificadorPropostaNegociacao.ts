// ===============================
// File: src/services/verificadorPropostaNegociacao.ts
// ===============================

import { logger } from '../utils/logger';
import { saveNegociacaoLog } from '../repositories/mongo/logsEstrategia.mongo';

interface VerificadorInput {
  textoGerado: string;
  etapaAtual: string;
  temperaturaAnterior: number;
  phone: string;
}

interface VerificadorOutput {
  deveRefazerComMaisTemperatura: boolean;
  novaTemperatura: number;
}

// Lista de palavras que indicam presença de argumento ou proposta
const palavrasChaveComerciais = [
  'desconto',
  'promoção',
  'garantia',
  'condição especial',
  'parcelado',
  'à vista',
  'pix',
  'valor',
  'bônus',
  'investimento',
  'vale a pena',
  'tranquilidade'
];

/**
 * Verifica se a resposta da IA na etapa de negociação contém conteúdo estratégico mínimo.
 * Caso não contenha, recomenda reenviar com temperatura maior.
 */
export async function verificadorPropostaNegociacao({
  textoGerado,
  etapaAtual,
  temperaturaAnterior,
  phone
}: VerificadorInput): Promise<VerificadorOutput> {
  if (etapaAtual !== 'negociacao') {
    return {
      deveRefazerComMaisTemperatura: false,
      novaTemperatura: temperaturaAnterior
    };
  }

  const frases = textoGerado
    .split(/[.!?]\s/)
    .map((f) => f.trim())
    .filter(Boolean);

  const contemPalavraChave = palavrasChaveComerciais.some((palavra) =>
    textoGerado.toLowerCase().includes(palavra)
  );

  const respostaÉCurta = frases.length < 2;

  if (respostaÉCurta && !contemPalavraChave) {
    const novaTemperatura = Math.min(temperaturaAnterior + 0.2, 0.95);

    const alerta = `[verificadorPropostaNegociacao] ⚠️ Resposta fraca detectada na etapa de negociação:
Telefone: ${phone}
Temperatura anterior: ${temperaturaAnterior}
Temperatura ajustada: ${novaTemperatura}
Texto gerado: "${textoGerado}"`;

    logger.warn(alerta);

    await saveNegociacaoLog({
      phone,
      etapa: 'negociacao',
      resposta_original: textoGerado,
      causas_rejeicao: ['resposta_curta_sem_argumento'],
      nova_tentativa: 'a definir',
      createdAt: new Date()
    });

    return {
      deveRefazerComMaisTemperatura: true,
      novaTemperatura
    };
  }

  return {
    deveRefazerComMaisTemperatura: false,
    novaTemperatura: temperaturaAnterior
  };
}
