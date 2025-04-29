import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const POINTS = parseInt(process.env.RATE_LIMIT_POINTS ?? '5', 10);
const DURATION = parseInt(process.env.RATE_LIMIT_DURATION ?? '60', 10);

// Exporta o limiter para que os testes possam espionar (spyOn) a função consume()
export const limiter = new RateLimiterMemory({ points: POINTS, duration: DURATION });

/**
 * Middleware de rate limiting agora retorna a Promise internamente,
 * garantindo que o teste com `await` só prossiga quando resolve ou rejeita.
 */
export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.ip ?? 'unknown';

  try {
    await limiter.consume(key);
    return next();
  } catch {
    return res
      .status(429)
      .json({ success: false, message: 'Muitas requisições. Tente novamente mais tarde.' });
  }
}
