📋 CHANGELOG - whatsapp-chatgpt-bot

## [v0.2.1] - 2025-04-28

### 🎯 Escopo desta versão

- Conclusão da **Etapa 7 – Services**:
  - Implementação de **ClientRepository**, **Humanizer**, **ConversationManager**.
  - Testes unitários para CRUD de clientes, delays humanizados e carregamento de prompts.

### 🧪 Testes

- **ClientRepository**: criação e busca de cliente dummy.
- **Humanizer**: validação de `delay(ms)` e `randomDelay(min, max)`.
- **ConversationManager**: confirmações de retorno de prompts.

---

## Histórico de Releases e Etapas

### [v0.1.4] - 2025-04-27

**Etapa 6 – Controllers**

- Arquivo `src/controllers/webhookController.ts` criado.
- Rota **POST /webhook** retorna status 200.

### [v0.1.3] - 2025-04-27

**Etapa 5 – Middlewares**

- `errorMiddleware`, `validationMiddleware`, `rateLimiterMiddleware` adicionados.
- Testes de erro 500, payload inválido 400 e limite 429.

### [v0.1.2] - 2025-04-26

**Etapa 4 – Utilitários (DB & Logger)**

- `src/utils/db.ts`: pool MySQL com `mysql2/promise`, export `pool` e `testDbConnection()`.
- `src/utils/logger.ts`: Winston configurado para console.
- Testes: `SELECT 1` e saída de `logger.info` validada.

### [v0.1.1] - 2025-04-26

**Etapa 3 – API Clients**

- `src/api/openai.ts`: cliente OpenAI instanciado com `import OpenAI from 'openai'`.
- `src/api/twilio.ts`: cliente Twilio configurado com credenciais.
- Testes unitários de conexão e chamadas básicas.

### [v0.1.0] - 2025-04-25

**Etapa 2 – Configuração de Ambiente e Validação**

- `src/config/env.ts` com Zod para validar `process.env`.
- `.env.example` criado listando todas as variáveis (
  TWILIO*SID, TWILIO_TOKEN, TWILIO_WHATSAPP_NUMBER*{TO,FROM},
  OPENAI*KEY, DB*{HOST,PORT,USER,PASSWORD,NAME}, …
  ).
- Validação de env no bootstrap (`loadEnv()`).

### [v0.0.1-alpha] - 2025-04-24

**Etapa 1 – Setup Inicial**

- Estrutura inicial gerada:
  - `package.json`, `.gitignore`, `tsconfig.json`
  - Branch `feat/setup`, commit `chore: setup initial project structure`.
- Testes básicos:
  - `npm install` sem falhas.
  - `npm run dev` inicia sem erros.

---

## 📦 Dependências Essenciais

(sem estas o projeto NÃO COMPILA)

**Produção**

- `express`, `body-parser` (parser JSON)
- `axios` (chamadas HTTP)
- `openai` (SDK ChatGPT)
- `twilio` (SDK WhatsApp)
- `mysql2` (pool MySQL)
- `dotenv` (carregamento de .env)
- `helmet`, `cors` (segurança HTTP)
- `winston` (logging)
- `rate-limiter-flexible` (rate limiting)
- `zod` (validação de ENV e payloads)

**Desenvolvimento & Testes**

- `typescript`, `ts-node-dev` (transpilação e reload)
- `jest`, `ts-jest`, `supertest` (testes unitários e integração)
- `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-prettier` (linting)
- `prettier` (formatação)
- `swagger-jsdoc`, `swagger-ui-express` (documentação OpenAPI)

---
