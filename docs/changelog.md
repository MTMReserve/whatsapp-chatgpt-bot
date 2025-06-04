## [v1.13.3] - 2025-06-04

**Tipo:** 🧠 Inteligência Contextual + 🎭 Monitoramento Emocional  
**Responsável:** Dev Full Stack

---

### ✨ Novos Recursos

- **Integração do monitoramento emocional com o fluxo do bot**, via `monitorClientBehavior(phone)`:

  - A cada 5 mensagens do cliente (`from: 'user'`), o comportamento do bot é ajustado com base em sinais como pressa, desinteresse ou formalidade.
  - O resultado da análise ajusta dinamicamente a `botPersona`, permitindo variação de estilo e empatia.

- **Persistência do campo `from` nas interações salvas no MongoDB**:
  - Campo obrigatório `from: 'user' | 'bot'` adicionado à interface `InteractionData` e ao schema `InteractionSchema`.
  - Agora é possível distinguir quem enviou cada mensagem (usuário ou bot), essencial para rastreamento emocional e futuras análises.

---

### 🛠️ Refatorações

- Arquivo `src/services/conversationManager/index.ts`:

  - Inserida chamada condicional ao `monitorClientBehavior` no final de `handleMessage()`.
  - Cálculo de mensagens do cliente feito via `getConversationByPhone(phone)` com filtro `m.from === 'user'`.

- Arquivo `src/repositories/mongo/interactionLog.mongo.ts`:
  - Interface e schema atualizados com o novo campo `from`.
  - Função `saveInteractionLog()` adaptada para exigir `from` explicitamente (evitando erro de tipagem).

---

### 🧪 Testes e Validações

- Logs confirmam que o monitoramento é acionado corretamente a cada 5 mensagens.
- IA responde com ajuste de tom conforme o perfil emocional detectado.
- `build` 100% validado (`tsc` sem erros).

---

### 📁 Arquivos Modificados

| Tipo | Caminho                                          | Descrição                             |
| ---- | ------------------------------------------------ | ------------------------------------- |
| ✏️   | `src/services/conversationManager/index.ts`      | Integração do `monitorClientBehavior` |
| ✏️   | `src/repositories/mongo/interactionLog.mongo.ts` | Adição do campo `from` no schema      |

---

### 🔍 Rastreabilidade

- Campo `from` agora é usado como critério primário para ativação do monitor emocional.
- Log completo da origem de cada mensagem (cliente ou bot) salvo no MongoDB com `createdAt`.
- Garante base futura para análise de comportamento por IA e dashboards em tempo real.

---

🏁 **Status da Versão**  
🟢 Concluída – Integração funcional, logs rastreáveis e comportamento do bot validado.

## [v1.13.2] - 2025-06-04

Tipo: 🧠 Inteligência Contextual + 🧱 Persistência Dinâmica
Responsável: Dev Full Stack

✨ Novos recursos
🧠 Suporte completo à memória de contexto por cliente, com persistência em context_vars no MySQL.

Criado módulo contextMemory.ts com funções:

setContextVar(clientId, key, value)

getContextVar(clientId, key)

getAllContextVars(clientId)

clearContextVars(clientId)

Variáveis dinâmicas agora podem ser lidas e salvas no fluxo do bot, permitindo personalização inteligente por cliente e produto.

🛠️ Integrações no Fluxo do Bot
No conversationManager/index.ts:

Campos dinâmicos já preenchidos (ex: curso_nivel) são removidos de camposAusentes antes da chamada à IA.

Ao final do extractAndValidateAll(), os campos que não fazem parte do modelo Client são salvos automaticamente com setContextVar(...).

Se o atendimento for encerrado (nextState === 'encerramento'), o contexto do cliente é totalmente apagado com clearContextVars(...).

🔍 Rastreabilidade e Logs
Cada operação do contextMemory.ts possui log com prefixo temático:

💾 set

📥 get

📦 getAll

🧹 clear

❌ erro

📁 Arquivos Criados ou Modificados
Tipo Caminho Descrição
🆕 src/services/contextMemory.ts Novo módulo de memória de contexto com persistência
🔁 src/services/conversationManager/index.ts Integração total com leitura e salvamento de contexto

✅ Resultados da Entrega
Recurso Status
Tabela context_vars criada ✅
Funções de leitura e escrita ✅
Integração ao fluxo do bot ✅
Limpeza automática no encerramento ✅
Logs com rastreabilidade ✅

🔄 Status da Versão
🟢 Concluída – Testes locais e SQL realizados, integração funcional validada.

## [v1.13.1] - 2025-06-04

Tipo: 🧠 Integração Inteligente com MongoDB + 🔁 Refatoração Funcional
Responsável: Dev Full Stack

✨ Novos recursos
Implementada função getAnalyzedProfileFromMongo(phone) para recuperar o perfil psicológico real do cliente salvo no MongoDB, com fallback seguro.

Criado novo arquivo PerfilCliente.mongo.ts contendo o schema completo do perfil, com suporte a histórico (analyzedAt).

Chamada ao getAnalyzedProfile(...) no conversationManager/index.ts foi substituída pela nova função que usa leitura real do banco.

🛠️ Refatorações
Função getAnalyzedProfileByClientId(clientId) mantida como versão local com botPersona, para debug ou fallback manual.

O repositório clientProfileRepository.ts foi dividido logicamente em dois fluxos: leitura de memória (botPersona) e leitura persistente (Mongo).

Removido uso de getMongoCollection() inexistente, adaptado para uso correto com PerfilClienteModel.findOne() (via Mongoose).

