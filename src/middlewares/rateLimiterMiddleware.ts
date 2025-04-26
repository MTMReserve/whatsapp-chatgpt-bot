// ===============================
// File: src/middlewares/rateLimiterMiddleware.ts
// ===============================

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

// Cria um rate limiter em memória com valores fixos
const rateLimiter = new RateLimiterMemory({
  points: 5,    // número de requisições permitidas
  duration: 60, // duração da janela em segundos
});

/**
 * Middleware para limitar o número de requisições por IP
 */
export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Estratégia B: fallback para string padrão se req.ip for undefined
  const key = req.ip ?? 'unknown';

  try {
    await rateLimiter.consume(key);
    return next();
  } catch (_error) {
    logger.warn(`Rate limit excedido para IP: ${key}`);
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.',
    });
  }
}
