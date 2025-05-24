// src/utils/midiaHelper.ts

import path from 'path';
import fs from 'fs';
import { mediaMap } from '../media/mediaMap';
import { logger } from './logger';

type MediaType = 'image' | 'video' | 'document';

export interface Midia {
  type: MediaType;
  file: string;     // Caminho relativo dentro de src/media
  caption?: string; // Legenda opcional
}

/**
 * Busca as mídias associadas a uma etapa de funil para determinado produto
 * @param produtoId ID do produto (ex: 'micropigmentacao_barba')
 * @param etapa Nome da etapa do funil (ex: 'proposta', 'fechamento', etc.)
 * @returns Lista de mídias com caminho local e legenda (se houver)
 */
export function getMidiasPorEtapa(produtoId: string, etapa: string): Midia[] {
  try {
    const midias = mediaMap[produtoId]?.[etapa] || [];

    const midiasExistentes = midias.filter((m) => {
      const fullPath = path.resolve(__dirname, '..', 'media', m.file);
      const existe = fs.existsSync(fullPath);
      if (!existe) {
        logger.warn(`[midiaHelper] ⚠️ Arquivo de mídia não encontrado: ${fullPath}`);
      }
      return existe;
    });

    return midiasExistentes;
  } catch (err) {
    logger.error(`[midiaHelper] ❌ Erro ao buscar mídias: produto=${produtoId}, etapa=${etapa}`, { error: err });
    return [];
  }
}
