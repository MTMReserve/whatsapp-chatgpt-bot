// src/utils/db.ts

import mysql, { Pool } from 'mysql2/promise';
import { loadEnv } from '../config/env';

// Carrega e valida as variáveis de ambiente
const env = loadEnv();

// Exporta o pool para que possa ser usado em testes e outros módulos
export const pool: Pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

/**
 * Função de bootstrap para criar/recuperar o pool de conexões MySQL
 */
export function createDbPool(): Pool {
  console.log('✅ Pool de conexão MySQL criado.');
  return pool;
}

/**
 * Testa conexão executando um SELECT 1 e encerra a aplicação em caso de falha
 */
export async function testDbConnection(): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Conexão com o banco de dados bem-sucedida:', rows);
  } catch (error) {
    console.error('❌ Falha ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}
