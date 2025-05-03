// src/controllers/webhookController.ts
import { Request, Response } from 'express';

/**
 * @swagger
 * components:
 *   schemas:
 *     WebhookPayload:
 *       type: object
 *       required: [Body, From]
 *       properties:
 *         Body:
 *           type: string
 *           example: Olá, gostaria de saber mais sobre o produto
 *         From:
 *           type: string
 *           example: whatsapp:+5511999999999
 *         To:
 *           type: string
 *           example: whatsapp:+14155238886
 */

/**
 * Handler para receber o webhook do WhatsApp (Twilio ou Meta).
 * - GET: Valida o webhook para Meta.
 * - POST: Retorna HTTP 200 confirmando o recebimento.
 *
 * @param req - Request do Express
 * @param res - Response do Express
 * @returns Response com status 200 ou 403
 */
export function handleWebhook(req: Request, res: Response): Response {
  const VERIFY_TOKEN = 'verificabotaloco123';

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

  // Recebimento normal de mensagens (POST)
  return res.sendStatus(200);
}