📁 Arquivos Criados ou Modificados
Tipo Caminho Observação
🆕 novo src/models/PerfilCliente.mongo.ts Novo schema para perfis
✏️ mod src/repositories/clientProfileRepository.ts Leitura real do Mongo + fallback
✏️ mod src/services/conversationManager/index.ts Uso da função real getAnalyzedProfileFromMongo()

🔍 Rastreabilidade e Segurança
Logs detalhados adicionados para rastrear busca no Mongo e fallback.

Garantido comportamento previsível mesmo quando o perfil não foi analisado ainda.

Nenhuma quebra de compatibilidade com chamadas antigas.

🏁 Status da Versão
🟢 Concluída – Testes locais validados, leitura real de perfil confirmada com dados reais no banco.

## [v1.13.0] - 2025-06-03

🧠 Justificativa: trata-se de uma entrega de alto impacto funcional, com reintegração estratégica da inteligência do bot, reativação de módulos críticos, e correções em múltiplos serviços centrais. Embora boa parte da estrutura tenha sido criada na v1.12.0, esta versão completa e estabiliza a arquitetura com lógica adaptativa, resumos reativados, compatibilidade garantida e correções críticas
✨ Novos recursos
Ativação condicional do levantamento adaptativo por IA, com lógica leve ou profunda conforme nível de objeção.

Implementado suporte completo ao resumo do histórico com injeção no systemPrompt (via resumoDoHistorico.ts).

Reativada auditoria estratégica com logsEstrategia.mongo.ts, integrando causas de rejeição e respostas regeneradas.

🛠️ Refatorações
validadorMultiplos.ts completamente reformulado para basear-se no ExtractionService.ts, removendo dependências com validadorIA.ts.

StateService.ts passou a centralizar também o resumo de histórico e auditoria da IA, garantindo decisão inteligente contextualizada.

checklistFechamento.ts atualizado para exigir metas mínimas da etapa, com reforço de bloqueio no fechamento.

Ajustado dataExtractor.ts para delegar à nova função extractAndValidateAll, mantendo compatibilidade com extratores antigos.

webhookController.ts corrigido para uso correto da função handleMessage(phone, text, produtoId).

🐛 Correções
Correção de erro crítico em conversationManager.ts onde handleMessage() era chamado com parâmetros incorretos.

Erro de ausência de contexto resolvido: IA agora recebe resumo completo de histórico antes de cada resposta.

Garantia de não repetição de perguntas quando dados já estão preenchidos e válidos (ex: nome, endereço, confirmação).

Evita perda de dados sensíveis já validados e salvos, mesmo após múltiplas interações.

📚 Documentação
Atualização das instruções de uso da IA nos prompts estratégicos (via resumoDoHistorico.ts e botPersona.ts).

Registro das causas de rejeição no MongoDB com mensagens claras e contexto para análise futura.

📁 Arquivos Criados ou Modificados
Tipo Caminho Observação
🆕 levantamentoAdaptativo.ts IA decide entre modo leve e profundo
🔁 stateService.ts Unificado com resumo e auditoria
🔁 validadorMultiplos.ts Baseado no novo modelo fields
🔁 resumoDoHistorico.ts Reinjetado no systemPrompt
🔁 dataExtractor.ts Compatível com extractAndValidateAll()
🔁 webhookController.ts Corrigido uso do produtoId
🔁 checklistFechamento.ts Bloqueio via metaPorEtapa.ts
🔁 logsEstrategia.mongo.ts Registro de rejeições estratégicas

👨‍💻 Responsável
Dev Full Stack

🔄 Status da Versão
🟢 Concluída – testes locais validados, arquitetura consolidada, IA com comportamento previsível e rastreável.

## [v1.12.0] - 2025-06-03

✨ Novos recursos
Implementado serviço StateService.ts para unificação de decisão de estado e resposta da IA em um único prompt.

Criado ExtractionService.ts consolidando extração e validação de campos via IA.

Nova orquestração modular em conversationManager/index.ts, substituindo a versão anterior monolítica.

Introduzido sistema de auditoria com registrarAuditoriaIA para log detalhado das respostas da IA.

🛠️ Refatorações
Modularização total do fluxo de conversação (conversationManager.ts → conversationManager/index.ts).

Checklist de fechamento atualizado para bloquear envio se metas obrigatórias não forem atendidas.

Lógica de validação de proposta separada em verificadorPropostaNegociacao.ts com nova assinatura.

Arquivo Client.ts padronizado com campos obrigatórios consistentes com o funil.

webhookController.ts adaptado para receber resposta da IA no novo formato { text, audioBuffer }.

🐛 Correções
Blindagem do bot reforçada contra vazamento de identidade com regras explícitas em botPersona.ts.

Corrigido erro onde o bot assumia o nome do cliente.

Solucionado bug no fechamento em loop causado por checklist incompleto.

Prevenção contra alteração silenciosa de dados sensíveis com verificadorContradicoes.ts.

Corrigido erro de compilação por chamada a função inexistente extractAllFields.

📚 Documentação
Atualizado o resumoDoHistorico.ts para sempre incluir instruções de blindagem no systemPrompt.

Ajustada documentação interna de novos módulos e chamadas de IA com tokens e mensagens rastreáveis.

📁 Arquivos Criados
src/services/ExtractionService.ts

src/services/StateService.ts

src/services/conversationManager/index.ts

src/services/verificadorContradicoes.ts

🧹 Arquivos Substituídos / Arquivados
src/services/conversationManager.ts – substituído por index.ts

