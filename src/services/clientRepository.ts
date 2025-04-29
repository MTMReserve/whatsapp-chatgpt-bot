import { pool } from '../utils/db';
import { RowDataPacket, OkPacket } from 'mysql2';

// Define a interface de Client
export interface Client {
  id?: number;
  name: string;
  phone: string;
}

export class ClientRepository {
  /** 
   * Cria um cliente no banco e retorna o objeto com o ID gerado.
   */
  static async create(data: Omit<Client, 'id'>): Promise<Client> {
    // NÃO use generics aqui: faça o cast manualmente
    const [result] = (await pool.query(
      'INSERT INTO clients (name, phone) VALUES (?, ?)',
      [data.name, data.phone]
    )) as [OkPacket, any];
    return { id: result.insertId, ...data };
  }

  /**
   * Retorna todos os clientes cadastrados.
   */
  static async getAll(): Promise<Client[]> {
    const [rows] = (await pool.query(
      'SELECT id, name, phone FROM clients'
    )) as [RowDataPacket[], any];
    return rows.map(r => ({ id: r.id, name: r.name, phone: r.phone }));
  }

  /**
   * Busca um cliente por ID, lance erro se não encontrar.
   */
  static async findById(id: number): Promise<Client> {
    const [rows] = (await pool.query(
      'SELECT id, name, phone FROM clients WHERE id = ?',
      [id]
    )) as [RowDataPacket[], any];
    if (rows.length === 0) throw new Error('Client not found');
    const r = rows[0];
    return { id: r.id, name: r.name, phone: r.phone };
  }

  // Métodos de instância para testes de integração
  create(data: Omit<Client, 'id'>): Promise<Client> {
    return ClientRepository.create(data);
  }
  getAll(): Promise<Client[]> {
    return ClientRepository.getAll();
  }
  findById(id: number): Promise<Client> {
    return ClientRepository.findById(id);
  }
}
