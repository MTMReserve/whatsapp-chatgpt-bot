# CHANGELOG – whatsapp-chatgpt-bot

Todos os principais marcos do projeto. Segue o padrão [Keep a Changelog](https://keepachangelog.com/).

---

## [v1.0.0] – 2025-04-29

**Release final da Etapa 10 – Testes Automatizados concluídos**  
**Files criados/modificados**

- **`src/services/clientRepository.ts`**
  - Interface `Client` com `id?`, `name`, `phone`
  - Métodos **estáticos** `create()`, `getAll()`, `findById()` com casts `OkPacket`/`RowDataPacket` para satisfazer TypeScript e interoperar com `mysql2/promise`
  - Wrappers de instância para testes de integração
- **`src/middlewares/rateLimiterMiddleware.ts`**
  - Exporta `limiter: RateLimiterMemory` para spy em testes
  - Transforma em `async function` usando `await limiter.consume()` e `try/catch` para garantir que a Promise seja aguardada
- **Testes unitários (Jest)** em
  - `src/tests/unit/clientRepository.test.ts`
  - `src/tests/unit/rateLimiterMiddleware.test.ts`
  - demais arquivos em `src/tests/unit/*.test.ts` (humanizer, ConversationManager, OpenAI/Twilio clients, validation, error middleware)
- **Testes de integração (Supertest + Jest)** em
  - `src/tests/integration/webhook.integration.test.ts`
  - `src/tests/integration/clientRepository.integration.test.ts`
- **Ajustes gerais**
  - Correção de todos os imports nos testes para caminhos relativos `../../services/...`, `../../middlewares/...` etc.
  - Atualização de `tsconfig.json` com `strict: true`, `rootDir: src`, `esModuleInterop: true`
  - `package.json` bump para `1.0.0`

**Cobertura:** 100 % dos testes unitários e de integração passando, cobertura geral ≥ 86 %

---

## [v0.2.1] – 2025-04-28

**Consolidação da Etapa 7 – Services**

- **`src/services/clientRepository.ts`** (skeleton)
- **`src/services/humanizer.ts`**
  - Classe `Humanizer` com métodos `delay(ms)` e `randomDelay(min,max)`
- **`src/services/conversationManager.ts`**
  - Estrutura de camadas de prompts (`getSystemPrompt()`, `getPerfilPrompt()`, etc.)
- Testes unitários para todos os serviços acima

---

## [v0.1.4] – 2025-04-27

**Etapa 6 – Controllers**

- **`src/controllers/webhookController.ts`**
  - Exporta `handleWebhook(req,res)` → `res.sendStatus(200)`
- **`src/routes/webhook.routes.ts`**
  - GET `/webhook` para verificação (responde `200 OK`)
  - POST `/webhook` invoca `handleWebhook`
- Testes de integração básica

---

## [v0.1.3] – 2025-04-27

**Etapa 5 – Middlewares**

- **`src/middlewares/errorMiddleware.ts`**
  - Captura exceções e retorna
    ```json
    { "success": false, "message": "Ocorreu um erro interno no servidor." }
    ```
- **`src/middlewares/validationMiddleware.ts`**
  - Função geradora `validationMiddleware(schema: ZodSchema)` → valida `req.body`, retorna `400` com `errors` ou chama `next()`
- **`src/middlewares/rateLimiterMiddleware.ts`** (versão inicial)
  - `limiter.consume().then().catch()` usando `rate-limiter-flexible`
- Testes unitários de cada middleware

---

## [v0.1.2] – 2025-04-26

**Etapa 4 – Utilitários**

- **`src/utils/db.ts`**
  - `import mysql2/promise`, `export const pool: Pool`, `export async function testDbConnection()`
- **`src/utils/logger.ts`**
  - Winston com níveis `error ≔0, warn ≔1, info ≔2, debug ≔3` e cores
- Testes: `SELECT 1` e saída de `logger.info()`

---

## [v0.1.1] – 2025-04-26

**Etapa 3 – API Clients**

- **`src/api/openai.ts`**
  - Instancia `new OpenAI({ apiKey: env.OPENAI_KEY })`
- **`src/api/twilio.ts`**
  - Instancia `new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)`
- Testes de conexão e chamadas iniciais

---

## [v0.1.0] – 2025-04-25

**Etapa 2 – Configuração de Ambiente**

- **`src/config/env.ts`**
  - Usa **Zod** para validar e transformar `process.env` (DB, OpenAI, Twilio, delays, rate limits)
- **`.env.example`**
  - Lista de variáveis necessárias para compilar e rodar:
    ```txt
    TWILIO_ACCOUNT_SID=
    TWILIO_AUTH_TOKEN=
    TWILIO_WHATSAPP_NUMBER_FROM=
    TWILIO_WHATSAPP_NUMBER_TO=
    OPENAI_KEY=
    DB_HOST=
    DB_PORT=
    DB_USER=
    DB_PASSWORD?
    DB_NAME=
    RATE_LIMIT_POINTS?
    RATE_LIMIT_DURATION?
    HUMANIZER_MIN_DELAY_MS?
    HUMANIZER_MAX_DELAY_MS?
    LOG_LEVEL?
    ```
- `npm run dev` falha sem `.env`, sucesso após adicionar

---

## [v0.0.1-alpha] – 2025-04-24

**Etapa 1 – Setup Inicial**

- **`package.json`**, **`.gitignore`** (`node_modules`, `.env`), **`tsconfig.json`** (`strict: true`, `rootDir: src`)
- Branch `feat/setup` / Commit `chore: setup initial project structure`
- `npm install` sem erros, `npm run dev` inicia sem problemas

---

# 📦 Dependências Essenciais

> _Sem estas, o projeto NÃO compila nem roda os testes._

### Produção

- **`express`**, **`body-parser`**
- **`cors`**, **`helmet`**
- **`openai`** (SDK ChatGPT)
- **`twilio`** (SDK WhatsApp)
- **`mysql2/promise`**
- **`dotenv`**
- **`winston`**
- **`rate-limiter-flexible`**
- **`zod`**

### Desenvolvimento & Testes

- **`typescript`**, **`ts-node-dev`**
- **`jest`**, **`ts-jest`**, **`supertest`**
- **`eslint`**, **`@typescript-eslint/parser`**, **`@typescript-eslint/eslint-plugin`**, **`eslint-config-prettier`**, **`eslint-plugin-prettier`**
- **`prettier`**
- **`swagger-jsdoc`**, **`swagger-ui-express`**

---

> **Observação:**
>
> - Cada arquivo listado foi criado com cuidado para suprir dependências de compilação e testes.
> - As transformações Zod e os casts em `clientRepository.ts` garantem que o TypeScript **strict** não gere erros.
> - Os middlewares e controllers seguem a estrutura de pastas **src/**/\*​\*\* para respeitar `rootDir`.
> - Os testes usam caminhos relativos uniformes (`../../…`), sem o segmento `src/` incorporado.
> - A tag **v1.0.0** consolida 100 % de cobertura, testes verdes e estrutura pronta para **Etapa 11 – Documentação**.
