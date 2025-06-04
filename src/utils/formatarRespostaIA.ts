/**
 * Funções utilitárias para limpar e formatar a resposta da IA antes de enviar ao cliente.
 * O objetivo é manter a naturalidade, eliminar aberturas robóticas e evitar textos longos demais.
 */

const ABERTURAS_PROIBIDAS = [
  /^entendo[\s,:-]+/i,
  /^compreendo[\s,:-]+/i,
  /^claro[\s,:-]+/i,
  /^certo[\s,:-]+/i,
  /^ok[\s,:-]+/i,
  /^tudo bem[\s,:-]+/i,
  /^olá[\s,:-]+/i // (opcional, dependendo do estilo desejado)
];

/**
 * Remove aberturas robóticas do início do texto (ex: "Entendo...", "Compreendo...")
 */
export function limparAbertura(texto: string): string {
  let resultado = texto.trimStart();
  for (const padrao of ABERTURAS_PROIBIDAS) {
    resultado = resultado.replace(padrao, '').trimStart();
  }
  return resultado;
}

/**
 * Divide o texto em frases completas com base em pontuação final.
 */
export function dividirEmFrases(texto: string): string[] {
  return texto
    .split(/(?<=[.!?])\s+/)
    .map(f => f.trim())
    .filter(Boolean);
}

/**
 * Limita a resposta com base no número máximo de caracteres, mas sem cortar frases no meio.
 * Retorna as frases inteiras acumuladas até atingir o limite.
 */
export function limitarRespostaPorTamanho(texto: string, limite = 360): string {
  const frases = dividirEmFrases(texto);
  const acumulado: string[] = [];
  let total = 0;

  for (const frase of frases) {
    const novaTotal = total + frase.length + 1;
    if (novaTotal > limite) break;
    acumulado.push(frase);
    total = novaTotal;
  }

  return acumulado.join(' ').trim();
}

/**
 * Função principal: limpa, divide e limita a resposta da IA de forma natural e inteligente.
 */
export function formatarRespostaIA(textoOriginal: string, limite = 360): string {
  const limpo = limparAbertura(textoOriginal);
  return limitarRespostaPorTamanho(limpo, limite);
}
