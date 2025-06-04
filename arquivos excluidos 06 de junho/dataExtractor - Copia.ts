import { openai } from '../api/openai';
import { logger } from '../utils/logger';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { Client } from '../types/Client';
import { ExtractionService, ExtractResult } from './ExtractionService';

// === CAMPOS EXISTENTES (mantidos) ===

// --- NOME ---
export async function extractNameSmart(text: string): Promise<string | null> {
  const padroes = [
    /meu nome é\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /me chamo\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /sou\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
  ];

  for (const padrao of padroes) {
    const match = text.match(padrao);
    if (match) {
      const nome = match[1].trim();
      logger.debug(`[extractNameSmart] Nome extraído via regex: ${nome}`);
      return nome;
    }
  }

  logger.debug('[extractNameSmart] Nenhum padrão de nome reconhecido via regex');
  return null;
}

export async function extractName(text: string): Promise<string | null> {
  const viaRegex = await extractNameSmart(text);
  if (viaRegex) return viaRegex;

  logger.debug('[extractName] Tentando extração de nome via IA...');
  const prompt = 'Extraia o primeiro nome da pessoa, de forma direta, com no máximo 2 palavras. Se não for possível, responda "null".';
  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ];
    const resposta = await openai.chat.completions.create({ model: 'gpt-4', messages });
    const conteudo = resposta.choices[0]?.message?.content?.trim();

    if (!conteudo || conteudo.toLowerCase() === 'null') {
      logger.debug('[extractName] IA respondeu null ou vazio');
      return null;
    }

    logger.debug(`[extractName] Nome extraído via IA: ${conteudo}`);
    return conteudo;
  } catch (error) {
    logger.error('[extractName] Erro ao extrair nome com IA', { error });
    return null;
  }
}

export async function extractNeeds(text: string): Promise<string | null> {
  const padrao = /preciso de (.+?)(?:\.|\s|$)/i;
  const match = text.match(padrao);
  if (match) {
    const needs = match[1].trim();
    logger.debug(`[extractNeeds] Necessidade extraída via regex: ${needs}`);
    return needs;
  }

  logger.debug('[extractNeeds] Nenhuma necessidade reconhecida via regex');
  return null;
}

export async function extractBudget(text: string): Promise<number | null> {
  const match = text.match(/(\d+)\s?(?:reais|r\$)?/i);
  if (match) {
    const valor = parseFloat(match[1]);
    logger.debug(`[extractBudget] Orçamento extraído via regex: R$ ${valor}`);
    return isNaN(valor) ? null : valor;
  }

  logger.debug('[extractBudget] Nenhum orçamento reconhecido via regex');
  return null;
}

export async function extractNegotiatedPrice(text: string): Promise<number | null> {
  return extractBudget(text);
}

export async function extractAddress(text: string): Promise<string | null> {
  const padrao = /(?:endereço|moro na|fica na)\s(.+?)(?:\.|,|$)/i;
  const match = text.match(padrao);
  if (match) {
    const endereco = match[1].trim();
    logger.debug(`[extractAddress] Endereço extraído via regex: ${endereco}`);
    return endereco;
  }

  logger.debug('[extractAddress] Nenhum endereço reconhecido via regex');
  return null;
}

export async function extractPaymentMethod(text: string): Promise<string | null> {
  const padroes = ['pix', 'cartão', 'dinheiro', 'boleto', 'transferência'];
  const encontrado = padroes.find((m) => text.toLowerCase().includes(m));
  logger.debug(`[extractPaymentMethod] Forma de pagamento encontrada: ${encontrado || 'nenhuma'}`);
  return encontrado || null;
}

export async function extractFeedback(text: string): Promise<string | null> {
  const padrao = /(?:feedback|achei que|gostei de|não gostei de|o que achei).+?([^.]{5,})/i;
  const match = text.match(padrao);
  if (match) {
    const feedback = match[1].trim();
    logger.debug(`[extractFeedback] Feedback extraído via regex: ${feedback}`);
    return feedback;
  }

  logger.debug('[extractFeedback] Nenhum feedback reconhecido via regex');
  return null;
}

export async function extractReactivationReason(text: string): Promise<string | null> {
  const padrao = /(?:voltei porque|quero voltar|decidi tentar|resolvi voltar)\s(.+?)(?:\.|,|$)/i;
  const match = text.match(padrao);
  if (match) {
    const razao = match[1].trim();
    logger.debug(`[extractReactivationReason] Razão extraída via regex: ${razao}`);
    return razao;
  }

  logger.debug('[extractReactivationReason] Nenhuma razão de reativação reconhecida via regex');
  return null;
}

// === NOVOS CAMPOS IMPLEMENTADOS ===

