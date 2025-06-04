import type { Client } from '../types/Client'; // ✅ Corrigido: import da interface no local correto
import { ClientRepository } from './clientRepository';
import { logger } from '../utils/logger';

/**
 * Gera um resumo estratégico da conversa com base nos dados salvos no MySQL (tabela clients).
 * Agora retorna um resumo útil para IA decidir o que já foi resolvido.
 */
export async function gerarResumoDoHistorico(phone: string): Promise<string> {
  logger.debug(`[resumoDoHistorico] Iniciando leitura do histórico do cliente ${phone}`);

  try {
    const cliente = await ClientRepository.findByPhone(phone);
    if (!cliente) {
      logger.warn(`[resumoDoHistorico] Cliente com telefone ${phone} não encontrado no banco.`);
      return '';
    }

    const partes: string[] = [];
    const camposResolvidos: string[] = [];

    if (cliente.name && cliente.name.toLowerCase() !== 'cliente') {
      partes.push(`🧾 Nome: ${cliente.name}`);
      camposResolvidos.push('name');
      logger.debug(`[resumoDoHistorico] name: ${cliente.name}`);
    }

    // 🔧 Novos campos de negociação
    if (cliente.negotiated_price) {
      partes.push(`💰 Já foi negociado um preço especial: R$ ${cliente.negotiated_price}`);
      camposResolvidos.push('negotiated_price');
      logger.debug(`[resumoDoHistorico] negotiated_price: ${cliente.negotiated_price}`);
    }

    if (cliente.desconto) {
      partes.push(`🔻 O cliente solicitou ou recebeu um desconto: ${cliente.desconto}`);
      camposResolvidos.push('desconto');
      logger.debug(`[resumoDoHistorico] desconto: ${cliente.desconto}`);
    }

    const campos: [string, string | null | undefined][] = [
      ['needs', cliente.needs],
      ['attempted_solutions', cliente.attempted_solutions],
      ['expectations', cliente.expectations],
      ['urgency_level', cliente.urgency_level],
      ['client_stage', cliente.client_stage],
      ['objection_type', cliente.objection_type],
      ['purchase_intent', cliente.purchase_intent],
      ['scheduling_preference', cliente.scheduling_preference],
      ['reactivation_reason', cliente.reactivation_reason],
      ['feedback', cliente.feedback],
    ];

    campos.forEach(([label, valor]) => {
      if (valor) {
        const labelFormatado = label.replace(/_/g, ' ');
        partes.push(`🧾 ${labelFormatado}: ${valor}`);
        camposResolvidos.push(label);
        logger.debug(`[resumoDoHistorico] ${label}: ${valor}`);
      }
    });

    if (partes.length === 0) {
      logger.info('[resumoDoHistorico] Nenhuma informação relevante encontrada para montar o resumo.');
      return '';
    }

    const resumo = [
      `📌 DADOS JÁ CONHECIDOS DO CLIENTE:`,
      ...partes,
      '',
      `⚠️ INSTRUÇÕES PARA A IA:`,
      `- Os campos já preenchidos são: ${camposResolvidos.join(', ')}.`,
      `- Evite repetir perguntas sobre essas informações.`,
      `- Foque em avançar para os dados que ainda não foram coletados.`,
      `- Se preço já foi negociado, evite voltar ao preço cheio.`,
      `- ⚠️ Nunca use o nome do cliente como se fosse seu próprio nome.`,
      `  Você é um assistente virtual, sem nome pessoal. Representa a barbearia ou empresa do cliente.`,
      `  Evite frases como “eu também me chamo...”, “meu nome também é...”.`,
    ].join('\n');

    return resumo;
  } catch (error) {
    logger.error('[resumoDoHistorico] ❌ Erro ao gerar resumo do cliente', { error });
    return '';
  }
}
