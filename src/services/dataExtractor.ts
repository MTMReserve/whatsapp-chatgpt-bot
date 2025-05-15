import { openai } from '../api/openai';
import { logger } from '../utils/logger'; // ✅ IMPORTAÇÃO DE LOGGER

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
export function extractBudget(text: string): number | null {
  const match = text.match(/(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?/g);
  if (!match) {
    logger.debug('[extractBudget] Nenhum valor encontrado');
    return null;
  }

  const raw = match[0].replace(/\./g, '').replace(',', '.');
  const valor = parseFloat(raw);
  logger.debug(`[extractBudget] Valor extraído: ${valor}`);
  return isNaN(valor) ? null : valor;
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
