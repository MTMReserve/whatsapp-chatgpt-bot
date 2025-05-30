// src/middlewares/errorMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger'; // ✅ Importação do logger

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Middleware global de tratamento de erros.
 *
 * @param err    Erro capturado
 * @param req    Request do Express
 * @param res    Response do Express
 * @param _next  Próximo middleware (não utilizado, necessário para Express reconhecer)
 * @returns      Response com status 500 e JSON de erro
 */
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error('[errorMiddleware] Erro global capturado', {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    error: err
  });

  if (process.env.NODE_ENV === 'test') {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Ocorreu um erro interno no servidor.',
  });
}
/* eslint-enable @typescript-eslint/no-unused-vars */
