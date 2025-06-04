import mongoose from 'mongoose';
import { connectMongo } from '@/utils/mongo';
import { saveInteractionLog, getConversationByPhone } from '@/repositories/mongo/interactionLog.mongo';
import { logger } from '@/utils/logger';

const phone = '5511999999999';
const payload = {
  phone,
  clientId: 999,
  messageIn: 'Olá, quero saber o preço do serviço.',
  messageOut: 'Claro! O valor varia de acordo com o tipo de barba. Posso te passar detalhes?',
  detectedIntent: 'interesse_preco',
  stateBefore: 'abordagem',
  stateAfter: 'levantamento',
  responseTimeMs: 1032,
  createdAt: new Date()
};

describe('[MongoDB] Integração completa com InteractionModel', () => {
  beforeAll(async () => {
    logger.info('[test] ⏳ Conectando ao MongoDB...');
    await connectMongo();
    logger.info('[test] ✅ Conectado com sucesso');
  });

  afterAll(async () => {
    logger.info('[test] 🔌 Encerrando conexão com MongoDB...');
    await mongoose.disconnect();
  });

  it('deve salvar corretamente uma nova interação no MongoDB', async () => {
    await expect(saveInteractionLog(payload)).resolves.not.toThrow();
  });

  it('deve retornar o histórico contendo a interação salva', async () => {
    const historico = await getConversationByPhone(phone);
    expect(Array.isArray(historico)).toBe(true);
    expect(historico.length).toBeGreaterThan(0);

    const ultima = historico[historico.length - 1];
    expect(ultima.phone).toBe(payload.phone);
    expect(ultima.messageIn).toBe(payload.messageIn);
    expect(ultima.messageOut).toBe(payload.messageOut);
    expect(ultima.detectedIntent).toBe(payload.detectedIntent);
    expect(ultima.stateBefore).toBe(payload.stateBefore);
    expect(ultima.stateAfter).toBe(payload.stateAfter);
  });
});
