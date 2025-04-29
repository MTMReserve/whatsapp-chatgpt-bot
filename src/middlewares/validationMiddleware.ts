import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validationMiddleware<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Extrai as mensagens de erro do ZodError
      const errors = result.error.errors.map(
        (e) => `${e.path.join('.')} : ${e.message}`
      );
      return res.status(400).json({ success: false, errors });
    }
    // Substitui req.body pelo objeto validado e tipado
    req.body = result.data;
    next();
  };
}
