import { verificarContradicoes } from '../../services/verificadorContradicoes';
import type { Client } from '../../types/Client';

describe('verificarContradicoes', () => {
  const baseClient: Client = {
    id: 1,
    phone: '123',
    produto_id: null,
    current_state: null,
    retries: null,
    has_greeted: null,
    name: null,
    needs: null,
    budget: null,
    negotiated_price: null,
    address: null,
    payment_method: null,
    schedule_time: null,
    feedback: null,
    reactivation_reason: null,
    attempted_solutions: null,
    expectations: null,
    urgency_level: null,
    client_stage: null,
    objection_type: null,
    purchase_intent: null,
    scheduling_preference: null,
    disponibilidade: null,
    motivo_objeção: null,
    alternativa: null,
    desconto: null,
    forma_pagamento: null,
    confirmacao: null,
    indicacao: null,
    state: '',
    last_interaction: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  };

  it('detects payment method missing when purchase intent is yes', () => {
    const client = { ...baseClient, purchase_intent: 'sim', payment_method: null };
    const result = verificarContradicoes(client, 'negociacao');
    expect(result.length).toBeGreaterThan(0);
  });

  it('detects low budget', () => {
    const client = { ...baseClient, budget: '100' };
    const result = verificarContradicoes(client, 'proposta');
    expect(result.some(r => r.includes('Orçamento'))).toBe(true);
  });
});
