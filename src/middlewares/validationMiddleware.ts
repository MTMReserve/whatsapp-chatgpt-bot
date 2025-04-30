import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch {
      res.status(400).json({ message: 'Payload inválido' });
    }
  };
}

export const validationMiddleware = validate;
