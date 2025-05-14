import { Request, Response } from 'express'; 
import { downloadMedia, sendAudio, sendText } from '../api/whatsapp';
import { audioService } from '../services/audioService';
import { handleMessage } from '../services/conversationManager';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'verificabotaloco123';

/**
 * Validação do webhook (GET da Meta)
 */
export function verifyWebhook(req: Request, res: Response): Response {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Logs para depuração
  console.log('🟡 Verificação recebida');
  console.log('🔍 Token recebido da URL:', token);
  console.log('🔐 Token do .env:', VERIFY_TOKEN);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Verificação aceita. Respondendo com challenge:', challenge);
    return res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificação falhou');
    return res.sendStatus(403);
  }
}

/**
 * Processamento de mensagens recebidas (POST)
 */
export async function handleWebhook(req: Request, res: Response): Promise<Response> {
  // ✅ LOG ADICIONADO PARA DEBUG
  console.log('⚡ Novo webhook POST:', JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];

    // ✅ FILTRAR EVENTOS DE STATUS (conforme instrução)
    const messages = changes?.value?.messages;
    if (!messages) {
      // Ignorar eventos de status
      console.log('⚡ Evento de status recebido, ignorando.');
      return res.sendStatus(200);
    }

    const message = messages?.[0];
    const phone = message?.from;

    // ✅ LOG ADICIONAL PARA SABER O QUE CHEGOU
    console.log('📥 Mensagem recebida:', JSON.stringify(message, null, 2));
    console.log('📱 Telefone do remetente:', phone);

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
