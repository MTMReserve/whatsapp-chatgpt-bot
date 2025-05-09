import { Request, Response } from 'express';
import { handleMessage } from '../services/conversationManager';

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const messages = changes?.value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const text = message.text?.body;

        if (text) {
          const resposta = await handleMessage(from, text);
          console.log('Bot respondeu:', resposta);
          // Aqui você pode usar a API do WhatsApp para enviar a resposta se quiser.
        }
      }

      return res.sendStatus(200);
    }

    return res.sendStatus(404);
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.sendStatus(500);
  }
};
