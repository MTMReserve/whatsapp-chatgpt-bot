import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

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
      return res.status(400).json({
        message: 'Payload inválido',
      });
    }
  };
}
