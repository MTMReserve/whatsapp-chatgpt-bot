// src/services/dataExtractor.ts

import { logger } from '../utils/logger';
import type { ExtractResult } from './ExtractionService';
import { extractAndValidateAll } from './ExtractionService';
import { metasPorEtapa, type EtapaFunil } from './metaPorEtapa';
import type { CampoCliente } from '../types/CampoCliente';

/**
 * Extrai e valida todos os campos da etapa atual usando IA.
 * Retorna os campos com valor e status de validade.
 */
export async function extractAll(
  message: string,
  clientId: string,
  currentState: string
): Promise<ExtractResult> {
  const campos: CampoCliente[] = metasPorEtapa[currentState as EtapaFunil];
  if (!campos || campos.length === 0) {
    logger.warn(`[dataExtractor] Nenhum campo definido para etapa '${currentState}'`);
    return { fields: {} };
  }

  return await extractAndValidateAll(message, clientId, campos);
}

/**
 * Extrai apenas os valores brutos dos campos, ignorando validade.
 */
export async function extractAllFields(
  phone: string,
  text: string,
  currentState: string
): Promise<Record<string, any>> {
  const extractResult = await extractAll(text, phone, currentState);

  const output: Record<string, any> = {};
  for (const [field, info] of Object.entries(extractResult.fields)) {
    output[field] = info.value;
  }
  return output;
}
