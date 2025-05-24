// src/services/reengagementService.ts

/**
 * 🧠 MÓDULO DE REENGAJAMENTO – RASCUNHO FUNCIONAL
 * 
 * Este módulo foi criado com o objetivo de reengajar clientes inativos
 * com base na última interação registrada no banco MySQL (tabela `clients`).
 * 
 * 📌 ATENÇÃO:
 * - Esta lógica ainda não está finalizada nem automatizada.
 * - Atualmente, nenhuma função chama este serviço de forma automática.
 * - O MongoDB NÃO é necessário aqui (não usado).
 * 
 * ✅ Responsabilidades:
 * - Consultar clientes com `last_interaction` inativo há X dias
 * - Emitir logs com esses clientes
 * - (Futuramente) disparar mensagens automáticas via WhatsApp
 * - (Opcional) agendar essa função com `cron` para execução diária
 * 
 * 🔧 ERRO CORRIGIDO:
 * O erro de build do TypeScript foi resolvido com a checagem `Array.isArray(rows)`
 * para garantir segurança no acesso a `.length`.
 */

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
 * 🔍 Busca clientes inativos (último contato > X dias atrás)
 * 
 * ⚠️ Proteção adicionada contra erros de tipagem do retorno da query.
 * TypeScript acusava erro por `rows` poder ser `OkPacket` ao invés de `RowDataPacket[]`.
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

    const results = Array.isArray(rows) ? rows : []; // ✅ Corrige erro de build
    logger.info(`[reengagement] 🔍 ${results.length} clientes inativos há mais de ${days} dias encontrados.`);
    return results as ReengagementClient[];
  } catch (err) {
    logger.error('[reengagement] ❌ Erro ao buscar clientes inativos', { error: err });
    return [];
  }
}

/**
 * 📩 Envia mensagem de reengajamento empática
 * 
 * ⚠️ Essa mensagem é fixa por enquanto. No futuro, pode ser personalizada com base no estágio.
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
 * 🧪 Executa o ciclo completo: busca inativos + envia mensagem
 * 
 * ✅ Essa função pode ser agendada futuramente com node-cron, por exemplo:
 * 
 * ```ts
 * import cron from 'node-cron';
 * cron.schedule('0 9 * * *', () => {
 *   executeReengagement(3); // reengajar após 3 dias de inatividade
 * });
 * ```
 * 
 * Ou chamada por um loop interno via setInterval:
 * 
 * ```ts
 * setInterval(() => {
 *   executeReengagement(3);
 * }, 24 * 60 * 60 * 1000); // a cada 24 horas
 * ```
 */
export async function executeReengagement(days: number): Promise<void> {
  const clientes = await getInactiveClients(days);
  for (const cliente of clientes) {
    await sendReengagementMessage(cliente);
  }
}
