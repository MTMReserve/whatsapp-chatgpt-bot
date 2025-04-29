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
 *           description: Conteúdo da mensagem enviada pelo usuário
 *           example: Olá, gostaria de saber mais sobre o produto
 *         From:
 *           type: string
 *           description: Número de origem no formato whatsapp:+55...
 *           example: whatsapp:+5511999999999
 *         To:
 *           type: string
 *           description: Número do bot
 *           example: whatsapp:+14155238886
 */

/**
 * Controller do Webhook.
 * Atualmente apenas confirma o recebimento (HTTP 200).
 * Futuros devs: implementar roteamento de mensagens aqui.
 */
export function handleWebhook(req: Request, res: Response) {
  // TODO: processar mensagem recebida do Twilio/WhatsApp
  return res.sendStatus(200);
}
