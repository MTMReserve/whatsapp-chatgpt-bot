import { handleMessage } from '@/services/conversationManager';
import { pool } from '@/utils/db';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.test' });

describe('ConversationManager – Integração real com IA, MySQL e MongoDB', () => {
  const testPhone = '+5511999999999';
  const testMessage = 'Oi, quero saber mais sobre o produto';
  const outputDir = path.resolve(__dirname, '../../../logs/ia_respostas');
  const mongoUri = process.env.MONGO_URI!;

  beforeAll(async () => {
    // Conexão com MySQL
    await pool.query('SELECT 1');

    // Limpa interações do MongoDB para esse telefone
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db();
    await db.collection('interactions').deleteMany({ phone: testPhone });
    await mongoClient.close();

    // Cria pasta de saída, se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  it('deve processar mensagem e retornar texto da IA + áudio', async () => {
    const resultado = await handleMessage(testPhone, testMessage, { isAudio: true });

    // Exibe no terminal
    console.log('Texto da IA:', resultado.text);
    if (resultado.audioBuffer) {
      console.log('🎧 Áudio gerado com sucesso');
    }

    // Salva resposta da IA em arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(outputDir, `resposta_${timestamp}.txt`);
    fs.writeFileSync(filename, resultado.text, 'utf-8');

    // Verificações
    expect(resultado.text).toBeDefined();
    expect(resultado.text.length).toBeGreaterThan(5);
    expect(resultado.audioBuffer).toBeInstanceOf(Buffer);
    expect(resultado.audioBuffer!.length).toBeGreaterThan(0);
  });
});
