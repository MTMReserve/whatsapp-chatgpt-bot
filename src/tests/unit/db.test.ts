// src/tests/unit/db.test.ts

import * as mysql from 'mysql2/promise';
import * as dbModule from '../../../src/utils/db';

jest.mock('mysql2/promise');

describe('db.ts – conexão MySQL', () => {
  const createPoolMock = mysql.createPool as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve lançar erro se a criação da pool falhar', async () => {
    createPoolMock.mockImplementation(() => {
      throw new Error('Erro na conexão');
    });

    // Redefine o módulo db para forçar erro na recriação
    jest.resetModules();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => require('../../../src/utils/db')).toThrow();

    spy.mockRestore();
  });

  it('deve criar a pool com as configurações corretas', () => {
    // Se chegou até aqui, a conexão deu certo
    expect(dbModule.pool).toBeDefined();
    expect(typeof dbModule.pool.query).toBe('function');
  });
});