src/services/validadorIA.ts – substituído por ExtractionService.ts

src/services/aiStateDecider.ts – removido (não mais utilizado)

👨‍💻 Responsável
Dev Full Stack

🔄 Status da Versão
🟢 Concluída – build 100% validado, arquivos testados localmente, comportamento da IA aprovado.

## [v1.11.6] – 2025-05-31

**Tipo:** 🧠 Inteligência de IA + 🔍 Observabilidade  
**Tarefa:** DEV-005 – Integração da Auditoria das Respostas da IA

---

### ✅ Funcionalidade Entregue

Integração completa da função `registrarAuditoriaIA()` ao ciclo de atendimento do bot, com foco em rastrear e registrar as respostas geradas pela IA, etapa por etapa.

---

### 🧩 Alterações Técnicas

#### 🆕 Novo Serviço: `src/services/registrarAuditoriaIA.ts`

`````ts
registrarAuditoriaIA({
  prompt,
  mensagens,
  temperatura,
  tokens,
  etapa,
  phone,
  produtoId
});


## [v1.11.5] – 2025-05-31

**Tipo:** 📊 Observabilidade e Auditoria da IA
**Tarefa:** DEV-005 – Registro estruturado de decisões da IA (audit logs)

---

### 🧭 Motivo da Entrega

Durante testes de produção, a IA respondeu a uma objeção de preço com empatia, mas sem argumentos concretos. Essa falha destacou a necessidade de:

- Diagnóstico aprofundado das decisões da IA
- Registro completo de cada resposta para auditoria
- Preparação do sistema para análise de performance persuasiva

---

### ✅ Funcionalidade Implementada

#### 📁 `src/services/registrarAuditoriaIA.ts` (novo)

Função principal:

````ts
registrarAuditoriaIA({
  prompt,
  mensagens,
  temperatura,
  tokens,
  etapa,
  phone,
  produtoId
});


## [v1.11.4] – 2025-05-31

**Responsável:** Dev Full Stack
**Tipo:** 🔧 Ajustes de Comportamento da IA + 🔍 Estratégia de Conversão
**Tarefa:** NEG-001 – Validação de Proposta de Negociação pela IA

---

### ✅ Objetivo da Entrega

Garantir que a IA responda com propostas comerciais **completas, convincentes e estratégicas** durante a etapa de negociação, utilizando:

- Validação semântica
- Reforço de conteúdo obrigatório (preço, condição, argumento)
- Geração alternativa com temperatura elevada
- Registro completo para análise posterior

---

### 🔹 Funcionalidades Entregues

#### 1. **Validação de Propostas Fracas**

📁 `src/services/verificadorPropostaNegociacao.ts` (novo)

- Detecta se a resposta da IA:
  - Não contém valor
  - Não possui condição
  - É vaga ou genérica
- Motivos de rejeição são retornados como array:
  `['sem_valor', 'vaga', 'sem_condicao']`

#### 2. **Regeneração com Temperatura Elevada**

📁 `src/services/conversationManager.ts`

- Se a proposta for considerada fraca, a IA é instruída a gerar nova resposta com:
  ```ts
  temperature: 0.95;
`````

## [v1.11.3] – 2025-05-31

**Tipo:** 🐛 Correção crítica + 🧠 Consistência de comunicação + 🔐 Segurança de informação

---

### 🐛 Correção: Endereço Gerado Incorretamente pela IA

#### Problema:

Durante um atendimento real, o bot respondeu com o endereço fictício **"Rua das Flores, 123"**, não compatível com o local real do serviço. Isso:

- Compromete a confiabilidade da automação
- Gera risco de desencontro físico com o cliente
- Não respeita os dados comerciais do produto

---

### ✅ Ações Corretivas

#### 1. Atualização da Ficha do Produto – `produtoMap.ts`

- Criado novo campo: `local_realizacao`
- Atribuído ao produto `produto1` o endereço oficial:

## [v1.11.2] – 2025-05-31

**Tipo:** 🐛 Correção + 🧠 Validação semântica + 🔍 Rastreabilidade

---

### 🐛 Correção de Validação Inteligente – Campo `name`

#### Contexto:

Durante os testes, o bot solicitava o nome do cliente mais de uma vez mesmo após o dado já ter sido informado. Isso indicava falhas na validação e na coleta inteligente do campo `name`, causando loops desnecessários no início da conversa.

---

### ✅ Melhorias Aplicadas

#### 1. Reforço de validação em `validadorMultiplos.ts`

- Criada função `contemValorProibido()` para bloquear valores genéricos ou inválidos como:
  - `"cliente"`, `"oi"`, `"teste"`, `"atendente"`
- Aplicada também em campos como:
  - `budget`, `address`, `payment_method`, `feedback`

#### 2. Validação especial para `address`

- Verifica se o produto exige endereço via `requires_address`.
- Se não exigir, o campo é salvo como `null` e registrado no MongoDB como "não aplicável".

#### 3. Logs de rastreabilidade

- Adicionados `logger.warn`, `logger.info`, `logger.debug` em todos os pontos críticos.
- Cada campo rejeitado informa o motivo (blacklist, IA, ou regra do produto).

#### 4. Fluxo progressivo e natural de coleta

- Agora o bot aceita um nome simples como “Maurício” na etapa de abordagem.
- O nome completo (primeiro + segundo) só será solicitado no checklist final de fechamento.

---

### 🧪 Cenários Mapeados (validados ou previstos)

| Situação                           | Resultado esperado           |
| ---------------------------------- | ---------------------------- |
| “meu nome é cliente”               | ❌ Rejeitado, pede novamente |
| “meu nome é Maurício”              | ✅ Aceito e salvo            |
| `address` em produto que não exige | ✅ Não solicitado nem salvo  |
| `budget = "qualquer valor"`        | ❌ Rejeitado                 |
| `feedback = "ok"`                  | ❌ Rejeitado por ambiguidade |

---

### 📁 Arquivos Modificados

- `src/services/validadorMultiplos.ts`
- `src/services/dataExtractor.ts`
- `src/services/conversationManager.ts`
- `src/utils/logger.ts`

---

**Comando Git sugerido:**

`````````bash
git tag -a v1.11.2 -m "fix: reforço de validação no campo name com blacklist, tratamento progressivo e logs detalhados"
git push origin v1.11.2


