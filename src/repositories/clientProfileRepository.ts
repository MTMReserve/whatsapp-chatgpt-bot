import type { PerfilCliente } from '../models/Profile';
import { botPersona } from '../persona/botPersona';
import { logger } from '../utils/logger';

/**
 * Traduz o estilo de fala do botPersona em um PerfilCliente válido.
 */
export function getAnalyzedProfile(phone: string): PerfilCliente {
  logger.info(`[perfilCliente] 🔍 Recuperando perfil para ${phone} baseado no botPersona`);

  const estilo = botPersona.estiloDeFala;

  logger.debug(`[perfilCliente] Estilo de fala atual aplicado no botPersona:`, estilo);

  // Traduções seguras com fallback
  const formalidade: PerfilCliente['formalidade'] =
    estilo.formalidade === 'informal' ? 'informal' : 'formal';

  const detalhamento: PerfilCliente['detalhamento'] =
    estilo.detalhamento === 'detalhista' || estilo.detalhamento === 'direto'
      ? estilo.detalhamento
      : 'detalhista';

  const temperamento: PerfilCliente['temperamento'] =
    ['sanguíneo', 'colérico', 'melancólico', 'fleumático'].includes(estilo.temperamento)
      ? (estilo.temperamento as PerfilCliente['temperamento'])
      : 'sanguíneo';

  const linguagemTecnica: PerfilCliente['linguagemTecnica'] = 'mista'; // valor válido
  const urgencia: PerfilCliente['urgencia'] = 'paciente'; // valor válido

  const perfil: PerfilCliente = {
    formalidade,
    emojis: estilo.emojis,
    fala: estilo.frasesCurtas ? 'fala pouco' : 'fala muito',
    detalhamento,
    temperamento,
    linguagemTecnica,
    urgencia,
  };

  logger.info(`[perfilCliente] ✅ Perfil completo reconstruído para ${phone}`);
  logger.debug(`[perfilCliente] PerfilCliente resultante:`, perfil);

  return perfil;
}
