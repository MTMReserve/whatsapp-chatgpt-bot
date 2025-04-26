// ===============================
// File: src/controllers/webhookController.ts
// ===============================

import { Request, Response } from 'express';

/**
 * Webhook controller stub
 * Recebe requisições do Twilio (WhatsApp) e retorna 200 OK
 */
export function webhookController(req: Request, res: Response): void {
  // TODO: implementar lógica de roteamento de mensagens
  res.sendStatus(200);
}