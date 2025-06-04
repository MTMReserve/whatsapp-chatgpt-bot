import { logger } from './logger';

const extenso = require('extenso'); // Você precisa instalar com: npm install extenso

/**
 * Converte valores numéricos e siglas comerciais em linguagem falada natural.
 * Exemplo: "R$ 497 à vista via PIX ou 12x de R$ 43 sem juros"
 * Vira:    "quatrocentos e noventa e sete reais à vista via pics ou doze vezes de quarenta e três reais sem juros"
 */
export function naturalizarTexto(texto: string): string {
  try {
    let convertido = texto;

    // R$ 497 → "quatrocentos e noventa e sete reais"
    convertido = convertido.replace(/R\$ ?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)/g, (_, numero) => {
      const valorNumerico = parseFloat(numero.replace('.', '').replace(',', '.'));
      const valorPorExtenso = extenso(valorNumerico, { mode: 'currency' });
      return valorPorExtenso;
    });

    // 12x → "doze vezes"
    convertido = convertido.replace(/(\d+)[ ]?x/gi, (_, parcelas) => {
      const parcelasInt = parseInt(parcelas);
      const parcelasExtenso = extenso(parcelasInt);
      return `${parcelasExtenso} vezes`;
    });

    // R$ 43 sem juros → "quarenta e três reais sem juros"
    convertido = convertido.replace(/(\d+)(,\d{2})?/g, (match) => {
      const numero = parseFloat(match.replace(',', '.'));
      return extenso(numero);
    });

    // PIX → "pics"
    convertido = convertido.replace(/\bPIX\b/gi, 'pics');

    // R$ → já convertido acima

    return convertido;
  } catch (err) {
    logger.error('[naturalizarTexto] Erro ao naturalizar texto', { texto, err });
    return texto; // fallback: retorna o original
  }
}
