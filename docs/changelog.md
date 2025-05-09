# Changelog – Bot WhatsApp com ChatGPT

## [v1.3.0] – 2025-05-09

### ✅ Objetivo

Implementar uma **persona definida** para o bot e tornar suas interações mais **humanizadas**, simulando comportamento de digitação, adaptando linguagem e adicionando variação textual.

---

### ✨ Funcionalidades Implementadas

- **Persona do Bot ativada**:

  - Arquivo `botPersona.ts` criado com descrição de comportamento, tom, vocabulário e expressões favoritas.
  - Prompt de sistema adaptado para usar a persona (Leo).

- **Estrutura de Prompts reorganizada e padronizada**:

  - Todos os prompts nomeados por estado (`abordagemPrompt`, `propostaPrompt`, etc.).
  - Arquivo `prompts/index.ts` atualizado com `Record<BotState, string>` e `BotState` definido.

- **Funções de humanização** adicionadas (`humanizer.ts`) com:

  - `delay(ms: number)` — pausa antes da resposta.
  - `randomDelay(min, max)` — sorteio de tempo de digitação.
  - `randomizeText(options: string[])` — sorteio de frases variadas.

- **Integração no conversationManager**:
  - O bot agora aguarda de **2s a 6s** antes de responder, variando de acordo com o tamanho da resposta.
  - O tempo de espera simula um comportamento humano (como se estivesse digitando).
  - A resposta do ChatGPT já vem influenciada pela persona e pelo produto ativo.

---

### 🧪 Testes realizados

- ✅ Projeto compila sem erros (`npm run build`)
- ✅ Servidor inicia e responde (`npm run dev`)
- ✅ Testes manuais confirmaram o delay intencional nas respostas.
- ✅ Confirmado que o prompt gerado inclui produto + persona + etapa atual do funil.
- 🔜 Testes unitários de `humanizer.randomizeText()` serão incluídos na próxima versão.

---

### 🔄 Arquivos Criados/Modificados

- `src/services/humanizer.ts` – criado com funções de delay e randomização.
- `src/services/conversationManager.ts` – modificado para aplicar delay de digitação e concatenar persona + produto ao systemPrompt.
- `src/persona/botPersona.ts` – criado com personalidade Leo.
- `src/prompts/*.ts` – criados e padronizados os arquivos de prompt por estágio.
- `src/prompts/index.ts` – atualizado para importar/exportar corretamente os prompts.

---

### 🏁 Versão publicada

`v1.3.0` (data: 2025-05-09)

---

### 🔜 Próximo passo: `v1.4.0`

Implementar:

- **Intent Map por palavras-chave**
- **Máquina de Estados**
- **Persistência do estado da conversa**
- **Roteamento de prompts com base no estágio identificado**

---

## [v1.1.0] – 2025-04-30

**Release final das Etapas 11 a 13 – Documentação, CI/CD e versão final**

### Etapa 11 – Documentação

- Ativado Swagger UI em `src/app.ts` com:
  - `swagger-jsdoc`
  - `swagger-ui-express`
  - Rota `/api-docs`
- Adicionado JSDoc nas rotas
- Atualizado `README.md` com instruções de instalação e exemplos de uso

### Etapa 12 – CI/CD com GitHub Actions

- Criado workflow `.github/workflows/ci.yml`
  - Roda `npm run lint`
  - Executa `npm test`
- Disparo automático em `main`, `develop`, e `v*.*.*` (tags)

### Etapa 13 – Versão Final e Release

- Atualizado `package.json` para `1.1.0`
- Tag criada com:
  ```bash
  git tag -a v1.1.0 -m "Release v1.1.0 - CI/CD, Swagger docs e estabilização final"
  git push origin v1.1.0
  ```

---

## [v1.0.0] – 2025-04-29

**Etapa 10 – Testes Automatizados**

- **Testes unitários (Jest)** para:
  - `clientRepository.ts`
  - `rateLimiterMiddleware.ts`
  - `humanizer.ts`, `conversationManager.ts`, `OpenAI`, `Twilio`, `validation`, `errorMiddleware`
- **Testes de integração (Supertest + Jest)**:
  - `webhook.integration.test.ts`
  - `clientRepository.integration.test.ts`
- Configurações:
  - `tsconfig.json`: `strict: true`, `esModuleInterop: true`
  - `package.json`: versão `1.0.0`
- Cobertura ≥ 86 %

---

## [v0.2.1] – 2025-04-28

