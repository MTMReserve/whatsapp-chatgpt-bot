import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // só loga em dev/prod, suprime em teste
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res
    .status(500)
    .json({ success: false, message: 'Ocorreu um erro interno no servidor.' });
}
