// src/services/resumoDoHistorico.ts

import type { Client } from './clientRepository';
import { ClientRepository } from './clientRepository';
import { logger } from '../utils/logger';

/**
 * Gera um resumo estratégico da conversa com base nos dados salvos no MySQL (tabela clients)
 */
export async function gerarResumoDoHistorico(phone: string): Promise<string> {
  logger.debug(`[resumoDoHistorico] Iniciando leitura do histórico do cliente ${phone}`);

  try {
    const cliente = await ClientRepository.findByPhone(phone);
    if (!cliente) {
      logger.warn(`[resumoDoHistorico] Cliente com telefone ${phone} não encontrado no banco.`);
      return '';
    }

    const partes: string[] = [];

    if (cliente.name) {
      partes.push(`Cliente identificado como ${cliente.name}.`);
      logger.debug(`[resumoDoHistorico] name: ${cliente.name}`);
    }

    const campos: [string, string | null | undefined][] = [
      ['needs', cliente.needs],
      ['attempted_solutions', (cliente as any).attempted_solutions],
      ['expectations', (cliente as any).expectations],
      ['urgency_level', (cliente as any).urgency_level],
      ['client_stage', (cliente as any).client_stage],
      ['objection_type', (cliente as any).objection_type],
      ['purchase_intent', (cliente as any).purchase_intent],
      ['scheduling_preference', (cliente as any).scheduling_preference],
      ['reactivation_reason', cliente.reactivation_reason],
      ['feedback', cliente.feedback],
    ];

    campos.forEach(([label, valor]) => {
      if (valor) {
        partes.push(`${label.replace(/_/g, ' ')}: ${valor}`);
        logger.debug(`[resumoDoHistorico] ${label}: ${valor}`);
      }
    });

    if (partes.length === 0) {
      logger.info('[resumoDoHistorico] Nenhuma informação relevante encontrada para montar o resumo.');
      return '';
    }

    return partes.join(' ');
  } catch (error) {
    logger.error('[resumoDoHistorico] ❌ Erro ao gerar resumo do cliente', { error });
    return '';
  }
}
