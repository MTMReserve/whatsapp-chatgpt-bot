import { pool } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ✅ Atualizado com campos adicionais do funil
export interface Client {
  id: number;
  name: string;
  phone: string;
  current_state?: string;
  needs?: string;
  budget?: number;
  negotiated_price?: number;
  address?: string;
  payment_method?: string;
  feedback?: string;
  reactivation_reason?: string;
  created_at?: Date;
  updated_at?: Date;
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
      'SELECT * FROM clients'
    );
    return rows as Client[];
  }

  /** Busca um cliente pelo ID */
  static async findById(id: number): Promise<Client> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    return rows[0] as Client;
  }

  /** Busca um cliente pelo telefone */
  static async findByPhone(phone: string): Promise<Client | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM clients WHERE phone = ?',
      [phone]
    );
    return rows.length > 0 ? (rows[0] as Client) : null;
  }

  /** Cria cliente se não existir */
  static async findOrCreate(phone: string): Promise<Client> {
    let client = await this.findByPhone(phone);
    if (!client) {
      await this.create({ name: 'Cliente', phone });
      client = await this.findByPhone(phone);
    }
    return client!;
  }

  /** Atualiza o estado atual da conversa */
  static async updateState(phone: string, state: string): Promise<void> {
    await pool.query('UPDATE clients SET current_state = ? WHERE phone = ?', [state, phone]);
  }

  /** Atualiza dinamicamente um campo específico do cliente */
  static async updateField(phone: string, field: keyof Client, value: any): Promise<void> {
    const allowedFields: (keyof Client)[] = [
      'current_state',
      'needs',
      'budget',
      'negotiated_price',
      'address',
      'payment_method',
      'feedback',
      'reactivation_reason'
    ];
    if (!allowedFields.includes(field)) {
      throw new Error(`Campo não permitido: ${field}`);
    }
    const query = `UPDATE clients SET \`${field}\` = ? WHERE phone = ?`;
    await pool.query(query, [value, phone]);
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
  updateStateInstance(phone: string, state: string): Promise<void> {
    return ClientRepository.updateState(phone, state);
  }
  updateFieldInstance(phone: string, field: keyof Client, value: any): Promise<void> {
    return ClientRepository.updateField(phone, field, value);
  }
}
