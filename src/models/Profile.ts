// src/models/Profile.ts

import mongoose from 'mongoose';

export interface PerfilCliente {
  formalidade: 'formal' | 'informal';
  emojis: boolean;
  fala: 'fala pouco' | 'fala muito';
  detalhamento: 'direto' | 'detalhista';
  linguagemTecnica: 'técnica' | 'leiga' | 'mista';
  urgencia: 'apressado' | 'paciente';
  temperamento: 'colérico' | 'fleumático' | 'melancólico' | 'sanguíneo';
}

const ProfileSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  analisadoEm: { type: Date, default: Date.now },
  perfilCompleto: {
    formalidade: String,
    emojis: Boolean,
    fala: String,
    detalhamento: String,
    linguagemTecnica: String,
    urgencia: String,
    temperamento: String,
  },
});

export const Profile = mongoose.model('Profile', ProfileSchema);
