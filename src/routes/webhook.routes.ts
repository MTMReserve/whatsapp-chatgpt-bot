// ===============================
// File: src/routes/webhook.routes.ts
// ===============================
import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';

const router = Router();

// Rota para receber notificações do WhatsApp via Twilio
router.post('/', webhookController);

export default router;
