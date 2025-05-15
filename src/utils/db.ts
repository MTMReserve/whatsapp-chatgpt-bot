// src/utils/db.ts

import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';
import { env } from '../config/env';
import { logger } from './logger'; // ✅ importação do logger

// Verifica se está em ambiente de teste para usar banco de teste
const isTestEnv = process.env.NODE_ENV === 'test';

// Cria o pool de conexão MySQL
export const pool: Pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: isTestEnv ? 'bot_whatsapp_test' : env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

logger.info(`[db] Pool de conexão criado para banco: ${isTestEnv ? 'bot_whatsapp_test' : env.DB_NAME}`);

/**
 * Testa a conexão executando um SELECT 1 e encerra a aplicação em caso de falha.
 */
export async function testDbConnection(): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT 1');
    logger.info('[db] ✅ Conexão com o banco de dados bem-sucedida:', rows);
  } catch (error) {
    logger.error('[db] ❌ Falha ao conectar ao banco de dados:', { error });
    process.exit(1);
  }
}

/**
 * “Inicializa” (ou simplesmente retorna) o pool de conexões.
 */
export function createDbPool(): Pool {
  logger.debug('[db] createDbPool() chamado');
  return pool;
}
