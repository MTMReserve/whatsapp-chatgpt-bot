import { pool } from '../../../src/utils/db';
import { handleMessage } from '../../../src/services/conversationManager';
import { ClientRepository } from '../../../src/services/clientRepository';
import * as mongoService from '../../../src/services/interactionMongoService';
jest.setTimeout(20000); // ou 30000 se for necessário


describe('ConversationManager – Fluxo completo do funil com persistência', () => {
  const phone = '5599999999999';

  const etapasSimuladas = [
    { input: 'Oi, tudo bem?', esperado: 'abordagem' },
    { input: 'Quero deixar minha barba mais escura.', esperado: 'levantamento' },
    { input: 'Tenho até 200 reais pra isso.', esperado: 'proposta' },
    { input: 'Não sei se vai combinar comigo...', esperado: 'objecoes' },
    { input: 'Tem como fazer um desconto?', esperado: 'negociacao' },
    { input: 'Fechado! Vamos agendar.', esperado: 'fechamento' },
    { input: 'Gostei do atendimento!', esperado: 'pos_venda' },
    { input: 'Sumido faz dias', esperado: 'reativacao' },
    { input: 'Quero parar de receber mensagens.', esperado: 'encerramento' }
  ];

  beforeAll(async () => {
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
    await pool.query('DELETE FROM clients WHERE phone = ?', [phone]);

    try {
      const mensagens = await mongoService.getConversationByPhone(phone);
      if (mensagens.length > 0) {
        console.warn(`⚠️ Histórico existente encontrado no Mongo. Total: ${mensagens.length}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('⚠️ Erro ao buscar histórico no Mongo, mas teste continuará:', msg);
    }
  });

  afterAll(async () => {
    await pool.query('DELETE FROM clients WHERE phone = ?', [phone]);
    await pool.end();
  });

  it('🧪 Deve percorrer todas as 9 etapas do funil e salvar em MySQL e MongoDB', async () => {
    for (const etapa of etapasSimuladas) {
      const res = await handleMessage(phone, etapa.input, { isAudio: false });

      const client = await ClientRepository.findByPhone(phone);
      let historico: mongoService.InteractionData[] = [];

      try {
        historico = await mongoService.getConversationByPhone(phone);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('⚠️ Erro ao buscar histórico no Mongo, mas teste continuará:', msg);
      }

      const ultimaMensagem = historico?.[historico.length - 1];

      // Verifica estado no MySQL
      expect(client).not.toBeNull();
      expect(client!.current_state).toBe(etapa.esperado);

      // Verifica persistência no MongoDB
      expect(ultimaMensagem?.phone).toBe(phone);
      expect(ultimaMensagem?.messageIn).toBe(etapa.input);

      // Verifica resposta do bot
      expect(res.text).toBeDefined();
      expect(typeof res.text).toBe('string');
    }
  }, 20000); // ⏱ timeout maior

  it('🚫 Deve rejeitar mudança indevida para "abordagem" após avançar', async () => {
    const res = await handleMessage(phone, 'oi de novo...', { isAudio: false });
    const client = await ClientRepository.findByPhone(phone);

    expect(client!.current_state).not.toBe('abordagem');
    expect(res.text).toBeDefined();
  }, 10000);
});
