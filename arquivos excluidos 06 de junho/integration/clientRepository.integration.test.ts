import { pool } from '../../utils/db'; 
import { ClientRepository } from '../../services/clientRepository';

describe('ClientRepository Integration', () => {
  beforeAll(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100),
        phone VARCHAR(20),
        current_state VARCHAR(50) DEFAULT 'abordagem',
        retries INT DEFAULT 0
      );
    `);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM clients');
    await pool.end();
  });

  it('deve criar e buscar um cliente', async () => {
    const repo = new ClientRepository();
    const newClient = await repo.create({ name: 'Teste', phone: '123' });
    expect(newClient).toHaveProperty('id');

    // Testa método estático
    const found = await ClientRepository.findById(newClient.id!);
    expect(found.name).toBe('Teste');
    expect(found.phone).toBe('123');
  });
});
