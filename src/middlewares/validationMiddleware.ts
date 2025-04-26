// ===============================
// File: src/middlewares/validationMiddleware.ts
// ===============================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware para validar o corpo da requisição com Zod.
 * @param schema Schema de validação (Zod)
 */
export function validationMiddleware(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors || [],
      });
    }
  };
}
