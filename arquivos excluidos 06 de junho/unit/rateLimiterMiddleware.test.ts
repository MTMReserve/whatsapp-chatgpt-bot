import { Request, Response, NextFunction } from 'express';
import { RateLimiterRes } from 'rate-limiter-flexible';
import { limiter, rateLimiterMiddleware } from '../../middlewares/rateLimiterMiddleware';

describe('rateLimiterMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar next() quando não exceder o limite', async () => {
    jest
      .spyOn(limiter, 'consume')
      .mockResolvedValue({} as RateLimiterRes);

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

  it('deve retornar 429 quando exceder o limite', async () => {
    jest.spyOn(limiter, 'consume').mockRejectedValue(new Error('limit'));

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
