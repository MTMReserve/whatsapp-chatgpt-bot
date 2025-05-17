import { pool } from '../../../src/utils/db';
import { handleMessage } from '../../../src/services/conversationManager';
import { ClientRepository } from '../../../src/services/clientRepository';

// 👇 Importa e prepara mock do fallback de intenção
import * as intentFallback from '../../../src/services/intentFallback';

describe('ConversationManager – Integração com banco de dados', () => {
  const testPhone = '5599999999999';

  beforeAll(async () => {
    // Garante que a tabela clients exista com todas as colunas necessárias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100),
        phone VARCHAR(20),
        current_state VARCHAR(50) DEFAULT 'abordagem',
        retries INT DEFAULT 0,
        needs TEXT,
        budget INT
      );
    `);
    await pool.query('DELETE FROM clients WHERE phone = ?', [testPhone]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM clients WHERE phone = ?', [testPhone]);
    await pool.end(); // encerra conexão com o pool
  });

  it('deve criar cliente e salvar necessidades (etapa levantamento)', async () => {
    const res = await handleMessage(testPhone, 'Quero escurecer minha barba', { isAudio: false });

    const client = await ClientRepository.findByPhone(testPhone);

    expect(client).not.toBeNull();
    expect(client!.phone).toBe(testPhone);
    expect(client!.current_state).toBe('levantamento');
    expect(client!.needs).toContain('escurecer');

    expect(res.text).toBeDefined();
    expect(typeof res.text).toBe('string');
  });

  it('deve avançar para proposta e salvar orçamento', async () => {
    const res = await handleMessage(testPhone, 'quero gastar até 150 reais', { isAudio: false });

    const client = await ClientRepository.findByPhone(testPhone);

    expect(client).not.toBeNull();
    expect(client!.current_state).toBe('proposta');
    expect(client!.budget).toBe(150);

    expect(res.text).toBeDefined();
    expect(typeof res.text).toBe('string');
  });

  it('deve acionar fallback de IA quando a intenção não for reconhecida', async () => {
    // 👇 Mocka o fallback da IA para sempre retornar "levantamento"
    jest.spyOn(intentFallback, 'getFallbackIntent').mockResolvedValue('levantamento');

    const res = await handleMessage(testPhone, 'mensagem aleatória sem intenção mapeada', { isAudio: false });
    const client = await ClientRepository.findByPhone(testPhone);

    expect(client).not.toBeNull();
    expect(client!.current_state).toBe('levantamento'); // intenção simulada pela IA
    expect(res.text).toBeDefined();
    expect(typeof res.text).toBe('string');

    // 🔄 Limpa o mock após o teste
    jest.restoreAllMocks();
  });
});
