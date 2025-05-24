// src/repositories/clientProfileRepository.ts

import type { PerfilCliente } from '../models/Profile';
import { botPersona } from '../persona/botPersona';
import { logger } from '../utils/logger';

/**
 * Retorna o objeto completo do perfil do cliente baseado no botPersona atual.
 * Futuramente, pode ser substituído por uma consulta ao banco (MongoDB).
 */
export function getAnalyzedProfile(phone: string): PerfilCliente {
  logger.info(`[perfilCliente] 🔍 Recuperando perfil para ${phone} baseado no botPersona`);

  const estilo = botPersona.estiloDeFala;

  logger.debug(`[perfilCliente] Estilo de fala atual aplicado no botPersona:`, estilo);

  const perfil: PerfilCliente = {
    formalidade: estilo.formalidade as PerfilCliente['formalidade'],
    emojis: estilo.emojis,
    fala: estilo.frasesCurtas ? 'fala pouco' : 'fala muito',
    detalhamento: estilo.detalhamento as PerfilCliente['detalhamento'],
    temperamento: estilo.temperamento as PerfilCliente['temperamento'],
    linguagemTecnica: 'mista',
    urgencia: 'paciente',
  };

  logger.info(`[perfilCliente] ✅ Perfil completo reconstruído para ${phone}`);
  logger.debug(`[perfilCliente] PerfilCliente resultante:`, perfil);

  return perfil;
}
