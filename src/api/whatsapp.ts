import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger';

/**
 * Baixa um arquivo de mídia (ex: áudio) usando o media_id recebido do WhatsApp
 */
export async function downloadMedia(mediaId: string): Promise<Buffer> {
  const token = process.env.META_TOKEN;
  if (!token) throw new Error('META_TOKEN não definido no .env');

  logger.debug(`[whatsapp] Iniciando download de mídia: mediaId=${mediaId}`);

  try {
    const urlRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const url = urlRes.data.url;

    const fileRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    logger.info(`[whatsapp] Mídia baixada com sucesso: mediaId=${mediaId}`);
    return Buffer.from(fileRes.data);
  } catch (error) {
    logger.error(`[whatsapp] Erro ao baixar mídia: mediaId=${mediaId}`, { error });
    throw error;
  }
}

/**
 * Envia um áudio para um número de telefone via WhatsApp
 */
export async function sendAudio(to: string, audioBuffer: Buffer): Promise<void> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  logger.debug(`[whatsapp] Enviando áudio para ${to}`);

  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'resposta.ogg',
      contentType: 'audio/ogg',
    });
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'audio');

    const uploadRes = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    const mediaId = uploadRes.data.id;

    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'audio',
        audio: { id: mediaId },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`[whatsapp] Áudio enviado com sucesso para ${to} mediaId=${mediaId}`);
  } catch (error) {
    logger.error(`[whatsapp] Falha ao enviar áudio para ${to}`, { error });
    throw error;
  }
}

/**
 * Envia mensagem de texto para um número via WhatsApp Cloud API.
 */
export async function sendText(to: string, text: string): Promise<void> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  logger.debug(`[whatsapp] Enviando texto para ${to}: "${text}"`);

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`[whatsapp] Texto enviado com sucesso para ${to}`);
  } catch (error) {
    logger.error(`[whatsapp] Falha ao enviar texto para ${to}`, { error });
    throw error;
  }
}