## [v1.11.1] – 2025-05-30

**Responsável:** Dev Full Stack
**Tipo:** ✨ Melhoria de lógica adaptativa + 🤖 IA estratégica

---

### ✨ Implementação de Levantamento Adaptativo via IA

#### Objetivo:

Tornar a etapa de **levantamento** mais inteligente e empática, adaptando a abordagem do bot conforme o **nível de objeção percebido** nas mensagens do cliente.

---

### 🔧 Alterações Técnicas

#### 1. Integração com `objectionMonitor.ts`

- Criada a função `decidirModoLevantamento()`, chamada dentro de `conversationManager.ts` apenas quando:

  - `nextState === 'levantamento'`
  - A variável `.env` `LEVANTAMENTO_ADAPTATIVO=true`

- A IA analisa a última mensagem do cliente para decidir entre:
  - **Modo "leve"** – abordagem direta e objetiva
  - **Modo "profundo"** – abordagem com empatia, perguntas exploratórias e reforço de valor

#### 2. Geração de prompt adaptado

- A função `levantamentoPrompt(modo)` gera o prompt personalizado conforme a decisão da IA.
- Uma instrução de rastreabilidade (`⚙️ MODO DE LEVANTAMENTO: ...`) é injetada no `systemPrompt`.

#### 3. Isolamento da funcionalidade

- A lógica foi encapsulada sem afetar o restante do fluxo.
- Quando a flag não está ativa, o bot segue com o comportamento tradicional.

---

### 📌 Observações Técnicas

- A funcionalidade está **desativada por padrão**, ativável via `.env`.
- A estrutura está pronta para evoluir, futuramente, com histórico completo e aprendizado contínuo.
- Rastreabilidade e logs garantidos via `logger.ts`.

---

### 📁 Arquivo Modificado

- `src/services/conversationManager.ts`

---

**Comando Git sugerido:**

````````bash
git tag -a v1.11.1 -m "feat: lógica adaptativa para etapa levantamento com decisão inteligente via IA"
git push origin v1.11.1



## [v1.11.0] – 2025-05-30

Tipo: ✨ Funcionalidade inteligente + ✅ Verificação adaptativa + 🧠 IA contextual

✨ Novas Funcionalidades Inteligentes

1. Verificação de Contradições
   Novo módulo verificadorContradicoes.ts criado para detectar inconsistências nas respostas do cliente.

Comparação entre dados novos e históricos, com log automático e revalidação via IA.

Exemplo de detecção: dois nomes diferentes ou orçamentos conflitantes.

📁 Arquivos Envolvidos:

src/services/verificadorContradicoes.ts ✅

src/services/conversationManager.ts

src/services/validadorIA.ts

src/services/resumoDoHistorico.ts

src/utils/logger.ts

2. Checklist de Dados Mínimos no Fechamento
   Novo módulo checklistFechamento.ts garante que os campos essenciais estejam preenchidos antes de concluir a venda.

Caso falte alguma informação, o bot solicita de forma natural e empática.

✅ Campos obrigatórios:

name

needs

budget

payment_method

address

confirmacao

📁 Arquivos Envolvidos:

src/services/checklistFechamento.ts ✅

src/services/conversationManager.ts

src/meta/metaPorEtapa.ts

src/utils/logger.ts

🧱 Integrações Arquiteturais
Arquivo Ação Técnica
conversationManager.ts Integra os dois novos serviços no fluxo do bot
metaPorEtapa.ts Define os campos obrigatórios por etapa
validadorIA.ts Revalidação inteligente dos dados e contradições
resumoDoHistorico.ts Exibe histórico relevante para comparação de IA
logger.ts Logs padronizados e rastreáveis de anomalias

⚠️ Controles e Cuidados Adotados
Risco Mitigação aplicada
Bot parecer rude ao corrigir cliente Uso do humanizer.ts para respostas sutis
Mudanças legítimas tratadas como contradição IA contextual valida se há justificativa válida
Vendas incompletas por dados faltantes Checklist obrigatório e retorno automático ao cliente

## [v1.10.1] – 2025-05-30

**Tipo:** ♻️ Refatoração + ✏️ Documentação + 📈 Rastreamento + 🛡️ Segurança

---

### ♻️ Refatorações Técnicas

#### `src/server.ts`

- Adicionado prefixo `[bootstrap]` nos logs.
- JSDoc descritivo na função `bootstrap()`.
- Tipagem explícita como `Promise<void>`.
- Estrutura sequencial preservada para facilitar depuração.

#### `src/app.ts`

- Comentários JSDoc explicando a função `createApp()`.
- Comentários por middleware (helmet, cors, swagger).
- Padronização de logs com prefixo `[app]`.

#### `src/api/openai.ts`

