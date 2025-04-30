import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

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
    next();
  } catch {
    res
      .status(429)
      .json({ success: false, message: 'Muitas requisições. Tente novamente mais tarde.' });
  }
}
