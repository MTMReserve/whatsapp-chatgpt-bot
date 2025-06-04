import { pool } from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { logger } from '../utils/logger';
import { CampoCliente } from '../types/CampoCliente';
import type { Client } from '../types/Client'; // ✅ Importação oficial

export class ClientRepository {
  static async create(data: Omit<Client, 'id'>): Promise<Client> {
    logger.info(`[ClientRepository] Criando cliente: ${data.phone}`);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO clients (name, phone) VALUES (?, ?)',
      [data.name, data.phone]
    );
    const id = result.insertId;
    return { id, name: data.name, phone: data.phone } as Client;
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
      await this.create({ name: 'Cliente', phone } as Omit<Client, 'id'>);
      client = await this.findByPhone(phone);
    }

    // ✅ Correção: tratar nome padrão "Cliente" como valor inválido
    if (client?.name?.toLowerCase() === 'cliente') {
      logger.debug(`[ClientRepository] Ignorando nome padrão "Cliente" — será tratado como null`);
      client.name = null;
    }

    return client!;
  }

  static async updateState(phone: string, state: string): Promise<void> {
    logger.info(`[ClientRepository] Atualizando estado do cliente: ${phone} → ${state}`);
    await pool.query(
      'UPDATE clients SET current_state = ?, retries = 0 WHERE phone = ?',
      [state, phone]
    );
    logger.debug(`[ClientRepository] current_state atualizado para '${state}' e retries resetado`);
  }

  static async updateField(
    phone: string,
    field: CampoCliente,
    value: any
  ): Promise<boolean> {
    const camposValidos: (keyof Client)[] = [
      'name', 'phone', 'current_state', 'needs', 'budget', 'negotiated_price', 'address',
      'payment_method', 'schedule_time', 'feedback', 'reactivation_reason', 'attempted_solutions',
      'expectations', 'urgency_level', 'client_stage', 'objection_type', 'purchase_intent',
      'scheduling_preference', 'disponibilidade', 'motivo_objeção', 'alternativa', 'desconto',
      'forma_pagamento', 'confirmacao', 'indicacao', 'retries', 'has_greeted',
      'last_interaction', 'created_at', 'updated_at', 'produto_id' // ✅ incluído
    ];

    if (!camposValidos.includes(field as keyof Client)) {
      const msg = `[ClientRepository] ❌ Campo inválido (não está na interface Client): ${field}`;
      logger.error(msg);
      throw new Error(msg);
    }

    logger.info(`[ClientRepository] Atualizando campo ${field} para ${phone}: ${value}`);
    const query = `UPDATE clients SET \`${field}\` = ? WHERE phone = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, [value, phone]);
    logger.debug(`[ClientRepository] Resultado do update:`, result);

    return 'affectedRows' in result && result.affectedRows > 0;
  }

  static async updateRetries(phone: string, retries: number): Promise<void> {
    logger.debug(`[ClientRepository] Atualizando retries para ${phone}: ${retries}`);
    await pool.query(
      'UPDATE clients SET retries = ? WHERE phone = ?',
      [retries, phone]
    );
    logger.info(`[ClientRepository] retries atualizado para ${retries} no cliente ${phone}`);
  }

  static async updateLastInteraction(clientId: number): Promise<void> {
    try {
      await pool.query(
        `UPDATE clients SET last_interaction = CURRENT_TIMESTAMP WHERE id = ?`,
        [clientId]
      );
      logger.debug(`[ClientRepository] last_interaction atualizada para cliente ID ${clientId}`);
    } catch (error) {
      logger.error(`[ClientRepository] ❌ Erro ao atualizar last_interaction`, error);
    }
  }

  // Métodos de instância — reaproveitam os estáticos
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
    field: CampoCliente,
    value: any
  ): Promise<boolean> {
    return ClientRepository.updateField(phone, field, value);
  }
  updateRetriesInstance(phone: string, retries: number): Promise<void> {
    return ClientRepository.updateRetries(phone, retries);
  }
}
