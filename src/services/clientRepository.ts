import { pool } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { logger } from '../utils/logger';

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
  retries?: number;
  has_greeted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ClientRepository {
  static async create(data: Omit<Client, 'id'>): Promise<Client> {
    logger.info(`[ClientRepository] Criando cliente: ${data.phone}`);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO clients (name, phone) VALUES (?, ?)',
      [data.name, data.phone]
    );
    const id = result.insertId;
    return { id, name: data.name, phone: data.phone };
  }

  static async getAll(): Promise<Client[]> {
    logger.debug('[ClientRepository] Buscando todos os clientes');
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM clients');
    return rows as Client[];
  }

  static async findById(id: number): Promise<Client> {
    logger.debug(`[ClientRepository] Buscando cliente por ID: ${id}`);
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    return rows[0] as Client;
  }

  static async findByPhone(phone: string): Promise<Client | null> {
    logger.debug(`[ClientRepository] Buscando cliente por telefone: ${phone}`);
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM clients WHERE phone = ?',
      [phone]
    );
    return rows.length > 0 ? (rows[0] as Client) : null;
  }

  static async findOrCreate(phone: string): Promise<Client> {
    let client = await this.findByPhone(phone);
    if (!client) {
      logger.warn(`[ClientRepository] Cliente não encontrado, criando novo para: ${phone}`);
      await this.create({ name: 'Cliente', phone });
      client = await this.findByPhone(phone);
    }
    return client!;
  }

  static async updateState(phone: string, state: string): Promise<void> {
    logger.info(`[ClientRepository] Atualizando estado do cliente: ${phone} → ${state}`);
    await pool.query(
      'UPDATE clients SET current_state = ? WHERE phone = ?',
      [state, phone]
    );
  }

  static async updateField(
    phone: string,
    field: keyof Client,
    value: any
  ): Promise<void> {
    const allowedFields: (keyof Client)[] = [
      'name', // ✅ Campo liberado com segurança
      'current_state',
      'needs',
      'budget',
      'negotiated_price',
      'address',
      'payment_method',
      'feedback',
      'reactivation_reason',
      'has_greeted'
    ];
    if (!allowedFields.includes(field)) {
      const msg = `[ClientRepository] Campo não permitido para update: ${field}`;
      logger.error(msg);
      throw new Error(msg);
    }
    logger.info(`[ClientRepository] Atualizando campo ${field} para ${phone}: ${value}`);
    const query = `UPDATE clients SET \`${field}\` = ? WHERE phone = ?`;
    await pool.query(query, [value, phone]);
  }

  static async updateRetries(phone: string, retries: number): Promise<void> {
    logger.debug(`[ClientRepository] Atualizando retries para ${phone}: ${retries}`);
    await pool.query(
      'UPDATE clients SET retries = ? WHERE phone = ?',
      [retries, phone]
    );
  }

  // Instâncias auxiliares
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
  updateFieldInstance(
    phone: string,
    field: keyof Client,
    value: any
  ): Promise<void> {
    return ClientRepository.updateField(phone, field, value);
  }
  updateRetriesInstance(phone: string, retries: number): Promise<void> {
    return ClientRepository.updateRetries(phone, retries);
  }
}
