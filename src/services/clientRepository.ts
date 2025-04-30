// src/services/clientRepository.ts

import { pool } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Client {
  id: number;
  name: string;
  phone: string;
}

export class ClientRepository {
  /** Insere um cliente e retorna com o ID gerado */
  static async create(data: Omit<Client, 'id'>): Promise<Client> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO clients (name, phone) VALUES (?, ?)',
      [data.name, data.phone]
    );
    const id = result.insertId;

    return { id, name: data.name, phone: data.phone };
  }

  /** Retorna todos os clientes */
  static async getAll(): Promise<Client[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, phone FROM clients'
    );
    return rows.map(r => ({ id: r.id, name: r.name, phone: r.phone }));
  }

  /** Busca um cliente pelo ID */
  static async findById(id: number): Promise<Client> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, phone FROM clients WHERE id = ?',
      [id]
    );
    const row = rows[0];
    return { id: row.id, name: row.name, phone: row.phone };
  }

  // Instâncias para injeção/mocking, se necessário
  create(data: Omit<Client, 'id'>): Promise<Client> {
    return ClientRepository.create(data);
  }
  getAllInstances(): Promise<Client[]> {
    return ClientRepository.getAll();
  }
  findByIdInstance(id: number): Promise<Client> {
    return ClientRepository.findById(id);
  }
}
