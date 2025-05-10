// src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { downloadMedia, sendAudio, sendText } from '../api/whatsapp';
import { audioService } from '../services/audioService';
import { handleMessage } from '../services/conversationManager';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'verificabotaloco123';

/**
 * Handler para o webhook do WhatsApp
 * - GET: validação do Webhook (Meta)
 * - POST: tratamento de mensagens (texto ou áudio)
 */
export async function handleWebhook(req: Request, res: Response): Promise<Response> {
  // Validação do webhook (GET da Meta)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // Processamento das mensagens (POST da Meta)
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    const phone = message?.from;

    if (!message || !phone) {
      return res.sendStatus(200);
    }

    if (message.type === 'audio') {
      try {
        const mediaId = message.audio.id;
        const audioBuffer = await downloadMedia(mediaId);
        const transcribedText = await audioService.transcribeAudio(audioBuffer);

        const response = await handleMessage(phone, transcribedText, { isAudio: true });

        if (response.audioBuffer) {
          await sendAudio(phone, response.audioBuffer);
        } else if (response.text) {
          await sendText(phone, response.text);
        }
      } catch (err) {
        console.error('[webhook] Erro no áudio:', err);
        await sendText(phone, 'Desculpe, não consegui entender o áudio. Pode repetir?');
      }
    } else if (message.type === 'text') {
      const text = message.text.body;
      const response = await handleMessage(phone, text, { isAudio: false });

      if (response.audioBuffer) {
        await sendAudio(phone, response.audioBuffer);
      } else if (response.text) {
        await sendText(phone, response.text);
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[webhook] Erro geral:', err);
    return res.sendStatus(500);
  }
}
