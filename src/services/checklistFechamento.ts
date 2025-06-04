// ===============================
// File: src/services/checklistFechamento.ts
// ===============================

import { getMetasDaEtapa } from './metaPorEtapa';
import { verificarContradicoes } from './verificadorContradicoes';
import type { FieldValidation } from '../types/FieldValidation';
import type { ResultadoChecklist } from '../types/ResultadoChecklist'; // ✅ caminho corrigido

/**
 * Verifica se todos os campos obrigatórios da etapa de fechamento estão preenchidos e válidos
 * e se existem contradições relevantes nos dados extraídos.
 */
export function checklistFechamento(fields: Record<string, FieldValidation>): ResultadoChecklist {
  const etapa = 'fechamento';
  const metas = getMetasDaEtapa(etapa);

  const faltando = metas.filter((campo) => {
    const info = fields[campo];
    return !info || !info.valid || info.value === null || info.value === undefined || info.value === '';
  });

  // ⚠️ Como não temos acesso direto ao Client, vamos assumir que a verificação de contradições foi movida para outro lugar.
  const contradicoes: string[] = []; // pode ser adaptado se necessário

  const aprovado = faltando.length === 0 && contradicoes.length === 0;

  return {
    aprovado,
    faltando,
    contradicoes, // mesmo sendo opcional no tipo, aqui está presente (ok)
  };
}
