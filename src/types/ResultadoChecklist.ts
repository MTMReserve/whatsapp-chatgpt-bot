// ===============================
// File: src/types/ResultadoChecklist.ts
// ===============================

export interface ResultadoChecklist {
  aprovado: boolean;
  faltando: string[]; // campos obrigatórios ausentes ou inválidos
  contradicoes?: string[]; // inconsistências detectadas nos dados
}
