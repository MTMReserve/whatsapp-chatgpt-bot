import { Request, Response, NextFunction } from 'express';
import { limiter, rateLimiterMiddleware } from '../../middlewares/rateLimiterMiddleware';

// Mock do logger (o middleware não o usa, mas garantimos que exista)
jest.mock('../../utils/logger', () => ({
  logger: { warn: jest.fn() },
}));

describe('rateLimiterMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar next() quando não exceder o limite', async () => {
    // Espia limiter.consume e força um resolve
    jest.spyOn(limiter, 'consume').mockImplementation(
      (key: string | number, points?: number, opts?: any) =>
        Promise.resolve({} as any)
    );

    const req = { ip: '127.0.0.1' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await rateLimiterMiddleware(req, res, next);

    expect(limiter.consume).toHaveBeenCalledWith('127.0.0.1');
    expect(next).toHaveBeenCalled();
  });

  it('deve responder 429 quando exceder o limite', async () => {
    // Espia limiter.consume e força um reject
    jest.spyOn(limiter, 'consume').mockImplementation(
      () => Promise.reject(new Error('limit'))
    );

    const req = { ip: '127.0.0.1' } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await rateLimiterMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.',
    });
  });
});
