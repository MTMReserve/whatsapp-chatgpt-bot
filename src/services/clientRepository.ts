// src/services/clientRepository.ts

import { pool } from '../utils/db'

export interface Client {
  id?: number
  name: string
  phone: string
}

export class ClientRepository {
  /** Insere um cliente e retorna o objeto com o id gerado */
  static async create(client: Client): Promise<Client> {
    const [result] = await pool.query(
      'INSERT INTO clients (name, phone) VALUES (?, ?)',
      [client.name, client.phone]
    )
    const insertId = (result as any).insertId as number
    return { ...client, id: insertId }
  }

  /** Busca um cliente pelo ID ou retorna null se não existir */
  static async findById(id: number): Promise<Client | null> {
    const [rows] = await pool.query('SELECT id, name, phone FROM clients WHERE id = ?', [id])
    const data = (rows as any[])[0]
    return data ? { id: data.id, name: data.name, phone: data.phone } : null
  }
}
