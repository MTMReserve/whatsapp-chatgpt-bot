// src/middlewares/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { logger } from '../utils/logger'; // ✅ importação do logger

/**
 * Middleware de validação usando Zod.
 * Aplica validação ao body, query e params da requisição.
 * Retorna erro 400 caso o payload não esteja conforme o schema.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      logger.debug('[validationMiddleware] Payload válido');
      next();
    } catch (error: any) {
      logger.warn('[validationMiddleware] Payload inválido', {
        error: error?.errors || error,
        body: req.body,
        query: req.query,
        params: req.params
      });
      res.status(400).json({
        message: 'Payload inválido',
        errors: error?.errors || error
      });
    }
  };
}

// Exportação nomeada para uso nos testes e controllers
export const validationMiddleware = validate;
