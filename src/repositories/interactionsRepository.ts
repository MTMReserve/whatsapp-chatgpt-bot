import { pool } from '../utils/db';
import { logger } from '../utils/logger';

export interface InteractionRecord {
  clientId: number;
  messageIn: string;
  messageOut: string;
  detectedIntent: string;
  stateBefore: string;
  stateAfter: string;
}

export async function saveInteraction(interaction: InteractionRecord): Promise<void> {
  try {
    const query = `
      INSERT INTO interactions 
        (client_id, message_in, message_out, detected_intent, state_before, state_after)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      interaction.clientId,
      interaction.messageIn,
      interaction.messageOut,
      interaction.detectedIntent,
      interaction.stateBefore,
      interaction.stateAfter,
    ];

    await pool.query(query, values);
    logger.info(`[interactions] 💾 Interação salva para cliente ID ${interaction.clientId}`);
  } catch (error) {
    logger.error('[interactions] ❌ Erro ao salvar interação:', error);
  }
}

export async function getLastInteractionsByClient(
  clientId: number,
  limit: number = 10
): Promise<any[]> {
  try {
    const [rows] = await pool.query(
      `
      SELECT * FROM interactions 
      WHERE client_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
      [clientId, limit]
    );
    return rows as any[];
  } catch (error) {
    logger.error('[interactions] ❌ Erro ao buscar histórico de interações:', error);
    return [];
  }
}
