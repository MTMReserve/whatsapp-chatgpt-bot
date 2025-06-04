import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../middlewares/errorMiddleware';

describe('errorMiddleware', () => {
  it('deve retornar status 500 e mensagem padrão', () => {
    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    const err = new Error('ops');

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ocorreu um erro interno no servidor.',
    });
  });
});
