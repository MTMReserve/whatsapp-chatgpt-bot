// ===============================
// File: src/controllers/webhookController.ts
// ===============================
import { Request, Response } from 'express';

/**
 * Controller do Webhook: apenas confirma que recebeu a requisição.
 */
export function handleWebhook(req: Request, res: Response) {
  // TODO: aqui você irá processar a mensagem recebida do Twilio/WhatsApp
  return res.sendStatus(200);
}
