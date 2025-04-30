import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

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
      next();
    } catch {
      res.status(400).json({
        message: 'Payload inválido',
      });
    }
  };
}

// Exportação nomeada para uso nos testes e controllers
export const validationMiddleware = validate;
