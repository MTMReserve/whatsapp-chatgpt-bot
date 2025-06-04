import type { Client } from '../types/Client';
import type { FieldValidation } from '../types/FieldValidation';

/**
 * Converte os campos principais do cliente para o formato esperado pelo checklistFechamento.
 */
export function mapearClienteParaFieldValidation(cliente: Client): Record<string, FieldValidation> {
  const camposPrincipais: (keyof Client)[] = [
    'name',
    'needs',
    'budget',
    'payment_method',
    'address',
    'confirmacao',
  ];

  const resultado: Record<string, FieldValidation> = {};

  for (const campo of camposPrincipais) {
    const valor = cliente[campo];
    resultado[campo] = {
      value: valor ?? null,
      valid: !!valor && valor !== '',
    };
  }

  return resultado;
}
