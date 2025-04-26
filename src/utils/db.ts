// ===============================
// File: src/utils/db.ts
// ===============================
import mysql, { Pool } from 'mysql2/promise';
import { getEnv } from '../config/env';
import { logger } from './logger';

let pool: Pool;

/**
 * Cria o pool de conexões MySQL usando valores já validados em getEnv()
 */
export function createDbPool(): void {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = getEnv();

  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: 'utf8mb4_unicode_ci',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  logger.info('✅ Pool de conexão MySQL criado.');
}

/**
 * Executa um SELECT 1 como teste de conexão
 */
export async function testDbConnection(): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT 1');
    logger.info(`✅ Conexão com o banco de dados bem-sucedida: ${JSON.stringify(rows)}`);
  } catch (err) {
    logger.error('❌ Falha ao testar conexão com o banco de dados:', err);
    process.exit(1);
  }
}

/**
 * Retorna o pool de conexão (lança erro se não inicializado)
 */
export function getDbPool(): Pool {
  if (!pool) {
    throw new Error('Pool de conexão não inicializado. Chame createDbPool() antes.');
  }
  return pool;
}
