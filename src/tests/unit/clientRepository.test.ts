import { ClientRepository, Client } from '../../services/clientRepository'
import { pool } from '../../utils/db'

beforeAll(async () => {
  // criar tabela temporária de clients
  await pool.query(`CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    phone VARCHAR(20)
  )`)
})

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS clients')
  await pool.end()
})

describe('ClientRepository', () => {
  it('should create and retrieve a client', async () => {
    const dummy: Client = { name: 'Teste', phone: '5511999999999' }
    const created = await ClientRepository.create(dummy)
    expect(created.id).toBeDefined()
    const fetched = await ClientRepository.findById(created.id!)
    expect(fetched).toEqual(created)
  })
})
