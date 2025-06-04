// src/api/whatsapp.ts

import axios, { type AxiosError } from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Baixa um arquivo de mídia (ex: áudio) usando o media_id recebido do WhatsApp.
 *
 * @param mediaId - ID da mídia fornecido pela API Meta
 * @returns Buffer com o conteúdo da mídia
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
 * Realiza o upload de um arquivo de áudio (.ogg) e obtém o media_id correspondente da API do WhatsApp.
 *
 * @param audioPath - Caminho para o arquivo de áudio local
 * @returns media_id retornado pela API Meta
 */
async function uploadAudioAndGetMediaId(audioPath: string): Promise<string> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`[uploadAudio] Arquivo não encontrado: ${audioPath}`);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(audioPath), {
    filename: 'resposta.ogg',
    contentType: 'audio/ogg; codecs=opus',
  });
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'audio');

  const headers = {
    Authorization: `Bearer ${token}`,
    ...form.getHeaders(),
  };

  logger.debug(`[whatsapp] 🔼 Upload de áudio iniciado para ${audioPath}`);
  logger.debug(`[whatsapp] Headers do FormData:`, headers);

  const response = await axios.post(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/media`,
    form,
    { headers }
  );

  const mediaId = response.data.id;
  logger.info(`[whatsapp] ✅ Upload de áudio concluído com media_id: ${mediaId}`);
  return mediaId;
}

/**
 * Envia um áudio para um número de telefone via WhatsApp.
 *
 * @param to - Número de telefone de destino
 * @param audioBuffer - Conteúdo do áudio em buffer
 */
export async function sendAudio(to: string, audioBuffer: Buffer): Promise<void> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  logger.debug(`[whatsapp] Enviando áudio para ${to}`);

  const tempAudioPath = path.join(__dirname, '../../temp-resposta.ogg');
  fs.writeFileSync(tempAudioPath, audioBuffer);

  try {
    const mediaId = await uploadAudioAndGetMediaId(tempAudioPath);

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

    logger.info(`[whatsapp] ✅ Áudio enviado com sucesso para ${to}`);
  } catch (error) {
    logger.error(`[whatsapp] ❌ Erro ao enviar áudio para ${to}`, { error });
    throw error;
  } finally {
    if (fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
      logger.debug(`[whatsapp] 🧹 Arquivo temporário removido: ${tempAudioPath}`);
    }
  }
}

/**
 * Envia um texto para um número de telefone via WhatsApp com rastreabilidade completa.
 *
 * @param to - Número de destino
 * @param message - Texto da mensagem
 */
export async function sendText(to: string, message: string): Promise<void> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    logger.error(`[whatsapp] ❌ Mensagem inválida. Nada será enviado para ${to}. Conteúdo: "${message}"`);
    throw new Error('Mensagem vazia ou malformada');
  }

  if (message.length > 1000) {
    logger.warn(`[whatsapp] ⚠️ Mensagem para ${to} ultrapassava 1000 caracteres. Foi truncada.`);
    message = message.slice(0, 1000) + '...';
  }

  logger.info(`[sendText] Enviando mensagem para ${to}. Conteúdo: "${message}" Timestamp=${Date.now()}`);

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };

  logger.info(`[whatsapp] ✉️ Preparando envio de mensagem para: ${to}`);
  logger.debug(`[whatsapp] Conteúdo da mensagem: "${message}"`);
  logger.debug(`[whatsapp] Payload final:`, payload);
  logger.debug(`[whatsapp] Token usado (parcial): ${token.slice(0, 8)}...`);

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`[whatsapp] ✅ Mensagem enviada com sucesso para ${to}`);
    logger.debug(`[whatsapp] Resposta da API Meta:`, response.data);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logger.error(`[whatsapp] ❌ Erro ao enviar mensagem para ${to}`, {
      status: axiosError?.response?.status,
      responseData: axiosError?.response?.data,
      mensagem: message,
    });

    throw err;
  }
}

/**
 * Envia uma mídia (imagem, vídeo ou documento) para um número via WhatsApp.
 *
 * @param to - Número de destino
 * @param type - Tipo da mídia ('image', 'video' ou 'document')
 * @param url - Link da mídia
 * @param caption - Legenda opcional
 */
export async function sendMedia(to: string, type: 'image' | 'video' | 'document', url: string, caption?: string): Promise<void> {
  const token = process.env.META_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    logger.error('[sendMedia] ❌ Variáveis de ambiente ausentes');
    throw new Error('META_TOKEN ou META_PHONE_NUMBER_ID não definidos no .env');
  }

  logger.info(`[sendMedia] 📦 Preparando envio de mídia tipo "${type}" para ${to}`);
  logger.debug(`[sendMedia] URL: ${url}`);
  logger.debug(`[sendMedia] Legenda: ${caption || '---'}`);

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type,
    [type]: {
      link: url,
      ...(caption && { caption }),
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`[sendMedia] ✅ Mídia (${type}) enviada com sucesso para ${to}`);
    logger.debug(`[sendMedia] Resposta da API Meta:`, response.data);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logger.error(`[sendMedia] ❌ Erro ao enviar mídia tipo "${type}" para ${to}`, {
      status: axiosError?.response?.status,
      responseData: axiosError?.response?.data,
      url,
      caption,
    });

    throw err;
  }
}