export async function extractScheduleTime(text: string): Promise<string | null> {
  const match = text.match(/(segunda|terça|quarta|quinta|sexta|sábado|domingo).*?(manhã|tarde|noite)/i);
  if (match) {
    const resultado = `${match[1]} ${match[2]}`.trim();
    logger.debug(`[extractScheduleTime] Extraído via regex: ${resultado}`);
    return resultado;
  }
  return null;
}

export async function extractAttemptedSolutions(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia as soluções que o cliente já tentou anteriormente.');
}

export async function extractExpectations(text: string): Promise<string | null> {
  return extractByIA(text, 'O que o cliente espera ou deseja alcançar com esse serviço?');
}

export async function extractUrgencyLevel(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia o nível de urgência do cliente (baixa, média, alta, imediata).');
}

export async function extractClientStage(text: string): Promise<string | null> {
  return extractByIA(text, 'Em que estágio o cliente está? (interesse, dúvida, decisão, fechamento)');
}

export async function extractObjectionType(text: string): Promise<string | null> {
  return extractByIA(text, 'Qual o tipo de objeção apresentada pelo cliente? (preço, tempo, confiança, etc.)');
}

export async function extractPurchaseIntent(text: string): Promise<string | null> {
  return extractByIA(text, 'Existe intenção de compra? Responda com: "sim", "talvez", ou "não".');
}

export async function extractSchedulingPreference(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia a preferência de agendamento do cliente. Ex: "pela manhã", "após as 18h".');
}

// === Utilitário interno ===

async function extractByIA(text: string, prompt: string): Promise<string | null> {
  try {
    logger.debug(`[extractByIA] Prompt: ${prompt}`);
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ];
    const resposta = await openai.chat.completions.create({ model: 'gpt-4', messages });
    const conteudo = resposta.choices[0]?.message?.content?.trim();
    logger.debug(`[extractByIA] Resultado IA: ${conteudo}`);
    return conteudo || null;
  } catch (error) {
    logger.error('[extractByIA] Erro ao usar IA', { error });
    return null;
  }
}

export async function extractDisponibilidade(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia a disponibilidade de horário do cliente. Ex: "sexta à tarde", "amanhã de manhã".');
}

export async function extractMotivoObjecao(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia o motivo da objeção do cliente, de forma direta e resumida.');
}

export async function extractAlternativa(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia a alternativa proposta pelo cliente em vez da oferta principal.');
}

export async function extractDesconto(text: string): Promise<number | null> {
  const match = text.match(/(\d{1,2})\s?%/);
  if (match) {
    const perc = parseInt(match[1]);
    logger.debug(`[extractDesconto] Encontrado via regex: ${perc}%`);
    return isNaN(perc) ? null : perc;
  }

  const output = await extractByIA(text, 'Extraia o valor percentual de desconto solicitado. Apenas o número.');
  const perc = parseInt((output || '').replace('%', ''));
  logger.debug(`[extractDesconto] Extraído via IA: ${perc}%`);
  return isNaN(perc) ? null : perc;
}

export async function extractFormaPagamento(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia a forma de pagamento citada pelo cliente (pix, cartão, etc.)');
}

export async function extractConfirmacao(text: string): Promise<string | null> {
  return extractByIA(text, 'Cliente confirmou o fechamento? Retorne: "sim", "confirmado" ou similar.');
}

export async function extractIndicacao(text: string): Promise<string | null> {
  return extractByIA(text, 'Extraia o nome ou contato da pessoa indicada pelo cliente.');
}

// === NOVO: Função de extração/validação unificada ===

/**
 * Extrai e valida todos os campos obrigatórios para o estado atual do funil,
 * usando ExtractionService. Retorna um ExtractResult com
 * todos os campos mapeados em { value, valid, reason }.
 */
export async function extractAll(
  message: string,
  clientId: string,
  currentState: string
): Promise<ExtractResult> {
  // Determinar campos obrigatórios baseados no estado atual do funil
  const { fieldsRequired } = 
    (await import('./metaPorEtapa')).metaPorEtapa[currentState] as {
      fieldsRequired: (keyof Client)[];
    };

  // Chamar ExtractionService para extrair e validar tudo de uma vez
  const result = await ExtractionService.extractAndValidateAll(
    message,
    clientId,
    fieldsRequired
  );

  return result;
}

// === ADEQUAÇÃO: extractAllFields agora delega a extractAll ===

export async function extractAllFields(
  phone: string,
  text: string,
  currentState: string
): Promise<Record<string, any>> {
  // Usa extractAll para obter todos os campos validados
  const extractResult = await extractAll(text, phone, currentState);

  // Converte o ExtractResult.fields em um objeto simples { campo: valor }
  const output: Record<string, any> = {};
  for (const [field, info] of Object.entries(extractResult.fields)) {
    output[field] = info.value;
  }
  return output;
}
