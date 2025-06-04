// src/services/validadorMultiplos.ts

import { ClientRepository } from './clientRepository';
import { logger } from '../utils/logger';
import { metasPorEtapa, EtapaFunil } from './metaPorEtapa';
import { CampoCliente, todosOsCamposCliente } from '../types/CampoCliente';
import { getProdutoInfo, type ProdutoID } from '../produto/produtoMap';
import { extractAndValidateAll } from './ExtractionService';
import { logCampoRejeitado } from '../repositories/mongo/rejectionLog.mongo';

export type CampoSuportado = CampoCliente;

export interface ValidarCamposParams {
  phone: string;
  texto: string;
  etapa: EtapaFunil;
  clientId: number;
  executionId: string;
}

export interface ResultadoValidacao {
  campo: CampoSuportado;
  status: 'preenchido' | 'salvo' | 'rejeitado' | 'nao_encontrado';
  valor?: any;
}

export async function validarTodosCamposPorEtapa(params: ValidarCamposParams): Promise<ResultadoValidacao[]> {
  const { phone, texto, etapa, clientId, executionId } = params;
  logger.info(`[validadorMultiplos] [${executionId}] 🛠️ Iniciando validação múltipla para etapa '${etapa}'`);

  const metas = metasPorEtapa[etapa]?.filter((campo): campo is CampoSuportado =>
    todosOsCamposCliente.includes(campo as CampoCliente)
  );

  if (!metas || metas.length === 0) {
    logger.debug(`[validadorMultiplos] [${executionId}] Nenhuma meta válida definida para etapa: ${etapa}`);
    return [];
  }

  const cliente = await ClientRepository.findByPhone(phone);
  if (!cliente) {
    logger.warn(`[validadorMultiplos] [${executionId}] Cliente com telefone ${phone} não encontrado.`);
    return [];
  }

  const produtoId = (cliente.produto_id ?? 'produto1') as ProdutoID;
  const produtoInfo = getProdutoInfo(produtoId, 'validadorMultiplos');

  const extractResult = await extractAndValidateAll(texto, phone, metas);

  const resultados: ResultadoValidacao[] = [];

  for (const campo of metas) {
    const info = extractResult.fields[campo];
    const valorAnterior = (cliente as any)[campo];

    // campo já preenchido corretamente
    if (valorAnterior && info?.value === valorAnterior && info?.valid) {
      resultados.push({ campo, status: 'preenchido', valor: valorAnterior });
      continue;
    }

    // campo não aplicável
    if (campo === 'address' && produtoInfo.requires_address === false) {
      await ClientRepository.updateField(phone, campo, null);
      await logCampoRejeitado({
        phone,
        clientId,
        campo,
        valor: null,
        motivo: 'Campo não aplicável ao produto',
        messageIn: texto,
        createdAt: new Date()
      });
      resultados.push({ campo, status: 'rejeitado', valor: null });
      continue;
    }

    // campo ausente
    if (!info || info.value === null || info.value === undefined) {
      resultados.push({ campo, status: 'nao_encontrado' });
      continue;
    }

    // campo rejeitado
    if (!info.valid) {
      await ClientRepository.updateField(phone, campo, null);
      await logCampoRejeitado({
        phone,
        clientId,
        campo,
        valor: info.value,
        motivo: 'Valor inválido',
        messageIn: texto,
        createdAt: new Date()
      });
      resultados.push({ campo, status: 'rejeitado', valor: info.value });
      continue;
    }

    // campo aprovado
    await ClientRepository.updateField(phone, campo, info.value);
    resultados.push({ campo, status: 'salvo', valor: info.value });
  }

  logger.info(`[validadorMultiplos] [${executionId}] ✅ Validação múltipla concluída para etapa '${etapa}'`);
  return resultados;
}

export function etapaConcluida(validacoes: ResultadoValidacao[]): boolean {
  return validacoes.every((r) => r.status === 'preenchido' || r.status === 'salvo');
}

export async function validarCamposExtraidos(params: ValidarCamposParams, campos: CampoSuportado[]): Promise<ResultadoValidacao[]> {
  const todasValidacoes = await validarTodosCamposPorEtapa(params);
  return todasValidacoes.filter((v) => campos.includes(v.campo));
}