- JSDoc completo para a função `createChatCompletion()`.
- Proteção contra `undefined` ou content inválido nos logs.
- Tratamento de erro seguro com `unknown` e validação de tipo.
- Mantido fallback de temperatura original.

---

### 📈 Melhoria de Rastreamento e Logs

#### `src/api/whatsapp.ts`

- Logs com prefixos contextuais: `[sendText]`, `[sendMedia]`, `[whatsapp]`.
- Truncamento aplicado para mensagens longas.
- JSDoc adicionado a todas as funções públicas:
  - `sendText`
  - `sendAudio`
  - `downloadMedia`
  - `uploadAudioAndGetMediaId`
  - `sendMedia`
- Prevenção contra erros silenciosos com estrutura segura.

---

### 📁 Arquivos Modificados

- `src/server.ts`
- `src/app.ts`
- `src/api/openai.ts`
- `src/api/whatsapp.ts`

---

### 🔒 Observações Técnicas

- Nenhuma alteração de lógica funcional.
- Refatorações visam legibilidade, documentação e rastreabilidade técnica.
- 100% compatível com as versões anteriores.

---

**Comando Git sugerido:**

```````bash
git tag -a v1.10.1 -m "refactor: melhorias em rastreamento, documentação e segurança nos arquivos de API e servidor"
git push origin v1.10.1


## [v1.10.0] – 2025-05-29

**Tipo:** ✨ Melhoria estratégica + 🧱 Refatoração estrutural

---

### ✨ Nova Estrutura de Negociação por Produto

- Adicionado campo `negociacao` ao `produtoMap.ts`, com estrutura:
  - `preco_base`, `desconto_pix`, `preco_com_desconto`, `condicao_para_desconto`, `observacoes`
- Informações migradas dos prompts para a ficha de produto
- Elimina duplicações e valores hardcoded nos prompts
- Permite que `conversationManager.ts` injete as regras no `systemPrompt`

---

### 🧠 IA com Consciência de Histórico Comercial

- `resumoDoHistorico.ts` agora inclui `negotiated_price` e `desconto` no resumo estratégico
- Instrução à IA atualizada para evitar retornar ao preço cheio se o cliente já negociou
- Aumenta a coerência das respostas e evita contradições em etapas avançadas

---

### 📁 Arquivos Modificados

- `src/produto/produtoMap.ts`
- `src/services/resumoDoHistorico.ts`

---

### 📌 Status

- ✅ `produtoMap.ts` atualizado com campo `negociacao`
- ✅ `resumoDoHistorico.ts` injeta informações de negociação
- ⏳ Em andamento: `conversationManager.ts`, `07-negociacao.ts`, `types/Produto.ts`

---

**Comando Git para registrar:**

``````bash
git tag -a v1.10.0 -m "feat: estrutura padronizada de negociação por produto e IA com consciência de histórico comercial"
git push origin v1.10.0


## [v1.9.3-dev] – Em desenvolvimento

**Tipo:** ✨ Melhoria + 🧠 Inteligência adaptativa + 🛠️ Refatoração leve

---

### ✨ Melhoria – Abordagem inicial com coleta de nome

- Agora o bot verifica se o nome do cliente está ausente (`!client.name` ou `'cliente'`) e inicia a conversa cumprimentando e solicitando o nome de forma humanizada.
- A IA impede o avanço no funil até que o nome seja coletado com sucesso.
- Instruções adicionadas ao `systemPrompt` para:
  - Cumprimentar gentilmente
  - Pedir o nome com educação
  - Adaptar a linguagem ao estilo do cliente

📁 Arquivos Impactados:

- `src/services/conversationManager.ts`
- `src/services/resumoDoHistorico.ts`
- `src/services/validadorMultiplos.ts`

---

### 🧠 Inteligência – Extração de nome com fallback via IA

- A função `extractName()` agora tenta:
  1. Regex via `extractNameSmart()`
  2. Fallback com OpenAI (prompt: _"Extraia o primeiro nome da pessoa..."_)
- Adicionados logs detalhados indicando se foi usado regex ou IA, e qual valor foi extraído.
- Melhora a taxa de identificação do nome mesmo com frases informais como "sou o João da barbearia" ou "é a Lu".

📁 Arquivo:

- `src/services/dataExtractor.ts`

---

### 🔧 Lógica condicional de validação por produto

- `validadorMultiplos.ts` agora considera a configuração de cada produto (`requires_address`) para rejeitar ou aceitar campos dinamicamente.
- Campos como `address` são salvos como `null` e logados no MongoDB caso não se apliquem ao produto.

📁 Arquivo:

- `src/services/validadorMultiplos.ts`

---

### 🔁 Ajuste em IA de negociação (BOT-NEG-001)

- IA instruída a aceitar valores negociados coerentes na etapa `negociação`, mesmo que com reciprocidade (ex: desconto via PIX).
- Garante que `negotiated_price` seja extraído e validado sem bloqueio injustificado.

📁 Arquivo:

- `src/services/validadorIA.ts`

---

### 🧪 Status Atual

- Aguardando validação em ambiente de QA e testes de fluxo completo
- Mudanças ainda não tagueadas – entrada provisória até conclusão

---

## [v1.9.2] – 2025-05-29

**Tipo:** 🛠️ Correções técnicas (tipagem + build)

**Descrição:**
Correções específicas na tipagem da interface `Client` e nos arquivos que a utilizam, com o objetivo de eliminar erros de compilação e reforçar a consistência do sistema tipado. Ajustes também aplicados ao uso indevido de `as any`.

---

### 🛠️ Ajustes de Tipagem e Build

- Corrigida importação incorreta do tipo `Client` no arquivo `resumoDoHistorico.ts`
  - Substituído `import { Client } from './clientRepository'` por `import type { Client } from '../types/Client'`
- Remoção de casts `as any` desnecessários em propriedades como:
  - `cliente.expectations`
  - `cliente.urgency_level`
  - `cliente.client_stage`
- Garantia de consistência e integridade com a interface `Client.ts`, agora unificada e centralizada.

---

### 📁 Arquivos Modificados

- `src/services/resumoDoHistorico.ts`
- `src/types/Client.ts` (confirmado alinhamento com campos usados)

---

**Comando Git:**

`````bash
git tag -a v1.9.2 -m "fix: correção de tipagem da interface Client e remoção de casts inseguros"
git push origin v1.9.2


