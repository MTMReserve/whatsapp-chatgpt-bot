## \[v1.8.0] – 2025-05-15

**Responsável:** Maurício Freitas
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
```

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
