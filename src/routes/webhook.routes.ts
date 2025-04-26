// ===============================
// File: src/routes/webhook.routes.ts
// ===============================
import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = Router();

// Rota principal de recepção de webhook do Twilio
router.post('/', handleWebhook);

export default router;