## [v1.9.1] – 2025-05-29

**Tipo:** feat + refactor + test + infra

**Objetivo:**
Aprimorar a inteligência adaptativa do bot, validar dados via IA antes de salvar, aplicar extração e análise por etapa do funil, e garantir rastreabilidade total via logs e testes. Refatorações foram feitas para consolidar comportamento centralizado, modular e confiável.

---

### ✅ Funcionalidades Incluídas

#### 1. Extração e Validação de Dados com IA

- Novo módulo `validadorIA.ts` para validação inteligente dos dados extraídos com auxílio da OpenAI.
- Reformulação automática da pergunta se o dado extraído for inválido.
- Fallback para `null` com log de rejeição no MongoDB (`rejectionLog.mongo.ts`).

#### 2. Novos Campos Estratégicos Suportados

- Inclusão dos campos: `disponibilidade`, `motivo_objeção`, `alternativa`, `desconto`, `forma_pagamento`, `confirmacao`, `feedback`, `indicacao`.
- Criação de `CampoCliente.ts` como fonte única da verdade com todos os campos persistidos.

#### 3. Análise de Histórico e Inteligência de Resumo

- Geração automática de resumo do cliente com base nos dados salvos no MySQL.
- Injeção do resumo no `systemPrompt` da IA para adaptar o comportamento do bot.

#### 4. Integração com MongoDB

- Auditoria completa de dados rejeitados, histórico de interação, temperatura da conversa, análises e comportamento adaptativo.
- Logs com `executionId` e `clientId` para rastreabilidade total.

---

### 🧱 Refatorações Arquiteturais

- `conversationManager.ts` agora centraliza toda lógica de resposta e persistência.
- `clientRepository.ts` e `clientProfileRepository.ts` separados para responsabilidades distintas.
- `stateMachine/index.ts` adaptada para aceitar transição por IA e fallback.
- `intentMap.ts` e `dynamicClientMonitor.ts` otimizados para leitura e ajustes contextuais.

---

### 🧪 Testes Automatizados

- Novos testes unitários e de integração com foco em:
  - Validação de dados por IA (`validadorIA.test.ts`)
  - Interações com MongoDB (`test-mongo.test.ts`)
  - Conversas com resposta de áudio (`voiceMessage.integration.test.ts`)
  - Persistência e recuperação de dados de perfil
  - Integração completa dos prompts por etapa

---

### 📁 Arquivos Criados ou Modificados

- `src/services/validadorIA.ts`
- `src/services/resumoDoHistorico.ts`
- `src/services/dynamicClientMonitor.ts`
- `src/services/clientProfileRepository.ts`
- `src/services/aiStateDecider.ts`
- `src/services/humanizer.ts`
- `src/repositories/mongo/rejectionLog.mongo.ts`
- `src/repositories/interactionsRepository.ts`
- `src/controllers/webhookController.ts`
- `src/persona/botPersona.ts`
- `src/prompts/*.ts` (atualização dos 9 prompts com metas e variações)
- `src/api/openai.ts`, `src/api/whatsapp.ts`
- `src/middlewares/*.ts` (ajustes em validation e error)
- `src/utils/logger.ts`, `src/utils/mongo.ts`
- `src/tests/integration/*.test.ts`, `src/tests/unit/*.test.ts`

---

### 🏁 Próximos Passos

- Criar painel administrativo para visualizar estado do funil e dados extraídos.
- Integrar Prometheus e Grafana para monitoramento em tempo real.
- Iniciar etapa SaaS com múltiplos bots e contas B2B isoladas.

---

**Comando Git:**

````bash
git tag -a v1.9.1 -m "feat: IA adaptativa, extração inteligente, validação de dados e auditoria com Mongo"
git push origin v1.9.1


## \[v1.8.0] – 2025-05-15

**Tipo:** feat + infra + refactor

**Objetivo:**
Integração completa da XState State Machine para controle do funil de vendas e instrumentação de logs com Winston em todos os principais arquivos do backend, garantindo rastreabilidade total e escalabilidade futura.

### ✅ Funcionalidades Incluídas

#### 1. Nova Máquina de Estados com XState

- Implementada a `funnelMachine` com os estados:
  `abordagem → levantamento → proposta → objecoes → negociacao → fechamento → pos_venda → reativacao → encerramento`
- Transições controladas via eventos `INTENT`
- Lógica de `retries` com encerramento automático após 3 falhas

#### 2. Persistência de Estado e Contador

- Campo `retries` adicionado ao banco
- Atualização automática de estado e tentativas no `ClientRepository`

#### 3. Logs Winston Aplicados

Adicionados logs com níveis `debug`, `info`, `warn` e `error` nos seguintes arquivos:

