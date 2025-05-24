import type { PerfilCliente } from '../models/Profile';
import { logger } from '../utils/logger';

/**
 * Define a temperatura ideal com base na etapa do funil + perfil do cliente.
 */
export function definirTemperaturaDinamica({
  etapa,
  perfil,
}: {
  etapa: string;
  perfil: PerfilCliente;
}): number {
  logger.info(`[temperatura] 🔍 Calculando temperatura com base na etapa "${etapa}" e perfil do cliente`);

  let base = 0.7;

  const temperaturaPorEtapa: Record<string, number> = {
    abordagem: 0.9,
    levantamento: 0.85,
    proposta: 0.75,
    negociacao: 0.6,
    fechamento: 0.4,
    pos_venda: 0.5,
    reativacao: 0.8,
    encerramento: 0.3,
  };

  if (temperaturaPorEtapa[etapa]) {
    base = temperaturaPorEtapa[etapa];
    logger.debug(`[temperatura] Etapa reconhecida: "${etapa}" → base inicial: ${base}`);
  } else {
    logger.warn(`[temperatura] Etapa desconhecida: "${etapa}". Usando base padrão: ${base}`);
  }

  logger.debug(`[temperatura] Perfil recebido:`, perfil);

  // 🔁 Ajustes baseados no perfil
  if (perfil.temperamento === 'sanguíneo') {
    base += 0.1;
    logger.debug(`[temperatura] Ajuste: temperamento "sanguíneo" → +0.1`);
  }
  if (perfil.temperamento === 'colérico') {
    base += 0.05;
    logger.debug(`[temperatura] Ajuste: temperamento "colérico" → +0.05`);
  }
  if (perfil.temperamento === 'melancólico') {
    base -= 0.05;
    logger.debug(`[temperatura] Ajuste: temperamento "melancólico" → -0.05`);
  }
  if (perfil.temperamento === 'fleumático') {
    base -= 0.1;
    logger.debug(`[temperatura] Ajuste: temperamento "fleumático" → -0.1`);
  }

  if (perfil.formalidade === 'informal') {
    base += 0.05;
    logger.debug(`[temperatura] Ajuste: formalidade "informal" → +0.05`);
  }

  if (perfil.fala === 'fala muito') {
    base += 0.1;
    logger.debug(`[temperatura] Ajuste: fala "fala muito" → +0.1`);
  }
  if (perfil.fala === 'fala pouco') {
    base -= 0.1;
    logger.debug(`[temperatura] Ajuste: fala "fala pouco" → -0.1`);
  }

  if (perfil.detalhamento === 'detalhista') {
    base += 0.05;
    logger.debug(`[temperatura] Ajuste: detalhamento "detalhista" → +0.05`);
  }
  if (perfil.detalhamento === 'direto') {
    base -= 0.05;
    logger.debug(`[temperatura] Ajuste: detalhamento "direto" → -0.05`);
  }

  const temperaturaFinal = Math.min(1.0, Math.max(0.2, parseFloat(base.toFixed(2))));
  logger.info(`[temperatura] ✅ Temperatura final calculada: ${temperaturaFinal}`);

  return temperaturaFinal;
}
