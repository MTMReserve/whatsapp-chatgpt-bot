// src/services/reengagementService.ts

import { pool } from '../utils/db';
import { logger } from '../utils/logger';
import { sendText } from '../api/whatsapp';

interface ReengagementClient {
  id: number;
  name: string;
  phone: string;
  current_state: string;
  last_interaction: Date;
}

/**
 * Busca clientes que estão inativos há mais de X dias
 */
export async function getInactiveClients(days: number): Promise<ReengagementClient[]> {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, phone, current_state, last_interaction
       FROM clients
       WHERE last_interaction IS NOT NULL
         AND last_interaction < NOW() - INTERVAL ? DAY
         AND current_state NOT IN ('encerramento', 'pos_venda')`,
      [days]
    );
    logger.info(`[reengagement] 🔍 ${rows.length} clientes inativos há mais de ${days} dias encontrados.`);
    return rows as ReengagementClient[];
  } catch (err) {
    logger.error('[reengagement] ❌ Erro ao buscar clientes inativos', { error: err });
    return [];
  }
}

/**
 * Envia uma mensagem empática para retomar contato
 */
export async function sendReengagementMessage(client: ReengagementClient): Promise<void> {
  const mensagem = `Oi ${client.name},

Notei que nossa última conversa foi há alguns dias e fiquei pensando se você ainda gostaria de continuar de onde paramos. Posso te ajudar com algo relacionado à etapa "${client.current_state}"? 😊

Se precisar de mim, estou por aqui!`;

  try {
    await sendText(client.phone, mensagem);
    logger.info(`[reengagement] 📩 Mensagem de reengajamento enviada para ${client.phone}`);
  } catch (err) {
    logger.error(`[reengagement] ❌ Falha ao enviar mensagem para ${client.phone}`, { error: err });
  }
}

/**
 * Executa o ciclo completo de reengajamento para X dias de inatividade
 */
export async function executeReengagement(days: number): Promise<void> {
  const clientes = await getInactiveClients(days);
  for (const cliente of clientes) {
    await sendReengagementMessage(cliente);
  }
}