| Arquivo                                    | Escopo dos Logs                                      |
| ------------------------------------------ | ---------------------------------------------------- |
| `src/services/conversationManager.ts`      | Transições, intents, atualizações no banco, GPT      |
| `src/stateMachine/index.ts`                | Criação da máquina, eventos INTENT, contadores       |
| `src/services/clientRepository.ts`         | Consultas, updates e inserções de clientes           |
| `src/services/intentFallback.ts`           | Consultas à IA para fallback e validação de resposta |
| `src/services/audioService.ts`             | Transcrição Whisper e síntese ElevenLabs             |
| `src/services/dataExtractor.ts`            | Extração de nome, valor, endereço, pagamento         |
| `src/api/openai.ts`                        | Inicialização e falhas no cliente da OpenAI          |
| `src/api/whatsapp.ts`                      | Envio/recebimento de mensagens via Meta API          |
| `src/controllers/webhookController.ts`     | Verificação e recebimento de mensagens do webhook    |
| `src/utils/db.ts`                          | Teste e falhas na conexão com banco                  |
| `src/middlewares/errorMiddleware.ts`       | Tratamento global de erros                           |
| `src/middlewares/rateLimiterMiddleware.ts` | Requisições bloqueadas                               |
| `src/middlewares/validationMiddleware.ts`  | Erros de payload inválido com Zod                    |
| `src/produto/produtoMap.ts`                | Leitura e fallback do produto                        |
| `src/index.ts` e `src/server.ts`           | Inicialização completa                               |

### 🧪 Testes

- Todas as rotas respondendo corretamente
- Máquina de estados salvando estado e retries
- Logs rastreáveis exibindo o ciclo da requisição
- Nenhum erro de compilação

### 📁 Arquivos Criados ou Modificados

- `src/stateMachine/index.ts`
- `src/services/conversationManager.ts`
- `src/services/clientRepository.ts`
- `src/services/intentFallback.ts`
- `src/services/audioService.ts`
- `src/services/dataExtractor.ts`
- `src/api/openai.ts`
- `src/api/whatsapp.ts`
- `src/controllers/webhookController.ts`
- `src/utils/db.ts`
- `src/utils/logger.ts`
- `src/middlewares/errorMiddleware.ts`
- `src/middlewares/validationMiddleware.ts`
- `src/middlewares/rateLimiterMiddleware.ts`
- `src/produto/produtoMap.ts`
- `src/index.ts`, `src/server.ts`

### 🏁 Próximos Passos

- Criar testes automatizados para transições da XState
- Criar dashboard com estados e métricas por cliente
- Automatizar verificação de variáveis `.env`

**Comando Git:**

```bash
git tag -a v1.8.0 -m "Versão 1.8.0 - Projeto atualizado com XState e logs completos"
git push origin v1.8.0
`````````

---

## \[v1.7.1] – 2025-05-14

**Objetivo:**
Remoção de dados sensíveis e recriação do commit limpo

**Funcionalidades:**

- Exclusão do `.env.local` do controle de versão
- Atualização do `.gitignore`

**Comando Git:**

```bash
git tag -a v1.7.1 -m "fix(v1.7.1): recria commit sem chaves sensíveis"
git push origin v1.7.1
```

---

## \[v1.7.0] – 2025-05-11

**Objetivo:**
Início da extração e persistência de dados por etapa do funil

**Funcionalidades:**

- Adição de campos no banco para armazenar etapa atual e dados extraídos
- Lógica de salvamento automático por estado
- Testes de integração cobrindo clientRepository e flow

**Comando Git:**

```bash
git tag -a v1.7.0 -m "Release v1.7.0 - Extração de dados por etapa e testes"
git push origin v1.7.0
```

---

(As versões anteriores a v1.6.0 já estavam no changelog original e foram mantidas conforme o arquivo enviado)

## \[v1.6.0] – 2025-05-10

**Objetivo:**
Adicionar suporte completo a mensagens de voz (áudio), permitindo que o bot transcreva áudios recebidos via WhatsApp (STT) e responda com mensagens faladas (TTS), aumentando a naturalidade da interação.

**Funcionalidades Implementadas:**

- Reconhecimento de Áudio com OpenAI Whisper:

  - Ao receber uma mensagem de áudio (message.type === 'audio'), o bot realiza:

    - Download do arquivo com `downloadMedia(mediaId)`
    - Transcrição com `transcribeAudio(buffer)` usando a Whisper API
    - Injeção do texto transcrito no pipeline de resposta da conversa (state machine, intentMap, prompts)

- Geração de Áudio com ElevenLabs:

  - A resposta do bot é transformada em áudio com `synthesizeSpeech(text)`
  - O buffer gerado é enviado ao WhatsApp usando `sendAudio(phone, buffer)` após upload
  - Regra aplicada: se a entrada for áudio, a resposta será em áudio

**Arquivos Modificados/Criados:**

- `src/services/audioService.ts`: centraliza transcrição e síntese de voz
- `src/controllers/webhookController.ts`: detecta e trata mensagens de áudio, injeta texto no flow
- `src/services/conversationManager.ts`: processa entrada e retorna texto ou áudio
- `src/api/whatsapp.ts`: inclui `downloadMedia()` e `sendAudio()`

**Testes:**

- `audioService.test.ts`: mocks da Whisper e ElevenLabs para testar fluxo de sucesso e falha
- `voiceMessage.integration.test.ts`: simula payload do WhatsApp com áudio e valida resposta com áudio
- `webhook.e2e.test.ts`: testa comportamento real com message.type === 'audio'

**Variáveis de Ambiente Novas:**

