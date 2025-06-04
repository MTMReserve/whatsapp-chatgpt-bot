import { Request, Response } from 'express';
import { downloadMedia, sendAudio, sendText } from '../api/whatsapp';
import { audioService } from '../services/audioService';
import { handleMessage } from '../services/conversationManager';
import { logger } from '../utils/logger';
import { simulateRealisticTyping } from '../utils/typingSimulator';

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

    if (!message || !phone || typeof phone !== 'string') {
      logger.warn('[webhook] 🔴 Número do remetente ausente ou inválido');
      return res.status(400).send('Número do remetente ausente ou inválido');
    }

    const messageId = message.id;
    const cacheKey = `msg-${messageId}`;
    if ((global as any)[cacheKey]) {
      logger.warn(`[webhook] 🚫 Mensagem duplicada detectada: ${messageId}`);
      return res.sendStatus(200);
    }
    (global as any)[cacheKey] = true;

    // 🔒 Segurança: só processa se for áudio ou texto
    if (message.type !== 'audio' && message.type !== 'text') {
      logger.warn(`[webhook] Tipo de mensagem ignorado: ${message.type}`);
      return res.sendStatus(200);
    }

    if (message.type === 'audio') {
      try {
        const mediaId = message.audio.id;
        const audioBuffer = await downloadMedia(mediaId);
        const transcribedText = await audioService.transcribeAudio(audioBuffer);

        logger.debug(`[webhook] Áudio transcrito: ${transcribedText}`);
        logger.info(`[mensagem] 📥 Mensagem recebida do cliente (${phone}): "${transcribedText}"`);

        const response = await handleMessage(phone, transcribedText, 'produto1');

        if (response.audioBuffer) {
          await simulateRealisticTyping(async () => {
            await sendAudio(phone, response.audioBuffer!);
          }, 'mensagem de áudio');
        } else if (response.text) {
          await simulateRealisticTyping(async () => {
            await sendText(phone, response.text);
          }, 'mensagem de texto');
        }
      } catch (err) {
        logger.error('[webhook] Erro no processamento de áudio', { error: err });
        await simulateRealisticTyping(async () => {
          await sendText(phone, 'Desculpe, não consegui entender o áudio. Pode repetir?');
        }, 'resposta de erro');
      }
    }

    if (message.type === 'text') {
      const text = message.text.body;
      logger.debug(`[webhook] Texto recebido: ${text}`);
      logger.info(`[mensagem] 📥 Mensagem recebida do cliente (${phone}): "${text}"`);

      const response = await handleMessage(phone, text, 'produto1');

      if (response.audioBuffer) {
        await simulateRealisticTyping(async () => {
          await sendAudio(phone, response.audioBuffer!);
        }, 'mensagem de áudio');
      } else if (response.text) {
        await simulateRealisticTyping(async () => {
          await sendText(phone, response.text);
        }, 'mensagem de texto');
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    logger.error('[webhook] Erro inesperado no webhook', { error: err });
    return res.sendStatus(500);
  }
}
