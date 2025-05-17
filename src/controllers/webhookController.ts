import { Request, Response } from 'express';
import { downloadMedia, sendAudio, sendText } from '../api/whatsapp';
import { audioService } from '../services/audioService';
import { handleMessage } from '../services/conversationManager';
import { logger } from '../utils/logger';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'verificabotaloco123';

/**
 * Validação do webhook (GET da Meta)
 */
export function verifyWebhook(req: Request, res: Response): Response {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('🟡 Verificação recebida');
  logger.debug(`🔍 Token recebido da URL: ${token}`);
  logger.debug(`🔐 Token do .env: ${VERIFY_TOKEN}`);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logger.info(`✅ Verificação aceita. Respondendo com challenge: ${challenge}`);
    return res.status(200).send(challenge);
  } else {
    logger.warn('❌ Verificação falhou');
    return res.sendStatus(403);
  }
}

/**
 * Processamento de mensagens recebidas (POST)
 */
export async function handleWebhook(req: Request, res: Response): Promise<Response> {
  const timestamp = Date.now();
  logger.info(`⚡ Novo webhook POST recebido — timestamp=${timestamp}`);
  logger.debug('[webhook] Payload recebido:', req.body);

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages) {
      logger.info('⚡ Evento de status recebido, ignorando.');
      return res.sendStatus(200);
    }

    const message = messages?.[0];
    const phone = message?.from;

    logger.debug('📥 Mensagem recebida:', { message });
    logger.info(`[webhook] ▶️ Webhook recebido para ${phone}, timestamp=${timestamp}`);

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    // ✅ Bloqueio de execução duplicada
    const messageId = message.id;
    const cacheKey = `msg-${messageId}`;
    if ((global as any)[cacheKey]) {
      logger.warn(`[webhook] 🚫 Mensagem duplicada detectada: ${messageId}`);
      return res.sendStatus(200);
    }
    (global as any)[cacheKey] = true;

    if (message.type === 'audio') {
      try {
        const mediaId = message.audio.id;
        const audioBuffer = await downloadMedia(mediaId);
        const transcribedText = await audioService.transcribeAudio(audioBuffer);

        logger.debug(`[webhook] Áudio transcrito: ${transcribedText}`);

        const response = await handleMessage(phone, transcribedText, { isAudio: true });

        if (response.audioBuffer) {
          await sendAudio(phone, response.audioBuffer);
        } else if (response.text) {
          await sendText(phone, response.text);
        }
      } catch (err) {
        logger.error('[webhook] Erro no processamento de áudio', { error: err });
        await sendText(phone, 'Desculpe, não consegui entender o áudio. Pode repetir?');
      }
    } else if (message.type === 'text') {
      const text = message.text.body;
      logger.debug(`[webhook] Texto recebido: ${text}`);
      const response = await handleMessage(phone, text, { isAudio: false });

      if (response.audioBuffer) {
        await sendAudio(phone, response.audioBuffer);
      } else if (response.text) {
        await sendText(phone, response.text);
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    logger.error('[webhook] Erro inesperado no webhook', { error: err });
    return res.sendStatus(500);
  }
}
