import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger'; // ✅ Logger adicionado

const POINTS = parseInt(process.env.RATE_LIMIT_POINTS ?? '5', 10);
const DURATION = parseInt(process.env.RATE_LIMIT_DURATION ?? '60', 10);

export const limiter = new RateLimiterMemory({ points: POINTS, duration: DURATION });

export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = req.ip ?? 'unknown';

  try {
    await limiter.consume(key);
    logger.debug(`[rateLimiter] Permitido: ${req.method} ${req.path} IP=${key}`);
    next();
  } catch (err) {
    logger.warn(`[rateLimiter] Bloqueado por excesso de requisições IP=${key}`, {
      method: req.method,
      path: req.path
    });

    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.'
    });
  }
}
