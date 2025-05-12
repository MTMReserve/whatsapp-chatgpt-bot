/**
 * Extrai dados do cliente por heurísticas + fallback com IA.
 */
import { openai } from '../api/openai';

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
    if (match) return match[1].trim();
  }

  const resposta = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Extraia apenas o nome próprio do cliente, sem explicações.' },
      { role: 'user', content: `Frase: ${text}` }
    ]
  });

  const nome = resposta.choices[0]?.message?.content?.trim();
 return nome && nome.length > 2 ? nome : null;
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
    if (match) return match[1].trim();
  }

  return null;
}

// --- ORÇAMENTO ---

export function extractBudget(text: string): number | null {
  const match = text.match(/(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?/g);
  if (!match) return null;
  const raw = match[0].replace(/\./g, '').replace(',', '.');
  const valor = parseFloat(raw);
  return isNaN(valor) ? null : valor;
}

export function extractNegotiatedPrice(text: string): number | null {
  const match = text.match(/(?:por|em|a)\s*R?\$?\s?(\d{1,3}(\.\d{3})*|\d+)(,\d{2})?/i);
  if (!match) return null;
  const raw = match[1].replace('.', '').replace(',', '.');
  const valor = parseFloat(raw);
  return isNaN(valor) ? null : valor;
}

// --- ENDEREÇO ---

export function extractAddress(text: string): string | null {
  const palavrasChave = ['rua', 'avenida', 'estrada', 'rodovia', 'travessa', 'alameda', 'bairro', 'número', 'cep', 'quadra', 'lote'];
  const lowerText = text.toLowerCase();
  if (palavrasChave.some(palavra => lowerText.includes(palavra)) && text.length > 10) {
    return text.trim();
  }
  return null;
}

// --- PAGAMENTO ---

export function extractPaymentMethod(text: string): string | null {
  const formas = ['pix', 'cartão', 'credito', 'débito', 'dinheiro', 'transferência', 'boleto'];
  const txt = text.toLowerCase();
  for (const forma of formas) {
    if (txt.includes(forma)) return forma;
  }
  return null;
}
