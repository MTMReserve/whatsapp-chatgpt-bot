import type { PerfilCliente } from '../models/Profile';
import { botPersona } from '../persona/botPersona';
import { logger } from '../utils/logger';
import { PerfilClienteModel } from '../models/PerfilCliente.mongo'; // ✅

/**
 * Recupera o perfil real salvo no MongoDB para o telefone informado.
 * Se não encontrar, retorna um perfil padrão (fallback).
 */
export async function getAnalyzedProfileFromMongo(phone: string): Promise<PerfilCliente> {
  logger.info(`[perfilCliente] 🔍 Buscando perfil no MongoDB para phone: ${phone}`);

  const doc = await PerfilClienteModel.findOne({ phone }).lean();

  if (doc?.perfilCompleto) {
    logger.info(`[perfilCliente] ✅ Perfil encontrado no MongoDB para ${phone}`);
    return doc.perfilCompleto as PerfilCliente;
  }

  logger.warn(`[perfilCliente] ⚠️ Perfil não encontrado para ${phone}. Retornando perfil padrão.`);
  return {
    formalidade: 'informal',
    emojis: false,
    fala: 'fala muito',
    detalhamento: 'direto',
    temperamento: 'sanguíneo',
    linguagemTecnica: 'mista',
    urgencia: 'paciente',
  };
}

/**
 * Versão anterior – ainda usa botPersona como fonte do perfil.
 * Utilizar apenas para debug ou fallback local.
 */
export function getAnalyzedProfileByClientId(clientId: string): PerfilCliente {
  logger.info(`[perfilCliente] 🔍 Recuperando perfil local para clientId ${clientId} baseado no botPersona`);

  const estilo = botPersona.estiloDeFala;

  const perfil: PerfilCliente = {
    formalidade: estilo.formalidade as PerfilCliente['formalidade'],
    emojis: estilo.emojis,
    fala: estilo.frasesCurtas ? 'fala pouco' : 'fala muito',
    detalhamento: estilo.detalhamento as PerfilCliente['detalhamento'],
    temperamento: estilo.temperamento as PerfilCliente['temperamento'],
    linguagemTecnica: 'mista',
    urgencia: 'paciente',
  };

  logger.info(`[perfilCliente] ✅ Perfil local reconstruído para clientId ${clientId}`);
  logger.debug(`[perfilCliente] PerfilCliente resultante:`, perfil);

  return perfil;
}
