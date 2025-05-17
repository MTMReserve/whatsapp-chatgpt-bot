import { openai } from '../api/openai';
import { logger } from '../utils/logger';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// --- NOME ---
export async function extractNameSmart(text: string): Promise<string | null> {
  const padroes = [
    /meu nome é\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /me chamo\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /sou\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /aqui é o\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /fala com o\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i
  ];

  for (const padrao of padroes) {
    const match = text.match(padrao);
    if (match) {
      logger.debug(`[extractNameSmart] Nome extraído via regex: ${match[1]}`);
      return match[1].trim();
    }
  }

  logger.debug(`[extractNameSmart] Tentando fallback via ChatGPT com texto: "${text}"`);

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Extraia apenas o nome próprio do cliente, sem explicações.' },
        { role: 'user', content: `Frase: ${text}` }
      ]
    });

    const nome = resposta.choices[0]?.message?.content?.trim();
    logger.debug(`[extractNameSmart] Nome extraído via ChatGPT: ${nome}`);

    return nome && nome.length > 2 ? nome : null;
  } catch (error) {
    logger.error(`[extractNameSmart] Erro ao extrair nome com IA`, { error });
    return null;
  }
}

export function extractName(text: string): string | null {
  const padroes = [
    /meu nome é\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /me chamo\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /sou\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /aqui é o\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i,
    /fala com o\s+([A-ZÁ-Ú][a-zá-ú]+(?:\s[A-ZÁ-Ú][a-zá-ú]+)?)/i
  ];

  for (const padrao of padroes) {
    const match = text.match(padrao);
    if (match) {
      const fullName = match[1].trim();
      const parts = fullName.split(/\s+/);

      if (parts.length === 2 && /^[A-ZÀ-Ú]/.test(parts[1])) {
        logger.debug(`[extractName] Nome completo extraído: ${fullName}`);
        return `${parts[0]} ${parts[1]}`;
      }
      logger.debug(`[extractName] Primeiro nome extraído: ${parts[0]}`);
      return parts[0];
    }
  }

  logger.debug(`[extractName] Nenhum nome extraído do texto: "${text}"`);
  return null;
}

// --- ORÇAMENTO ---
export async function extractBudget(text: string): Promise<number | null> {
  const match = text.match(/(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?/g);
  if (match) {
    const raw = match[0].replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(raw);
    logger.debug(`[extractBudget] Valor extraído: ${valor}`);
    return isNaN(valor) ? null : valor;
  }

  logger.debug('[extractBudget] Nenhum valor encontrado. Tentando fallback via IA.');

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Extraia o valor do orçamento citado na frase, em formato numérico. Sem explicações.' },
      { role: 'user', content: text }
    ];

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    const respostaTexto = resposta.choices[0]?.message?.content?.replace(',', '.').trim();
    const valor = parseFloat(respostaTexto || '');
    logger.debug(`[extractBudget] Valor extraído via IA: ${valor}`);
    return isNaN(valor) ? null : valor;
  } catch (error) {
    logger.error('[extractBudget] Erro ao usar IA para extrair orçamento', { error });
    return null;
  }
}

export function extractNegotiatedPrice(text: string): number | null {
  const match = text.match(/(?:por|em|a)\s*R?\$?\s?(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?/i);
  if (!match) {
    logger.debug('[extractNegotiatedPrice] Nenhum preço negociado encontrado');
    return null;
  }

  const raw = match[1].replace(/\./g, '').replace(',', '.');
  const valor = parseFloat(raw);
  logger.debug(`[extractNegotiatedPrice] Preço negociado extraído: ${valor}`);
  return isNaN(valor) ? null : valor;
}

// --- ENDEREÇO ---
export function extractAddress(text: string): string | null {
  const palavrasChave = ['rua', 'avenida', 'estrada', 'rodovia', 'travessa', 'alameda', 'bairro', 'número', 'cep', 'quadra', 'lote'];
  const lowerText = text.toLowerCase();

  if (palavrasChave.some(palavra => lowerText.includes(palavra)) && text.length > 10) {
    logger.debug(`[extractAddress] Endereço extraído: ${text.trim()}`);
    return text.trim();
  }

  logger.debug('[extractAddress] Nenhum endereço identificado');
  return null;
}

// --- PAGAMENTO ---
export function extractPaymentMethod(text: string): string | null {
  const formas = ['pix', 'cartão', 'credito', 'débito', 'dinheiro', 'transferência', 'boleto'];
  const txt = text.toLowerCase();

  for (const forma of formas) {
    if (txt.includes(forma)) {
      logger.debug(`[extractPaymentMethod] Método de pagamento identificado: ${forma}`);
      return forma;
    }
  }

  logger.debug('[extractPaymentMethod] Nenhuma forma de pagamento reconhecida');
  return null;
}

// --- NECESSIDADE COM IA ---
export async function extractNeeds(text: string): Promise<string | null> {
  const regex = /precis[ao] de (.*)/i;
  const match = text.match(regex);
  if (match) {
    logger.debug(`[extractNeeds] Necessidade extraída por regex: ${match[1].trim()}`);
    return match[1].trim();
  }

  logger.debug(`[extractNeeds] Tentando fallback via IA com texto: "${text}"`);

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Extraia a necessidade do cliente em poucas palavras, sem comentários.' },
      { role: 'user', content: text }
    ];

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    const output = resposta.choices[0]?.message?.content?.trim();
    logger.debug(`[extractNeeds] Necessidade extraída via ChatGPT: ${output}`);
    return output || null;
  } catch (error) {
    logger.error('[extractNeeds] Erro ao usar IA para extrair necessidade', { error });
    return null;
  }
}
