import { Router, Request, Response } from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = Router();

// GET simples para testes e saúde
router.get('/', (_req: Request, res: Response) => {
  return res.status(200).send('OK');
});

// POST padrão (receber mensagens depois)
router.post('/', handleWebhook);

export default router;
