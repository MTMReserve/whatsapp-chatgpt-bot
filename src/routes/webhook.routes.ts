import { Router } from 'express';
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
 *     summary: Verificação do Webhook (usado pela Meta)
 *     description: Responde com o desafio do hub para confirmar o webhook
 *     parameters:
 *       - name: hub.mode
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *       - name: hub.verify_token
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *       - name: hub.challenge
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Verificação bem-sucedida
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 123456
 *       403:
 *         description: Token inválido
 */

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
