// src/utils/db.ts

import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';
import { env } from '../config/env';

// Pool de conexão MySQL criado na importação, disponível para uso imediato.
export const pool: Pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Testa a conexão executando um SELECT 1 e encerra a aplicação em caso de falha.
 */
export async function testDbConnection(): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.info('✅ Conexão com o banco de dados bem-sucedida:', rows);
  } catch (error) {
    console.error('❌ Falha ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

/**
 * “Inicializa” (ou simplesmente retorna) o pool de conexões.
 */
export function createDbPool(): Pool {
  return pool;
}