```env
# Whisper API
OPENAI_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

**Compatibilidade e Observações Técnicas:**

- Mensagens de texto continuam funcionais
- Falhas no STT ou TTS são tratadas com fallback em texto
- Código modular permite trocar provedores de áudio futuramente
- Integração transparente ao fluxo existente do bot

**Comando Git:**

```bash
git tag -a v1.6.0 -m "feat: suporte completo a mensagens de voz (STT e TTS)"
git push origin v1.6.0
```

---

\[...texto das versões v1.5.0 a v1.3.0 inalterado, mantido acima...]

---

## \[v1.2.0] – 2025-05-06

**Objetivo:**
Finalizar a Dockerização do projeto e realizar o deploy para VPS com configuração de ambiente de produção.

**Funcionalidades Implementadas:**

- Criação de `Dockerfile` com build multi-stage
- Criação de `docker-compose.yml` com serviços para:

  - `app`: serviço principal do bot
  - `mysql`: banco de dados com volume persistente

- Deploy em VPS com Ubuntu 20.04
- Subida do projeto via Git, build com Docker e exposição do serviço com porta 3000
- Testes locais e em produção com `ngrok` e tokens temporários da Meta

**Arquivos Modificados/Criados:**

- `Dockerfile`
- `docker-compose.yml`
- `.env.production` e `.env.local`

**Testes:**

- `docker-compose up` levanta os serviços corretamente
- Verificação de acesso ao endpoint `/webhook`

**Compatibilidade:**

- Padronização total do ambiente local e produção

**Comando Git:**

```bash
git tag -a v1.2.0 -m "feat: dockerização e deploy completo do bot para VPS"
git push origin v1.2.0
```

---

## \[v1.1.0] – 2025-04-30

**Objetivo:**
Concluir infraestrutura base com documentação, testes e CI/CD estáveis

**Funcionalidades:**

- Swagger UI ativado com `swagger-jsdoc` e `swagger-ui-express` na rota `/api-docs`
- JSDoc nas rotas e controllers
- GitHub Actions configurado com lint e testes (`npm test`)
- Disparo automático do workflow em branches `main`, `develop` e tags `v*.*.*`
- Atualização do `README.md` com instruções de uso

**Arquivos:**

- `.github/workflows/ci.yml`
- `src/app.ts`
- `README.md`

**Compatibilidade:**

- Código padronizado, testado e validado via CI

**Comando Git:**

```bash
git tag -a v1.1.0 -m "Release v1.1.0 - CI/CD, Swagger docs e estabilização final"
git push origin v1.1.0
```

---

## \[v1.0.1] – 2025-04-29

**Objetivo:** Correção menor e estabilização geral.

**Funcionalidades:**

- Atualização de pacotes
- Validação da cobertura de testes

**Comando Git:**

```bash
git tag -a v1.0.1 -m "chore(release): v1.0.1"
git push origin v1.0.1
```

---

## \[v0.4.0] – 2025-04-28

**Objetivo:** Adicionar servidor Express e ponto de entrada da aplicação

**Funcionalidades:**

- `app.ts` com configurações de segurança, CORS, body-parser, e rota `/webhook`
- `server.ts` para levantar aplicação com Express

**Comando Git:**

```bash
git tag -a v0.4.0 -m "feat(app-server): add express app and server entrypoint"
git push origin v0.4.0
```

---

## \[v0.3.0] – 2025-04-28

**Objetivo:** Finalizar Etapa 7 – Implementação de serviços internos

**Funcionalidades:**

- `clientRepository.ts`: CRUD básico com mysql2
- `humanizer.ts`: funções delay e variação
- `conversationManager.ts`: orquestra fluxo de conversa

**Comando Git:**

```bash
git tag -a v0.3.0 -m "feat: finaliza etapa 7 - serviços e atualiza changelog detalhado"
git push origin v0.3.0
```

---

## \[v0.2.0] – 2025-04-27

**Objetivo:** Adicionar middlewares principais

**Funcionalidades:**

- `errorMiddleware.ts`: trata erros genéricos
- `validationMiddleware.ts`: usa `zod` para validar `req.body`
- `rateLimiterMiddleware.ts`: com rate-limiter-flexible

**Comando Git:**

```bash
git tag -a v0.2.0 -m "feat: middlewares de error, validation e rate limiter implementados"
git push origin v0.2.0
```

---

## \[v0.1.1-mvp1] – 2025-04-26

**Objetivo:** Criar changelog inicial do MVP1

**Funcionalidades:**

- Documentação inicial do que foi implementado no MVP1

**Comando Git:**

```bash
git tag -a v0.1.1-mvp1 -m "docs: criação do changelog v0.1.1-mvp1"
git push origin v0.1.1-mvp1
```

---

## \[v0.1.0-mvp1] – 2025-04-26

**Objetivo:** MVP com infraestrutura básica e testes

**Funcionalidades:**

- Conexão inicial com OpenAI e Twilio
- Setup básico para simulação de mensagens

**Comando Git:**

```bash
git tag -a v0.1.0-mvp1 -m "feat: infraestrutura de teste e clients OpenAI/Twilio funcionando"
git push origin v0.1.0-mvp1
```

---

## \[v0.0.1-alpha] – 2025-04-24

**Objetivo:** Setup inicial do projeto

**Funcionalidades:**

- Estrutura inicial do projeto com TypeScript, Express, Git, ESLint
- Configurações básicas de ambiente `.env` e `.gitignore`

**Comando Git:**

```bash
git tag -a v0.0.1-alpha -m "chore(setup): estrutura inicial do projeto"
git push origin v0.0.1-alpha
```

---
