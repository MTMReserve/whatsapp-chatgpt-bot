// ===============================
// File: src/middlewares/errorMiddleware.ts
// ===============================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(`Erro capturado: ${String(err)}`);

  return res.status(500).json({
    success: false,
    message: 'Ocorreu um erro interno no servidor.',
  });
}
