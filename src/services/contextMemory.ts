import { pool } from '../utils/db';
import { logger } from '../utils/logger';

export async function setContextVar(
  clientId: number,
  key: string,
  value: string
): Promise<void> {
  try {
    const query = `
      INSERT INTO context_vars (client_id, var_key, var_value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE var_value = VALUES(var_value)
    `;
    await pool.query(query, [clientId, key, value]);
    logger.info(`[contextMemory] 💾 Variável "${key}" salva para cliente ID ${clientId}`);
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao salvar variável de contexto: ${key}`, error);
  }
}

export async function getContextVar(
  clientId: number,
  key: string
): Promise<string | null> {
  try {
    const [rows] = await pool.query(
      `SELECT var_value FROM context_vars WHERE client_id = ? AND var_key = ?`,
      [clientId, key]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return (rows[0] as any).var_value;
    }

    return null;
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao buscar variável "${key}":`, error);
    return null;
  }
}

export async function getAllContextVars(clientId: number): Promise<Record<string, string>> {
  try {
    const [rows] = await pool.query(
      `SELECT var_key, var_value FROM context_vars WHERE client_id = ?`,
      [clientId]
    );

    const result: Record<string, string> = {};
    (rows as any[]).forEach((row) => {
      result[row.var_key] = row.var_value;
    });

    return result;
  } catch (error) {
    logger.error(`[contextMemory] ❌ Erro ao buscar todas variáveis do cliente ${clientId}:`, error);
    return {};
  }
}
