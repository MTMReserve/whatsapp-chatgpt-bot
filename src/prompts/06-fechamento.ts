// src/prompts/06-fechamento.ts
import { type ProdutoID } from '../produto/produtoMap';
import { getProdutoInfo } from '../produto/produtoMap';

/**
 * Gera dinamicamente o prompt de fechamento com base no produto selecionado.
 * Esse conteúdo será enviado ao cliente B2C na etapa final do funil.
 * A ficha do produto é definida pelo cliente B2B.
 */
const fechamentoPrompt = (produtoId: ProdutoID): string => {
  const produto = getProdutoInfo(produtoId, 'fechamentoPrompt');

  const blocoPagamento = produto.formasPagamento && produto.instrucoesPagamento
    ? `💰 Formas de pagamento aceitas: ${produto.formasPagamento.join(', ')}\n📌 Como pagar: ${produto.instrucoesPagamento}\n`
    : '';

  const blocoEntrega = produto.entrega && produto.instrucoesEntrega
    ? `🚚 Tipo de entrega: ${produto.entrega}\n📦 Como você recebe: ${produto.instrucoesEntrega}\n`
    : '';

  return `
🎯 OBJETIVO DESTA ETAPA:
- Confirmar o interesse do cliente e conduzir para a finalização da compra.
- Coletar os dados finais (nome completo, forma de pagamento, endereço, agendamento).
- Garantir que o cliente se sinta seguro e entenda os próximos passos.

📌 CHECKLIST DE OBJETIVOS DESTA ETAPA:
- [ ] Validar o “sim” do cliente de forma natural e positiva
- [ ] Confirmar: nome completo, endereço (se aplicável), forma de pagamento
- [ ] Oferecer ajuda prática (ex: envio de link, explicação do agendamento)
- [ ] Garantir que o cliente saiba o que acontece depois do fechamento

✅ ESTRATÉGIAS DE CONDUÇÃO:
1. **Reforce o valor e crie confiança**:

2. **Ofereça um passo simples e direto**:

3. **Ajude o cliente a visualizar o depois**:

4. **Se o cliente hesitar ou sumir por um momento**:

📏 INSTRUÇÕES DE RESPOSTA:
- Fale em até 2 frases curtas por vez.
- Seja claro, gentil e positivo — nunca apressado.
- Use linguagem de ação: “confirmar”, “começar”, “reservar”, “garantir”.
- Emojis só se o cliente também estiver usando.

📋 INSTRUÇÕES DE COLETA DE DADOS:
- Pergunte ou confirme:
  - Nome completo
  - Endereço (se necessário para o serviço)
  - Forma de pagamento
  - Horário ou data preferida (se for com agendamento)
- Se o cliente já tiver informado, evite repetir. Apenas confirme.

${blocoPagamento}${blocoEntrega}

`;
};

export default fechamentoPrompt;
