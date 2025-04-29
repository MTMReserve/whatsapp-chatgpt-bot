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
 * Handler para receber o webhook do WhatsApp (Twilio).
 * Retorna HTTP 200 confirmando o recebimento.
 *
 * @param req - Request do Express
 * @param res - Response do Express
 * @returns Response com status 200
 */
export function handleWebhook(req: Request, res: Response): Response {
  // TODO: implementar a lógica de processamento da mensagem
  return res.sendStatus(200);
}
