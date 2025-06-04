// src/services/metaPorEtapa.ts

import { logger } from '../utils/logger';
import { CampoCliente } from '../types/CampoCliente'; // ✅ Substituição aplicada

/**
 * Etapas formais do funil de vendas com nomenclatura padronizada.
 */
export type EtapaFunil =
  | 'abordagem'
  | 'levantamento'
  | 'proposta'
  | 'objecoes'
  | 'negociacao'
  | 'fechamento'
  | 'pos_venda'
  | 'reativacao'
  | 'encerramento';

/**
 * Mapeia quais campos devem ser obrigatoriamente extraídos em cada etapa.
 */
export const metasPorEtapa: Record<EtapaFunil, CampoCliente[]> = {
  abordagem: ['name'],
  levantamento: [
    'needs',
    'attempted_solutions',
    'expectations',
    'urgency_level',
    'client_stage',
    'disponibilidade'
  ],
  proposta: ['budget'],
  objecoes: ['objection_type', 'motivo_objeção', 'alternativa'],
  negociacao: ['negotiated_price', 'purchase_intent', 'desconto', 'forma_pagamento'],
  fechamento: ['address', 'payment_method', 'schedule_time', 'confirmacao'],
  pos_venda: ['feedback'],
  reativacao: ['reactivation_reason', 'indicacao'],
  encerramento: []
};

/**
 * Recupera os campos esperados para uma determinada etapa do funil.
 * Em caso de erro na etapa, gera log de aviso.
 */
export function getMetasDaEtapa(etapa: EtapaFunil): CampoCliente[] {
  const metas = metasPorEtapa[etapa];

  if (!metas) {
    logger.warn(`[metaPorEtapa] ⚠️ Etapa "${etapa}" não reconhecida. Nenhuma meta retornada.`);
    return [];
  }

  logger.debug(`[metaPorEtapa] 🔍 Metas esperadas para etapa "${etapa}": ${metas.join(', ')}`);
  return metas;
}
