// src/services/levantamentoAdaptativo.ts

import { analisarObjeçõesIA } from './objectionMonitor';
import { logger } from '../utils/logger';

/**
 * Decide o modo ideal de levantamento com base na análise de objeções do cliente.
 *
 * @param historico - Últimas mensagens do cliente (máx. 5)
 * @param executionId - ID opcional para rastreabilidade em logs
 * @returns 'leve' | 'profundo'
 */
export async function decidirModoLevantamento(
  historico: string[],
  executionId?: string
): Promise<'leve' | 'profundo'> {
  try {
    const objectionLevel = await analisarObjeçõesIA(historico, executionId);

    const modo: 'leve' | 'profundo' = objectionLevel === 'nenhuma' ? 'leve' : 'profundo';

    logger.info(`[levantamentoAdaptativo] [${executionId}] Modo decidido: '${modo}' (objectionLevel=${objectionLevel})`);

    return modo;
  } catch (error: any) {
    logger.error(`[levantamentoAdaptativo] [${executionId}] Erro ao decidir modo de levantamento: ${error.message}`);
    return 'profundo'; // fallback conservador
  }
}
