// src/services/verificadorContradicoes.ts

import type { Client } from '../types/Client';
import { logger } from '../utils/logger';
import { getMetasDaEtapa } from './metaPorEtapa'; // ✅ Corrigido caminho do import

/**
 * Analisa se há contradições nos dados do cliente com base nas metas da etapa.
 * Por exemplo: cliente afirmou interesse, mas também disse que não tem dinheiro.
 *
 * Retorna uma lista de alertas e possíveis inconsistências.
 */
export function verificarContradicoes(client: Client, etapa: string): string[] {
  const alertas: string[] = [];
  const metas = getMetasDaEtapa(etapa as any);

  logger.debug(`[verificadorContradicoes] Verificando contradições para etapa: ${etapa}`);

  // Exemplo 1: Interesse declarado mas sem forma de pagamento
  if (
    metas.includes('purchase_intent') &&
    client.purchase_intent?.toLowerCase().includes('sim') &&
    (!client.payment_method || client.payment_method.trim() === '')
  ) {
    alertas.push('⚠️ Cliente demonstrou intenção de compra mas não informou forma de pagamento.');
  }

  // Exemplo 2: Orçamento muito abaixo do valor médio
  if (client.budget) {
    const valor = parseFloat(client.budget.replace(/[^\d,\.]/g, '').replace(',', '.'));
    if (!isNaN(valor) && valor < 200) {
      alertas.push('⚠️ Orçamento informado está muito abaixo do valor médio.');
    }
  }

  // Exemplo 3: Cliente confirmou fechamento, mas não passou endereço
  if (
    etapa === 'fechamento' &&
    client.confirmacao?.toLowerCase().includes('sim') &&
    (!client.address || client.address.trim() === '')
  ) {
    alertas.push('⚠️ Cliente confirmou o fechamento, mas o endereço está ausente.');
  }

  logger.debug(`[verificadorContradicoes] Total de alertas gerados: ${alertas.length}`);
  return alertas;
}

/**
 * Detecta mudanças relevantes em campos sensíveis e retorna mensagem de validação.
 * Exemplo: se nome foi alterado, retorna "Você me disse outro nome antes..."
 */
export function verificarMudancaEmCampoSensivel(
  campo: string,
  valorNovo: string | null,
  valorAnterior: string | null
): string | null {
  if (!valorAnterior || !valorNovo) return null;
  if (valorAnterior.trim().toLowerCase() === valorNovo.trim().toLowerCase()) return null;

  const campoFormatado = campo === 'name' ? 'nome' :
                         campo === 'budget' ? 'orçamento' :
                         campo === 'address' ? 'endereço' :
                         campo === 'payment_method' ? 'forma de pagamento' :
                         campo === 'schedule_time' ? 'horário' : campo;

  return `🧐 Você me disse outro ${campoFormatado} antes... Posso confirmar que agora é "${valorNovo}" mesmo?`;
}
