import { pool } from '../utils/db';
import { logger } from '../utils/logger';
import type { RowDataPacket } from 'mysql2';

/**
 * Insere ou atualiza uma variável de contexto para o cliente.
 */
export async function setContextVar(
  clientId: number,
  key: string,
  value: string
): Promise<void> {
  try {
    const query = `
      INSERT INTO context_vars (client_id, var_key, var_value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE var_value = VALUES(var_value), updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [clientId, key, value]);
    logger.info(`[contextMemory] 💾 Variável "${key}" salva/atualizada para client_id=${clientId}`);
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao salvar variável "${key}" para client_id=${clientId}`, error);
  }
}

/**
 * Recupera o valor de uma variável de contexto específica para o cliente.
 */
export async function getContextVar(
  clientId: number,
  key: string
): Promise<string | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT var_value FROM context_vars WHERE client_id = ? AND var_key = ?`,
      [clientId, key]
    );

    if (rows.length > 0) {
      logger.debug(`[contextMemory] 📥 Variável "${key}" lida para client_id=${clientId}`);
      return rows[0].var_value;
    } else {
      logger.warn(`[contextMemory] ⚠️ Variável "${key}" não encontrada para client_id=${clientId}`);
      return null;
    }
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao buscar variável "${key}" para client_id=${clientId}`, error);
    return null;
  }
}

/**
 * Retorna todas as variáveis de contexto de um cliente como objeto key-value.
 */
export async function getAllContextVars(clientId: number): Promise<Record<string, string>> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT var_key, var_value FROM context_vars WHERE client_id = ?`,
      [clientId]
    );

    const result: Record<string, string> = {};
    rows.forEach((row) => {
      result[row.var_key] = row.var_value;
    });

    logger.debug(`[contextMemory] 📦 ${rows.length} variáveis carregadas para client_id=${clientId}`);
    return result;
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao buscar todas variáveis para client_id=${clientId}`, error);
    return {};
  }
}

/**
 * Apaga todas as variáveis de contexto de um cliente.
 */
export async function clearContextVars(clientId: number): Promise<void> {
  try {
    await pool.query(`DELETE FROM context_vars WHERE client_id = ?`, [clientId]);
    logger.info(`[contextMemory] 🧹 Contexto apagado para client_id=${clientId}`);
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao apagar contexto para client_id=${clientId}`, error);
  }
}
