// ===============================
// File: src/types/MongoSchemas.ts
// ===============================

export interface LogBase {
  clientId: string;
  phone: string;
  etapa: string;
  mensagem: string;
  respostaGerada: string;
  timestamp: Date;
  produtoId?: string | null; // ✅ Agora opcional e unificado
}

export interface LogEstrategia extends LogBase {
  estrategia: string;
}

export interface FeedbackIA extends LogBase {
  feedback: 'positivo' | 'negativo';
  comentario?: string;
}

export interface AuditLog extends LogBase {
  stateBefore: string;
  stateAfter: string;
  detectedIntent: string;
  erro?: string;
}
