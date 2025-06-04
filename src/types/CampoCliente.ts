// src/types/CampoCliente.ts

/**
 * Tipos de campos válidos no cliente — definidos com base na tabela `clients` no MySQL.
 * Este tipo é a única fonte da verdade para todos os módulos que tratam de dados do cliente.
 */
export type CampoCliente =
  | 'name'
  | 'needs'
  | 'budget'
  | 'negotiated_price'
  | 'address'
  | 'payment_method'
  | 'schedule_time'
  | 'feedback'
  | 'reactivation_reason'
  | 'attempted_solutions'
  | 'expectations'
  | 'urgency_level'
  | 'client_stage'
  | 'objection_type'
  | 'purchase_intent'
  | 'scheduling_preference'
  | 'disponibilidade'
  | 'motivo_objeção'
  | 'alternativa'
  | 'desconto'
  | 'forma_pagamento'
  | 'confirmacao'
  | 'indicacao';

/**
 * Conjunto auxiliar para validações e autocompletar.
 */
export const todosOsCamposCliente: CampoCliente[] = [
  'name',
  'needs',
  'budget',
  'negotiated_price',
  'address',
  'payment_method',
  'schedule_time',
  'feedback',
  'reactivation_reason',
  'attempted_solutions',
  'expectations',
  'urgency_level',
  'client_stage',
  'objection_type',
  'purchase_intent',
  'scheduling_preference',
  'disponibilidade',
  'motivo_objeção',
  'alternativa',
  'desconto',
  'forma_pagamento',
  'confirmacao',
  'indicacao'
];
