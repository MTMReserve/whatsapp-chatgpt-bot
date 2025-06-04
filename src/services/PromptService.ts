// src/services/PromptService.ts

import { gerarResumoDoHistorico } from './resumoDoHistorico';
import { getProdutoInfo, type ProdutoID } from '../produto/produtoMap';
import { botPersona } from '../persona/botPersona';
import type { EtapaFunil } from './metaPorEtapa';
import { logger } from '../utils/logger';

/**
 * Monta o systemPrompt completo para a IA com base no histórico, etapa, produto e estilo do bot.
 */
export async function gerarPromptIA(params: {
  phone: string;
  etapa: EtapaFunil;
  mensagemCliente: string;
  produtoId: ProdutoID;
  camposAusentes?: string[];
}): Promise<string> {
  const { phone, etapa, mensagemCliente, produtoId, camposAusentes = [] } = params;

  const partes: string[] = [];

  // Descrição geral da personalidade do bot
  partes.push(botPersona.descricaoBase.trim());

  // Adiciona histórico resumido
  const resumoHistorico = await gerarResumoDoHistorico(phone);
  if (resumoHistorico) partes.push(resumoHistorico);

  // Instrução específica de abordagem
  if (etapa === 'abordagem') partes.push(botPersona.descricaoAbordagem.trim());

  // Campos ausentes (se houver)
  if (camposAusentes.length > 0) {
    partes.push(`⚠️ Os seguintes dados ainda não foram identificados: ${camposAusentes.join(', ')}.
Você deve, com naturalidade, tentar descobrir ou confirmar esses pontos durante a conversa.`);
  }

  // Informações do produto
  const produto = getProdutoInfo(produtoId, 'PromptService');
  partes.push(`📦 Produto: ${produto.nome} - ${produto.descricao}`);
  if (produto.beneficios) partes.push(`Benefícios:\n- ${produto.beneficios.join('\n- ')}`);
  if (produto.promocao) partes.push(`🔥 Promoção atual: ${produto.promocao}`);
  if (produto.garantias) partes.push(`✅ Garantia: ${produto.garantias}`);
  if (produto.local_realizacao) partes.push(`📍 Local de realização: ${produto.local_realizacao}`);
  if (produto.instrucoesPagamento) partes.push(`💰 Instruções de pagamento: ${produto.instrucoesPagamento}`);

  // Estilo de fala e instruções gerais
  partes.push(`
📏 INSTRUÇÕES DE FALA:
- Nunca comece com “Entendo”, “Claro que sim”, “Com certeza”, “Eu sou um assistente”, etc.
- Responda direto à dúvida ou mensagem do cliente, com naturalidade e empatia.
- Use frases curtas, práticas e amigáveis. Evite enrolações ou textos longos.
- Se possível, responda com uma pergunta estratégica no final para manter o diálogo.
`.trim());

  const promptFinal = partes.join('\n\n');

  logger.debug(`[PromptService] Prompt gerado para etapa ${etapa}:\n${promptFinal}`);

  return promptFinal;
}