**Etapa 7 – Services**

- `clientRepository.ts`: CRUD básico usando `mysql2/promise`
- `humanizer.ts`: funções `delay(ms)` e `randomDelay(min,max)`
- `conversationManager.ts`: lógica de camadas de prompt
- Testes unitários para todos os serviços

---

## [v0.2.0] – 2025-04-28

**Etapa 8 – Prompts**

- Criados arquivos:
  - `01-sistema.ts`, `02-perfilCliente.ts`, `03-abordagem.ts`, `04-levantamento.ts`, `05-proposta.ts`, `06-negociacao.ts`, `07-posVenda.ts`
- Todos os arquivos exportam uma constante com prompt-base
- Comentários `TODO` incluídos para ajustes de conteúdo

---

## [v0.1.5] – 2025-04-27

**Etapa 9 – App & Server**

- `app.ts`: Express configurado com:
  - `body-parser`, CORS, helmet
  - Middlewares de validação, erro, rate-limit
  - Rota `/webhook`
- `server.ts`: instancia `app` e inicia servidor
- Teste: `npm run dev` funciona corretamente

---

## [v0.1.4] – 2025-04-27

**Etapa 6 – Controllers**

- `webhookController.ts`: exporta `handleWebhook(req, res)` → `res.sendStatus(200)`
- Rota `/webhook` aceita GET e POST
- Testes de integração com Supertest

---

## [v0.1.3] – 2025-04-27

**Etapa 5 – Middlewares**

- `errorMiddleware.ts`: captura erros e retorna 500
- `validationMiddleware.ts`: usa `Zod` para validar `req.body`
- `rateLimiterMiddleware.ts`: `rate-limiter-flexible` com controle de requisições
- Testes unitários para todos os middlewares

---

## [v0.1.2] – 2025-04-26

**Etapa 4 – Utilitários**

- `db.ts`: cria pool MySQL com `mysql2/promise`, função `testDbConnection()`
- `logger.ts`: usa Winston com níveis e cores para o console
- Testes:
  - `SELECT 1` na base
  - `logger.info('test')` imprime corretamente

---

## [v0.1.1] – 2025-04-26

**Etapa 3 – Clientes de API**

- `openai.ts`: instancia `OpenAI({ apiKey })`
- `twilio.ts`: instancia `Twilio(accountSid, authToken)`
- Testes:
  - Listar modelos OpenAI
  - `twilioClient.api.accounts.fetch()` retorna dados da conta

---

## [v0.1.0] – 2025-04-25

**Etapa 2 – Configuração de Ambiente**

- `.env.example` criado com:
  ```env
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_WHATSAPP_NUMBER_FROM=
  TWILIO_WHATSAPP_NUMBER_TO=
  OPENAI_KEY=
  DB_HOST=
  DB_PORT=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
  RATE_LIMIT_POINTS=
  RATE_LIMIT_DURATION=
  HUMANIZER_MIN_DELAY_MS=
  HUMANIZER_MAX_DELAY_MS=
  LOG_LEVEL=
  ```
- `env.ts`: usa `zod` para validar `.env`
- Teste:
  - Sem `.env` → erro de validação
  - Com `.env` válido → sucesso

---

## [v0.0.1-alpha] – 2025-04-24

**Etapa 1 – Setup Inicial**

- Criados arquivos:
  - `package.json` com `npm init -y`
  - `.gitignore` com `node_modules`, `.env`
  - `tsconfig.json`: `strict: true`, `rootDir: src`
- Git:
  - Branch: `feat/setup`
  - Commit: `chore: setup initial project structure`
- Testes:
  - `npm install` sem erros
  - `npm run dev` inicializa o servidor

---

## 📦 Dependências Essenciais

### Produção

- `express`, `body-parser`, `cors`, `helmet`
- `openai`, `twilio`
- `mysql2/promise`, `dotenv`
- `winston`, `rate-limiter-flexible`, `zod`

### Desenvolvimento e Testes

- `typescript`, `ts-node-dev`
- `jest`, `ts-jest`, `supertest`
- `eslint`, `prettier`
- `@typescript-eslint/*`, `eslint-plugin-prettier`, `eslint-config-prettier`
- `swagger-jsdoc`, `swagger-ui-express`

---

> Cada etapa foi testada com scripts e coberta por testes automatizados.  
> A tag `v1.1.0` representa a primeira release final **estável**, com documentação, CI e testes concluídos.
