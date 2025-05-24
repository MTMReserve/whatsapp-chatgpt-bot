// src/tests/integration/test-mongo.test.ts

import { connectMongo } from 'utils/mongo';
import { saveInteractionLog, getConversationByPhone } from 'repositories/mongo/interactionLog.mongo';
import { logger } from 'utils/logger';

const sampleData = {
  phone: '5511999999999',
  messageIn: 'Olá, tudo bem?',
  messageOut: 'Olá! Tudo sim e você? Em que posso te ajudar?',
  detectedIntent: 'cumprimento',
  stateBefore: 'abordagem',
  stateAfter: 'levantamento',
  responseTimeMs: 350,
  createdAt: new Date()
};

describe('[MongoDB] Integração completa com logs', () => {
  beforeAll(async () => {
    logger.info('[MongoTest] ▶️ Conectando ao MongoDB para testes...');
    await connectMongo();
  });

  it('🧪 Deve salvar uma interação no MongoDB com sucesso', async () => {
    const inicio = Date.now();
    logger.info('[MongoTest] Iniciando teste de salvamento...');
    try {
      await expect(saveInteractionLog(sampleData)).resolves.toBeUndefined();
      logger.info('[MongoTest] ✅ Interação salva com sucesso!');
    } catch (err) {
      console.error('[MongoTest] ❌ Erro ao salvar interação:', err);
      throw err;
    } finally {
      logger.debug(`[MongoTest] ⏱️ Duração: ${Date.now() - inicio}ms`);
    }
  });

  it('📖 Deve buscar o histórico completo por telefone', async () => {
    const inicio = Date.now();
    logger.info('[MongoTest] Iniciando teste de busca por telefone...');
    try {
      const result = await getConversationByPhone(sampleData.phone);
      logger.debug('[MongoTest] 🔍 Resultado da busca:', result);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const last = result[result.length - 1];
      expect(last.phone).toBe(sampleData.phone);
      expect(last.messageIn).toBe(sampleData.messageIn);

      logger.info('[MongoTest] ✅ Histórico carregado corretamente.');
    } catch (err) {
      console.error('[MongoTest] ❌ Erro ao buscar histórico:', err);
      throw err;
    } finally {
      logger.debug(`[MongoTest] ⏱️ Duração: ${Date.now() - inicio}ms`);
    }
  });
});
