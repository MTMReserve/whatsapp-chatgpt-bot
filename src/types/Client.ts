// src/types/Client.ts

export interface Client {
  id: number;
  phone: string;
  produto_id: string | null; // ✅ Usado para definir produto atual vinculado ao cliente
  current_state: string | null; // ✅ Corrige erro de compilação no conversationManager
  retries: number | null; // ✅ Usado para limitar tentativas na state machine
  has_greeted: boolean | null; // ✅ Define se o cliente já recebeu saudação

  name: string | null;
  needs: string | null;
  budget: string | null;
  negotiated_price: string | null;
  address: string | null;
  payment_method: string | null;
  schedule_time: string | null;
  feedback: string | null;
  reactivation_reason: string | null;
  attempted_solutions: string | null;
  expectations: string | null;
  urgency_level: string | null;
  client_stage: string | null;
  objection_type: string | null;
  purchase_intent: string | null;
  scheduling_preference: string | null;

  // Campos extras do funil
  disponibilidade: string | null;
  motivo_objeção: string | null;
  alternativa: string | null;
  desconto: string | null;
  forma_pagamento: string | null;
  confirmacao: string | null;
  indicacao: string | null;

  // Campos técnicos
  state: string;
  last_interaction: Date;
  created_at: Date;
  updated_at: Date;
}
