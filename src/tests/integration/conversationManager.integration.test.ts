import { pool } from '../../../src/utils/db';
import { handleMessage } from '../../../src/services/conversationManager';
import { ClientRepository } from '../../../src/services/clientRepository';

describe('ConversationManager – Integração com banco de dados', () => {
  const testPhone = '5599999999999';

  beforeAll(async () => {
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
});
