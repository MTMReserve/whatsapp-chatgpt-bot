import axios from 'axios';
import FormData from 'form-data';

/**
 * Baixa um arquivo de mídia (ex: áudio) usando o media_id recebido do WhatsApp
 */
export async function downloadMedia(mediaId: string): Promise<Buffer> {
  const token = process.env.META_TOKEN;
  if (!token) throw new Error('META_TOKEN não definido no .env');

  const urlRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const url = urlRes.data.url;

  const fileRes = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer'
  });

  return Buffer.from(fileRes.data);
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
}
