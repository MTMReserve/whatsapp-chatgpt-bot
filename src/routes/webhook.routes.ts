import { Router, Request, Response } from 'express';
import { handleWebhook, verifyWebhook } from '../controllers/webhookController';

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
 *     summary: Validação da Meta (GET)
 *     description: Retorna o hub.challenge enviado pela Meta.
 *     responses:
 *       200:
 *         description: Verificação bem-sucedida
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 123456
 */
router.get('/', verifyWebhook);

/**
 * @swagger
 * /webhook:
 *   post:
 *     tags: [Webhook]
 *     summary: Recebe mensagens do WhatsApp (Cloud API)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Mensagem processada com sucesso
 *       403:
 *         description: Token inválido
 *       429:
 *         description: Rate limit excedido
 */
router.post('/', handleWebhook);

export default router;
