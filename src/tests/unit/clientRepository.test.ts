/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { pool } from '../../utils/db';
import { ClientRepository, Client } from '../../services/clientRepository';

describe('ClientRepository (unit)', () => {
  const dummy: Omit<Client, 'id'> = {
    name: 'Teste',
    phone: '5511999999999',
  };
  const fakeId = 42;

  beforeEach(() => {
    jest
      .spyOn(pool, 'query')
      .mockImplementation(
        async (sqlOrOptions: any, _values?: unknown): Promise<any> => {
          const sql =
            typeof sqlOrOptions === 'string'
              ? sqlOrOptions
              : (sqlOrOptions.sql as string);

          if (/INSERT\s+INTO\s+clients/i.test(sql)) {
            return [{ insertId: fakeId }, []];
          }

          if (/SELECT\s+.*FROM\s+clients\s+WHERE\s+id\s*=\s*\?/i.test(sql)) {
            return [[{ id: fakeId, name: dummy.name, phone: dummy.phone }], []];
          }

          return [[], []];
        }
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create and retrieve a client', async () => {
    const created = await ClientRepository.create(dummy);
    expect(created).toEqual({ id: fakeId, ...dummy });

    const fetched = await ClientRepository.findById(fakeId);
    expect(fetched).toEqual({ id: fakeId, ...dummy });
  });
});
