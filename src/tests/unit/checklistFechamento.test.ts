import { checklistFechamento } from '../../services/checklistFechamento';

const valid = {
  address: { value: 'Rua A', valid: true },
  payment_method: { value: 'pix', valid: true },
  schedule_time: { value: '10h', valid: true },
  confirmacao: { value: 'sim', valid: true }
};

describe('checklistFechamento', () => {
  it('approves when all fields valid', () => {
    const result = checklistFechamento(valid as any);
    expect(result.aprovado).toBe(true);
    expect(result.faltando).toHaveLength(0);
  });

  it('fails when a field is missing', () => {
    const fields = { ...valid, schedule_time: { value: null, valid: false } } as any;
    const result = checklistFechamento(fields);
    expect(result.aprovado).toBe(false);
    expect(result.faltando).toContain('schedule_time');
  });
});
