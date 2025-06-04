import mongoose from 'mongoose';
import type { PerfilCliente } from './Profile';

/**
 * Define o schema do documento de perfil de cliente no MongoDB.
 * Cada documento é identificado pelo campo `phone` (string).
 */
const PerfilClienteSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  perfilCompleto: {
    formalidade: { type: String, enum: ['formal', 'informal'] },
    emojis: { type: Boolean },
    fala: { type: String, enum: ['fala muito', 'fala pouco'] },
    detalhamento: { type: String, enum: ['detalhista', 'direto'] },
    temperamento: { type: String, enum: ['sanguíneo', 'colérico', 'melancólico', 'fleumático'] },
    linguagemTecnica: { type: String },
    urgencia: { type: String, enum: ['paciente', 'com pressa'] }
  },
  analyzedAt: { type: Date, default: Date.now }
});

export const PerfilClienteModel = mongoose.model('PerfilCliente', PerfilClienteSchema);
