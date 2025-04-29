import { Router, Request, Response } from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Webhook
 *   description: Integração WhatsApp → Servidor
 */

/**
 * @swagger
 * /webhook:
 *   get:
 *     tags: [Webhook]
 *     summary: Verificação/saúde do endpoint
 *     description: Retorna **OK** para comprovar que o serviço está ativo.
 *     responses:
 *       200:
 *         description: Serviço online
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
router.get('/', (_req: Request, res: Response) => {
  return res.status(200).send('OK');
});

/**
 * @swagger
 * /webhook:
 *   post:
 *     tags: [Webhook]
 *     summary: Recebe mensagens do WhatsApp (Twilio)
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPayload'
 *     responses:
 *       200:
 *         description: Mensagem processada com sucesso
 *       429:
 *         description: Rate limit excedido
 */
router.post('/', handleWebhook);

export default router;
